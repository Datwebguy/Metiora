import { FastifyReply, FastifyRequest } from 'fastify';
import type { x402HTTPResourceServer } from '@okxweb3/x402-core/server';
import { FacilitatorResponseError } from '@okxweb3/x402-core/server';
import { FastifyX402Adapter } from './fastify-adapter.js';

let initPromise: Promise<void> | null = null;

async function ensureInitialized(httpServer: x402HTTPResourceServer): Promise<void> {
  if (!initPromise) {
    initPromise = httpServer.initialize().then(() => undefined);
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

/**
 * Run a paid A2MCP handler behind OKX x402 (402 → pay → verify → settle → 200).
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

  const context = {
    adapter,
    path,
    method: adapter.getMethod(),
    paymentHeader:
      adapter.getHeader('payment-signature') ||
      adapter.getHeader('PAYMENT-SIGNATURE') ||
      adapter.getHeader('x-payment') ||
      adapter.getHeader('X-PAYMENT'),
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
      });
      return;
    }
    if (error instanceof Error && error.message.includes('timed out')) {
      await reply.status(504).send({
        success: false,
        errorCode: 'FACILITATOR_TIMEOUT',
        message: error.message,
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
    // Ensure classic 402 for marketplace scanners
    const status = response.status === 402 || response.status === 402 ? 402 : response.status;
    await reply.status(status || 402).send(response.body ?? {});
    return;
  }

  // payment-verified — execute business logic, then settle
  let businessBody: unknown;
  try {
    businessBody = await handler();
  } catch (error) {
    // Do not settle if business logic failed
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
      await reply
        .status(settleResult.response.status || 402)
        .send(settleResult.response.body ?? { success: false, errorCode: 'SETTLE_FAILED' });
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
      });
      return;
    }
    if (error instanceof Error && error.message.includes('timed out')) {
      request.log.error(error, 'x402 settlement timeout');
      await reply.status(504).send({
        success: false,
        errorCode: 'SETTLEMENT_TIMEOUT',
        message: 'Payment verified but settlement timed out — retry with same payload if supported',
      });
      return;
    }
    request.log.error(error, 'x402 settlement failed');
    await reply.status(402).send({
      success: false,
      errorCode: 'SETTLEMENT_ERROR',
      message: 'Payment verified but settlement failed',
    });
  }
}
