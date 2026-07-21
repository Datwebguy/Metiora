import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { IStartupBlueprintRepository } from '@core/ports/startup-blueprint-repository.js';
import { IInvestorReadyRepository } from '@core/ports/investor-ready-repository.js';
import { IGrantBuilderRepository } from '@core/ports/grant-builder-repository.js';
import { IPartnershipStudioRepository } from '@core/ports/partnership-studio-repository.js';
import { ITokenLaunchKitRepository } from '@core/ports/token-launch-kit-repository.js';
import { IStartupHealthRepository } from '@core/ports/startup-health-repository.js';
import { A2aServiceAdapter } from '../../okx/adapter/a2a-service-adapter.js';
import type { OkxServiceType } from '@core/domain/okx-integration.js';
import {
  ApplicationError,
  AuthorizationError,
  InfrastructureError,
  NotFoundError,
} from '@shared/errors/application-error.js';
import { assertStartupOwnedByFounder } from '@shared/security/ownership.js';
import { CreateFounderProfile } from '../../memory/user-memory/use-cases/create-founder-profile.js';
import { CreateStartup } from '../../memory/startup-memory/use-cases/create-startup.js';
import {
  A2MCP_ROUTE_PATHS,
  A2MCP_SERVICE_PRICES,
  A2MCP_REQUIRED_BODY_FIELDS,
  A2MCP_OPTIONAL_BODY_FIELDS,
  A2MCP_BODY_MODES,
  A2MCP_PUBLIC_BASE_URL,
  XLAYER_USDT0_ASSET,
  XLAYER_NETWORK,
  type X402ServerBundle,
  type A2mcpServiceKey,
} from '../../okx/x402/payment-server.js';
import { runPaidA2mcpHandler } from '../../okx/x402/fastify-gate.js';
import type { PackageAiRuntime } from '../../ai/resolve-package-ai.js';
import { resolvePackageAi } from '../../ai/resolve-package-ai.js';
import { loadEnvironment } from '../../shared/config/environment.js';

/**
 * Generation budget for paid A2MCP packages.
 * Keep under Fly proxy idle (120s) and x402 maxTimeoutSeconds (300).
 * Room for verify + settle around the business work.
 */
const SERVICE_EXECUTION_TIMEOUT_MS = 55_000;

/** Marketplace-listable products only (exclude internal smoke). */
const LISTABLE_SERVICES = (
  Object.keys(A2MCP_ROUTE_PATHS) as A2mcpServiceKey[]
).filter((s) => s !== 'smoke_test');

const FounderInlineSchema = z.object({
  email: z.string().email().max(320),
  fullName: z.string().min(1).max(200),
  preferredName: z.string().max(120).optional(),
  title: z.string().max(200).optional(),
  bio: z.string().max(4000).optional(),
  country: z.string().max(120).optional(),
  timezone: z.string().max(80).optional(),
  skills: z.array(z.string().max(80)).max(40).optional(),
  industries: z.array(z.string().max(80)).max(20).optional(),
  experienceYears: z.number().min(0).max(80).optional(),
});

const StartupInlineSchema = z.object({
  name: z.string().min(1).max(200),
  tagline: z.string().max(300).optional(),
  oneSentenceDescription: z.string().max(500).optional(),
  industry: z.string().min(1).max(120),
  stage: z.string().max(80).optional(),
  websiteUrl: z.string().max(500).optional(),
  mission: z.string().max(2000).optional(),
  problemStatement: z.string().max(4000).optional(),
  productDescription: z.string().max(4000).optional(),
  businessModel: z.string().max(1000).optional(),
});

const BootstrapSchema = z.object({
  founder: FounderInlineSchema,
  startup: StartupInlineSchema,
});

/**
 * Marketplace-friendly paid body:
 * - founderProfileId + startupProfileId (returning buyers), OR
 * - founder + startup objects (first-time / OKX task buyers; auto-bootstrap)
 */
const PaidBodySchema = z
  .object({
    founderProfileId: z.string().uuid().optional(),
    startupProfileId: z.string().uuid().optional(),
    founder: FounderInlineSchema.optional(),
    startup: StartupInlineSchema.optional(),
    blueprintId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    const hasIds = Boolean(data.founderProfileId && data.startupProfileId);
    const hasInline = Boolean(data.founder && data.startup);
    if (!hasIds && !hasInline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Provide either founderProfileId+startupProfileId, or founder+startup objects (auto-bootstrap on paid call).',
      });
    }
  });

type PaidBodyInput = z.infer<typeof PaidBodySchema>;
type ResolvedPaidProfiles = {
  founderProfileId: string;
  startupProfileId: string;
  blueprintId?: string;
  bootstrapped: boolean;
  founderReused?: boolean;
};

export interface A2mcpRouteDeps {
  userRepo: IUserMemoryRepository;
  startupRepo: IStartupMemoryRepository;
  blueprintRepo?: IStartupBlueprintRepository;
  investorRepo?: IInvestorReadyRepository;
  grantRepo?: IGrantBuilderRepository;
  partnershipRepo?: IPartnershipStudioRepository;
  tokenRepo?: ITokenLaunchKitRepository;
  healthRepo?: IStartupHealthRepository;
  x402: X402ServerBundle;
  /** Optional pre-resolved AI runtime (from server). If omitted, resolved from env. */
  packageAi?: PackageAiRuntime;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(
            new InfrastructureError(
              `${label} timed out after ${ms}ms. Please retry; generation must finish within the client window.`
            )
          );
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function extractPaymentHeader(request: FastifyRequest): string | undefined {
  const sig = request.headers['payment-signature'];
  if (typeof sig === 'string' && sig.length > 0) return sig;
  const xp = request.headers['x-payment'];
  if (typeof xp === 'string' && xp.length > 0) return xp;
  return undefined;
}

async function assertProfilesReadyForPay(
  deps: A2mcpRouteDeps,
  founderProfileId: string,
  startupProfileId: string
): Promise<void> {
  const founder = await deps.userRepo.findById(founderProfileId);
  if (!founder) {
    throw new NotFoundError(
      `Founder profile not found for ID '${founderProfileId}'. Send founder+startup inline on this paid call, or create profiles via POST /v1/a2mcp/bootstrap.`
    );
  }
  const startup = await deps.startupRepo.findById(startupProfileId);
  if (!startup) {
    throw new NotFoundError(
      `Startup profile not found for ID '${startupProfileId}'. Send founder+startup inline on this paid call, or create profiles via POST /v1/a2mcp/bootstrap.`
    );
  }
  assertStartupOwnedByFounder(startup, founderProfileId);
}

/**
 * Resolve profile IDs for a paid call: reuse UUIDs or auto-bootstrap from inline objects.
 * Fixes marketplace buyer flow where free /bootstrap is not in the x402 task path.
 */
async function resolvePaidProfiles(
  deps: A2mcpRouteDeps,
  body: PaidBodyInput,
  createFounder: CreateFounderProfile,
  createStartup: CreateStartup
): Promise<ResolvedPaidProfiles> {
  if (body.founderProfileId && body.startupProfileId) {
    await assertProfilesReadyForPay(deps, body.founderProfileId, body.startupProfileId);
    return {
      founderProfileId: body.founderProfileId,
      startupProfileId: body.startupProfileId,
      blueprintId: body.blueprintId,
      bootstrapped: false,
    };
  }

  if (!body.founder || !body.startup) {
    throw new ApplicationError(
      'Missing profile context. Send founder+startup objects (recommended for marketplace) or founderProfileId+startupProfileId.',
      { bodyModes: A2MCP_BODY_MODES }
    );
  }

  const founderDto = body.founder;
  const startupDto = body.startup;

  const existing = await deps.userRepo.findByEmail(founderDto.email);
  let founderProfileId: string;
  let founderReused = false;

  if (existing) {
    founderProfileId = existing.id;
    founderReused = true;
  } else {
    const founder = await withTimeout(
      createFounder.execute(founderDto),
      15_000,
      'paid_auto_bootstrap_founder'
    );
    founderProfileId = founder.id;
  }

  const startup = await withTimeout(
    createStartup.execute({
      founderProfileId,
      ...startupDto,
    }),
    15_000,
    'paid_auto_bootstrap_startup'
  );

  return {
    founderProfileId,
    startupProfileId: startup.id,
    blueprintId: body.blueprintId,
    bootstrapped: true,
    founderReused,
  };
}

function paidBodyValidationErrorPayload(details?: unknown) {
  return {
    success: false,
    errorCode: 'VALIDATION_ERROR',
    message:
      'Invalid body. Marketplace buyers: send founder+startup objects on this paid call (auto-bootstrap). Returning buyers: send founderProfileId+startupProfileId UUIDs.',
    bodyModes: A2MCP_BODY_MODES,
    exampleInlineBody: {
      founder: { email: 'founder@example.com', fullName: 'Ada Founder' },
      startup: {
        name: 'Example Co',
        industry: 'Software',
        oneSentenceDescription: 'What you build',
      },
    },
    exampleProfileIdBody: {
      founderProfileId: '<uuid>',
      startupProfileId: '<uuid>',
    },
    optionalBodyFields: [...A2MCP_OPTIONAL_BODY_FIELDS],
    bootstrapUrl: `${A2MCP_PUBLIC_BASE_URL}/v1/a2mcp/bootstrap`,
    details,
  };
}

function serviceCatalogEntry(service: A2mcpServiceKey) {
  const path = A2MCP_ROUTE_PATHS[service];
  const isSmoke = service === 'smoke_test';
  return {
    service,
    operation: service,
    path,
    fullUrl: `${A2MCP_PUBLIC_BASE_URL}${path}`,
    method: 'POST' as const,
    priceUsd: A2MCP_SERVICE_PRICES[service],
    feeToken: XLAYER_USDT0_ASSET,
    network: XLAYER_NETWORK,
    listable: !isSmoke,
    internalOnly: isSmoke,
    bodyModes: isSmoke ? undefined : A2MCP_BODY_MODES,
    requiredBodyFields: isSmoke ? [] : [...A2MCP_REQUIRED_BODY_FIELDS],
    optionalBodyFields: isSmoke ? [] : [...A2MCP_OPTIONAL_BODY_FIELDS],
    payment: 'x402 exact on X Layer (eip155:196) USDT0 0x779ded…',
    note: isSmoke
      ? undefined
      : 'First-time marketplace buyers: POST founder+startup on this endpoint with payment; profiles are created automatically.',
  };
}

/**
 * Public A2MCP marketplace endpoints.
 * - Without payment headers → HTTP 402 (PAYMENT-REQUIRED)
 * - With valid payment → execute service and settle
 * - Bootstrap creates founder+startup without Metiora API key
 * These routes bypass Metiora API key (payment is the gate for paid products).
 */
export async function registerA2mcpRoutes(
  fastify: FastifyInstance,
  deps: A2mcpRouteDeps
): Promise<void> {
  const packageAi = deps.packageAi ?? resolvePackageAi(loadEnvironment());
  const adapter = new A2aServiceAdapter(
    deps.userRepo,
    deps.startupRepo,
    deps.blueprintRepo,
    deps.investorRepo,
    deps.grantRepo,
    deps.partnershipRepo,
    deps.tokenRepo,
    deps.healthRepo,
    packageAi,
    fastify.log
  );

  const createFounder = new CreateFounderProfile(deps.userRepo);
  const createStartup = new CreateStartup(deps.startupRepo, deps.userRepo);

  const listableOperations = LISTABLE_SERVICES;

  // Public discovery for listing self-check + buyers (no Metiora API key)
  // smoke_test is intentionally omitted from marketplace product list
  fastify.get('/v1/a2mcp/services', async (_req: FastifyRequest, reply: FastifyReply) => {
    const ai = adapter.getAiStatus();
    return reply.status(200).send({
      success: true,
      x402Enabled: deps.x402.enabled,
      network: deps.x402.network,
      feeToken: XLAYER_USDT0_ASSET,
      expectedNetwork: XLAYER_NETWORK,
      payTo: deps.x402.enabled ? deps.x402.payTo : undefined,
      reasonDisabled: deps.x402.reasonDisabled,
      packageLlm: {
        enabled: ai.llmEnabled,
        providerId: ai.providerId,
        model: ai.model,
        reasonDisabled: ai.reasonDisabled,
      },
      bodyModes: A2MCP_BODY_MODES,
      requiredBodyFields: [...A2MCP_REQUIRED_BODY_FIELDS],
      optionalBodyFields: [...A2MCP_OPTIONAL_BODY_FIELDS],
      bootstrapUrl: `${A2MCP_PUBLIC_BASE_URL}/v1/a2mcp/bootstrap`,
      validOperations: listableOperations,
      services: listableOperations.map((service) => serviceCatalogEntry(service)),
      note: 'Marketplace buyers may send founder+startup on the paid product call (auto-bootstrap). Or use free POST /v1/a2mcp/bootstrap for UUIDs. When packageLlm.enabled is true, narratives are enriched with a live model grounded in memory.',
    });
  });

  // Paid-channel discovery (listable products only)
  fastify.post('/v1/a2mcp/tools', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      success: true,
      validOperations: listableOperations,
      services: listableOperations.map((service) => ({
        name: service,
        path: A2MCP_ROUTE_PATHS[service],
        fullUrl: `${A2MCP_PUBLIC_BASE_URL}${A2MCP_ROUTE_PATHS[service]}`,
        priceUsd: A2MCP_SERVICE_PRICES[service],
      })),
      bootstrapUrl: `${A2MCP_PUBLIC_BASE_URL}/v1/a2mcp/bootstrap`,
      message:
        'Bootstrap profiles first, then POST a listable path with x402 payment headers and founderProfileId + startupProfileId.',
    });
  });

  /**
   * Free public bootstrap — marketplace buyers create founder + startup without API key.
   * Reuses founder when email already exists (avoids duplicate-account spam for same buyer).
   */
  fastify.post('/v1/a2mcp/bootstrap', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = BootstrapSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message:
          'Invalid bootstrap body. Required: founder.email, founder.fullName, startup.name, startup.industry.',
        details: parsed.error.flatten(),
      });
    }

    const { founder: founderDto, startup: startupDto } = parsed.data;

    try {
      const existing = await deps.userRepo.findByEmail(founderDto.email);
      let founderProfileId: string;
      let founderReused = false;

      if (existing) {
        founderProfileId = existing.id;
        founderReused = true;
      } else {
        const founder = await withTimeout(
          createFounder.execute(founderDto),
          15_000,
          'bootstrap_founder'
        );
        founderProfileId = founder.id;
      }

      const startup = await withTimeout(
        createStartup.execute({
          founderProfileId,
          ...startupDto,
        }),
        15_000,
        'bootstrap_startup'
      );

      return reply.status(201).send({
        success: true,
        founderProfileId,
        startupProfileId: startup.id,
        founderReused,
        next: {
          requiredBodyFields: [...A2MCP_REQUIRED_BODY_FIELDS],
          servicesUrl: `${A2MCP_PUBLIC_BASE_URL}/v1/a2mcp/services`,
          examplePaidBody: {
            founderProfileId,
            startupProfileId: startup.id,
          },
        },
        message:
          'Profiles ready. Use these IDs in paid A2MCP service POSTs with x402 payment headers.',
      });
    } catch (err) {
      if (err instanceof ApplicationError || err instanceof NotFoundError) {
        throw err;
      }
      throw err;
    }
  });

  // $0.01 mainnet smoke — internal payment-path probe (not listed in marketplace catalog)
  fastify.post(A2MCP_ROUTE_PATHS.smoke_test, async (request: FastifyRequest, reply: FastifyReply) => {
    if (!deps.x402.enabled || !deps.x402.httpServer) {
      return reply.status(503).send({
        success: false,
        errorCode: 'X402_NOT_CONFIGURED',
        message: deps.x402.reasonDisabled ?? 'x402 not configured',
      });
    }

    await runPaidA2mcpHandler(deps.x402.httpServer, request, reply, async () => {
      return {
        success: true,
        service: 'smoke_test',
        operation: 'smoke_test',
        message: 'Metiora x402 mainnet smoke delivery OK',
        deliveredAt: new Date().toISOString(),
        paymentNetwork: deps.x402.network,
        feeToken: XLAYER_USDT0_ASSET,
        note: 'Internal payment-path probe only — not a marketplace product.',
      };
    });
  });

  const registerPaid = (service: OkxServiceType, path: string) => {
    fastify.post(path, async (request: FastifyRequest, reply: FastifyReply) => {
      if (!deps.x402.enabled || !deps.x402.httpServer) {
        return reply.status(503).send({
          success: false,
          errorCode: 'X402_NOT_CONFIGURED',
          message:
            deps.x402.reasonDisabled ??
            'x402 payment is not configured on this deployment',
          validOperations: listableOperations,
        });
      }

      // Unpaid probes (OKX scanners) must still get 402 — only reject bad bodies when a
      // payment header is present, so buyers never settle against a malformed request.
      const paymentHeader = extractPaymentHeader(request);

      // Validate body shape before pay when a payment header is present.
      // Auto-bootstrap runs ONLY after payment is verified (inside handler), so failed
      // signatures never create orphan profiles.
      let parsedPaidInput: PaidBodyInput | undefined;
      if (paymentHeader) {
        const parsed = PaidBodySchema.safeParse(request.body);
        if (!parsed.success) {
          return reply.status(400).send(paidBodyValidationErrorPayload(parsed.error.flatten()));
        }
        parsedPaidInput = parsed.data;

        // If UUIDs provided, verify they exist before settling
        if (parsedPaidInput.founderProfileId && parsedPaidInput.startupProfileId) {
          try {
            await assertProfilesReadyForPay(
              deps,
              parsedPaidInput.founderProfileId,
              parsedPaidInput.startupProfileId
            );
          } catch (err) {
            if (err instanceof NotFoundError) {
              return reply.status(404).send({
                success: false,
                errorCode: 'NOT_FOUND',
                message: err.message,
                bodyModes: A2MCP_BODY_MODES,
                bootstrapUrl: `${A2MCP_PUBLIC_BASE_URL}/v1/a2mcp/bootstrap`,
              });
            }
            if (err instanceof AuthorizationError) {
              return reply.status(403).send({
                success: false,
                errorCode: 'FORBIDDEN',
                message: err.message,
              });
            }
            throw err;
          }
        }
      }

      await runPaidA2mcpHandler(deps.x402.httpServer, request, reply, async () => {
        const input =
          parsedPaidInput ??
          (() => {
            const parsed = PaidBodySchema.safeParse(request.body);
            if (!parsed.success) {
              throw new ApplicationError(
                'Invalid body. Send founder+startup (auto-bootstrap) or founderProfileId+startupProfileId.',
                parsed.error.flatten()
              );
            }
            return parsed.data;
          })();

        // Payment verified — now resolve UUIDs or create profiles from inline body
        const profiles = await resolvePaidProfiles(
          deps,
          input,
          createFounder,
          createStartup
        );

        const result = await withTimeout(
          adapter.executeService(
            service,
            profiles.founderProfileId,
            profiles.startupProfileId,
            profiles.blueprintId
          ),
          SERVICE_EXECUTION_TIMEOUT_MS,
          service
        );

        return {
          success: true,
          service,
          operation: service,
          data: {
            contentJson: result.contentJson,
            contentMarkdown: result.contentMarkdown,
          },
          generation: result.generation,
          profiles: {
            founderProfileId: profiles.founderProfileId,
            startupProfileId: profiles.startupProfileId,
            bootstrapped: profiles.bootstrapped,
            founderReused: profiles.founderReused ?? false,
          },
          paymentNetwork: deps.x402.network,
          feeToken: XLAYER_USDT0_ASSET,
        };
      });
    });
  };

  registerPaid('startup_blueprint', A2MCP_ROUTE_PATHS.startup_blueprint);
  registerPaid('investor_ready', A2MCP_ROUTE_PATHS.investor_ready);
  registerPaid('grant_builder', A2MCP_ROUTE_PATHS.grant_builder);
  registerPaid('partnership_studio', A2MCP_ROUTE_PATHS.partnership_studio);
  registerPaid('token_launch_kit', A2MCP_ROUTE_PATHS.token_launch_kit);
  registerPaid('startup_health', A2MCP_ROUTE_PATHS.startup_health);
}
