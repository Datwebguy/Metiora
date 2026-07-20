import { FastifyRequest } from 'fastify';
import type { HTTPAdapter } from '@okxweb3/x402-core/server';

/**
 * Fastify implementation of OKX x402 HTTPAdapter.
 */
export class FastifyX402Adapter implements HTTPAdapter {
  constructor(private readonly req: FastifyRequest) {}

  getHeader(name: string): string | undefined {
    const value = this.req.headers[name.toLowerCase()];
    if (Array.isArray(value)) return value[0];
    return value;
  }

  getMethod(): string {
    return this.req.method;
  }

  getPath(): string {
    // pathname only, no query string
    const url = this.req.url ?? '/';
    return url.split('?')[0] ?? '/';
  }

  getUrl(): string {
    const host = this.req.headers.host ?? 'localhost';
    const protoHeader = this.req.headers['x-forwarded-proto'];
    const proto = Array.isArray(protoHeader)
      ? protoHeader[0]
      : protoHeader ?? 'https';
    return `${proto}://${host}${this.req.url}`;
  }

  getAcceptHeader(): string {
    const accept = this.req.headers.accept;
    return Array.isArray(accept) ? accept[0] ?? '' : accept ?? '';
  }

  getUserAgent(): string {
    const ua = this.req.headers['user-agent'];
    return Array.isArray(ua) ? ua[0] ?? '' : ua ?? '';
  }

  getQueryParams(): Record<string, string | string[]> {
    const out: Record<string, string | string[]> = {};
    const q = this.req.query as Record<string, unknown>;
    for (const [k, v] of Object.entries(q ?? {})) {
      if (typeof v === 'string' || Array.isArray(v)) {
        out[k] = v as string | string[];
      } else if (v != null) {
        out[k] = String(v);
      }
    }
    return out;
  }

  getQueryParam(name: string): string | string[] | undefined {
    return this.getQueryParams()[name];
  }

  getBody(): unknown {
    return this.req.body;
  }
}
