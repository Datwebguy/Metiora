import { describe, expect, it } from 'vitest';
import { FastifyX402Adapter } from '../../src/okx/x402/fastify-adapter.js';
import type { FastifyRequest } from 'fastify';

function fakeReq(headers: Record<string, string | string[] | undefined>): FastifyRequest {
  return {
    headers,
    method: 'POST',
    url: '/v1/a2mcp/startup-health',
    body: {},
    query: {},
  } as unknown as FastifyRequest;
}

describe('FastifyX402Adapter payment header alias', () => {
  it('reads PAYMENT-SIGNATURE (canonical v2)', () => {
    const adapter = new FastifyX402Adapter(
      fakeReq({ 'payment-signature': 'sig-v2-payload' })
    );
    expect(adapter.getHeader('payment-signature')).toBe('sig-v2-payload');
    expect(adapter.getHeader('PAYMENT-SIGNATURE')).toBe('sig-v2-payload');
  });

  it('aliases X-PAYMENT when PAYMENT-SIGNATURE is missing (legacy / ASP #6434 class)', () => {
    const adapter = new FastifyX402Adapter(fakeReq({ 'x-payment': 'legacy-sig-payload' }));
    // SDK extractPayment only asks for payment-signature — must still resolve
    expect(adapter.getHeader('payment-signature')).toBe('legacy-sig-payload');
    expect(adapter.getHeader('PAYMENT-SIGNATURE')).toBe('legacy-sig-payload');
    expect(adapter.getHeader('x-payment')).toBe('legacy-sig-payload');
  });

  it('prefers PAYMENT-SIGNATURE when both headers are present', () => {
    const adapter = new FastifyX402Adapter(
      fakeReq({
        'payment-signature': 'canonical',
        'x-payment': 'legacy',
      })
    );
    expect(adapter.getHeader('payment-signature')).toBe('canonical');
  });

  it('strips path for route matching via getPath', () => {
    const adapter = new FastifyX402Adapter({
      headers: {},
      method: 'POST',
      url: '/v1/a2mcp/startup-health?x=1',
      body: {},
      query: { x: '1' },
    } as unknown as FastifyRequest);
    expect(adapter.getPath()).toBe('/v1/a2mcp/startup-health');
  });
});
