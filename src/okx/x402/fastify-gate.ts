import { FastifyReply, FastifyRequest } from 'fastify';
import type { x402HTTPResourceServer } from '@okxweb3/x402-core/server';
import { FacilitatorResponseError } from '@okxweb3/x402-core/server';
import {
  decodePaymentRequiredHeader,
  decodePaymentResponseHeader,
} from '@okxweb3/x402-core/http';
import { FastifyX402Adapter } from './fastify-adapter.js';

let initPromise: Promise<void> | null = null;

/**
 * Initialize facilitator once. On failure, clear the cache so the next
 * request can retry (sticky rejected promise would 502 forever).
 */
async function ensureInitialized(httpServer: x402HTTPResourceServer): Promise<void> {
  if (!initPromise) {
    initPromise = httpServer
      .initialize()
      .then(() => undefined)
      .catch((err) => {
        initPromise = null;
        throw err;
      });
  }
  await initPromise;
}

const FACILITATOR_INIT_TIMEOUT_MS = 20_000;
const FACILITATOR_PROCESS_TIMEOUT_MS = 45_000;
const FACILITATOR_SETTLE_TIMEOUT_MS = 45_000;

async function withTimeoutMs<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${label} timed out after ${ms}ms`));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function readPaymentHeader(adapter: FastifyX402Adapter): string | undefined {
  return (
    adapter.getHeader('payment-signature') ||
    adapter.getHeader('PAYMENT-SIGNATURE') ||
    adapter.getHeader('x-payment') ||
    adapter.getHeader('X-PAYMENT')
  );
}

/**
 * SDK often returns empty body on verify/settle failure while the real
 * reason sits in PAYMENT-REQUIRED / PAYMENT-RESPONSE. Never echo bare {}.
 */
function enrichPaymentErrorBody(
  status: number,
  headers: Record<string, string>,
  body: unknown,
  hadPaymentHeader: boolean
): Record<string, unknown> {
  const existing =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};

  // Preserve rich unpaid challenge body from unpaidResponseBody
  if (
    existing.success === false &&
    (existing.errorCode === 'PAYMENT_REQUIRED' || existing.message)
  ) {
    return existing;
  }

  let prError: string | undefined;
  let prDecoded: Record<string, unknown> | undefined;
  const prHeader = headers['PAYMENT-REQUIRED'] || headers['payment-required'];
  if (typeof prHeader === 'string' && prHeader.length > 0) {
    try {
      prDecoded = decodePaymentRequiredHeader(prHeader) as unknown as Record<string, unknown>;
      if (typeof prDecoded?.error === 'string') prError = prDecoded.error;
    } catch {
      // ignore decode failures
    }
  }

  let settleTx: string | undefined;
  let settleStatus: string | undefined;
  const payResp = headers['PAYMENT-RESPONSE'] || headers['payment-response'];
  if (typeof payResp === 'string' && payResp.length > 0) {
    try {
      const decoded = decodePaymentResponseHeader(payResp) as unknown as Record<string, unknown>;
      if (typeof decoded?.transaction === 'string') settleTx = decoded.transaction;
      if (typeof decoded?.status === 'string') settleStatus = decoded.status;
    } catch {
      // ignore
    }
  }

  const isEmpty = Object.keys(existing).length === 0;
  if (!isEmpty && !hadPaymentHeader) {
    return existing;
  }

  // Had a payment header but still 402 → verification/settlement failed.
  // Do not look like a blank unpaid challenge (ASP #6434 failure mode).
  if (hadPaymentHeader) {
    return {
      success: false,
      errorCode:
        status === 402 && settleTx
          ? 'SETTLEMENT_FAILED'
          : status === 402
            ? 'PAYMENT_NOT_ACCEPTED'
            : 'PAYMENT_ERROR',
      message:
        prError && prError !== 'Payment required'
          ? prError
          : hadPaymentHeader
            ? 'Payment header was present but was not accepted (verify/settle failed). Check PAYMENT-REQUIRED / PAYMENT-RESPONSE headers.'
            : 'Payment required',
      paymentHeaderPresent: true,
      ...(prError ? { facilitatorReason: prError } : {}),
      ...(settleTx ? { txHash: settleTx } : {}),
      ...(settleStatus ? { settlementStatus: settleStatus } : {}),
      ...existing,
    };
  }

  if (isEmpty) {
    return {
      success: false,
      errorCode: 'PAYMENT_REQUIRED',
      message: prError || 'x402 payment required for this Metiora A2MCP service',
    };
  }

  return existing;
}

/**
 * Run a paid A2MCP handler behind OKX x402 (402 → pay → verify → settle → 200).
 *
 * Hardening vs marketplace delist pattern (ASP re-issues 402 forever after signed pay):
 * - Accept X-PAYMENT and PAYMENT-SIGNATURE (adapter alias)
 * - Never return empty 402 body when a payment header was sent
 * - On settle failure, surface txHash/errorCode instead of silent re-challenge
 * - Facilitator init failures are retryable (not sticky)
 */
export async function runPaidA2mcpHandler(
  httpServer: x402HTTPResourceServer,
  request: FastifyRequest,
  reply: FastifyReply,
  handler: () => Promise<unknown>
): Promise<void> {
  const adapter = new FastifyX402Adapter(request);
  // Normalize path (strip trailing slash) so route matching survives client quirks
  let path = adapter.getPath();
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);

  const paymentHeader = readPaymentHeader(adapter);
  const hadPaymentHeader = Boolean(paymentHeader && paymentHeader.length > 0);

  const context = {
    adapter,
    path,
    method: adapter.getMethod(),
    paymentHeader,
  };

  if (!httpServer.requiresPayment(context)) {
    const body = await handler();
    await reply.status(200).send(body);
    return;
  }

  try {
    await withTimeoutMs(ensureInitialized(httpServer), FACILITATOR_INIT_TIMEOUT_MS, 'x402 initialize');
  } catch (error) {
    request.log.error(error, 'x402 facilitator initialize failed');
    await reply.status(502).send({
      success: false,
      errorCode: 'FACILITATOR_UNAVAILABLE',
      message: 'Payment facilitator could not be reached (init timeout or error)',
      paymentHeaderPresent: hadPaymentHeader,
    });
    return;
  }

  let result;
  try {
    result = await withTimeoutMs(
      httpServer.processHTTPRequest(context),
      FACILITATOR_PROCESS_TIMEOUT_MS,
      'x402 verify'
    );
  } catch (error) {
    if (error instanceof FacilitatorResponseError) {
      await reply.status(502).send({
        success: false,
        errorCode: 'FACILITATOR_ERROR',
        message: error.message,
        paymentHeaderPresent: hadPaymentHeader,
      });
      return;
    }
    if (error instanceof Error && error.message.includes('timed out')) {
      await reply.status(504).send({
        success: false,
        errorCode: 'FACILITATOR_TIMEOUT',
        message: error.message,
        paymentHeaderPresent: hadPaymentHeader,
      });
      return;
    }
    throw error;
  }

  if (result.type === 'no-payment-required') {
    const body = await handler();
    await reply.status(200).send(body);
    return;
  }

  if (result.type === 'payment-error') {
    const { response } = result;
    for (const [key, value] of Object.entries(response.headers)) {
      void reply.header(key, value);
    }
    const status = response.status === 402 ? 402 : response.status || 402;
    const body = enrichPaymentErrorBody(
      status,
      response.headers as Record<string, string>,
      response.body,
      hadPaymentHeader
    );
    request.log.warn(
      {
        status,
        hadPaymentHeader,
        errorCode: body.errorCode,
        facilitatorReason: body.facilitatorReason,
      },
      'x402 payment-error response'
    );
    await reply.status(status).send(body);
    return;
  }

  // payment-verified — execute business logic, then settle
  let businessBody: unknown;
  try {
    businessBody = await handler();
  } catch (error) {
    // Do not settle if business logic failed (buyer should not be charged for empty delivery)
    request.log.error(error, 'x402 business handler failed after payment verify — not settling');
    throw error;
  }

  const responseBody = Buffer.from(JSON.stringify(businessBody));

  try {
    const settleResult = await withTimeoutMs(
      httpServer.processSettlement(
        result.paymentPayload,
        result.paymentRequirements,
        result.declaredExtensions,
        { request: context, responseBody }
      ),
      FACILITATOR_SETTLE_TIMEOUT_MS,
      'x402 settle'
    );

    if (!settleResult.success) {
      for (const [key, value] of Object.entries(settleResult.response.headers)) {
        void reply.header(key, value);
      }
      const status = settleResult.response.status || 402;
      const body = enrichPaymentErrorBody(
        status,
        settleResult.response.headers as Record<string, string>,
        settleResult.response.body ?? {
          success: false,
          errorCode: 'SETTLE_FAILED',
          message:
            (settleResult as { errorMessage?: string; errorReason?: string }).errorMessage ||
            (settleResult as { errorReason?: string }).errorReason ||
            'Settlement failed after payment was verified',
          paymentHeaderPresent: true,
          transaction:
            (settleResult as { transaction?: string }).transaction || undefined,
        },
        true
      );
      request.log.error(
        {
          status,
          errorCode: body.errorCode,
          txHash: body.txHash,
          facilitatorReason: body.facilitatorReason,
        },
        'x402 settlement failed after verify'
      );
      // Prefer 502 when settle fails after verify so buyers don't think "never paid"
      // (protocol SDK defaults to 402 empty body — that is the #6434 complaint).
      const clientStatus = status === 402 ? 502 : status;
      await reply.status(clientStatus).send({
        ...body,
        errorCode: body.errorCode === 'PAYMENT_NOT_ACCEPTED' ? 'SETTLE_FAILED' : body.errorCode,
        note: 'Payment was verified but on-chain settlement did not complete. Do not retry blindly with a spent signature; open a new 402 challenge if needed.',
      });
      return;
    }

    for (const [key, value] of Object.entries(settleResult.headers)) {
      void reply.header(key, value);
    }
    await reply.status(200).send(businessBody);
  } catch (error) {
    if (error instanceof FacilitatorResponseError) {
      await reply.status(502).send({
        success: false,
        errorCode: 'FACILITATOR_ERROR',
        message: error.message,
        paymentHeaderPresent: true,
        phase: 'settle',
      });
      return;
    }
    if (error instanceof Error && error.message.includes('timed out')) {
      request.log.error(error, 'x402 settlement timeout');
      await reply.status(504).send({
        success: false,
        errorCode: 'SETTLEMENT_TIMEOUT',
        message:
          'Payment verified but settlement timed out — do not assume success; check facilitator/tx before retrying',
        paymentHeaderPresent: true,
      });
      return;
    }
    request.log.error(error, 'x402 settlement failed');
    await reply.status(502).send({
      success: false,
      errorCode: 'SETTLEMENT_ERROR',
      message: 'Payment verified but settlement failed',
      paymentHeaderPresent: true,
    });
  }
}
