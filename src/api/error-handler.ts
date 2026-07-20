import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { MetioraBaseError } from '@shared/errors/application-error.js';

function isPrismaKnownError(
  err: unknown
): err is { code: string; meta?: Record<string, unknown>; message: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string' &&
    (err as { code: string }).code.startsWith('P')
  );
}

/**
 * Maps domain/validation/infra errors to correct HTTP status + stable JSON body.
 * Without this, Zod and ApplicationError become opaque 500s in production.
 */
export function registerErrorHandler(fastify: {
  setErrorHandler: (
    handler: (
      error: FastifyError,
      request: FastifyRequest,
      reply: FastifyReply
    ) => void | Promise<void>
  ) => void;
  log: { error: (obj: unknown, msg?: string) => void };
}): void {
  fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      void reply.status(400).send({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.flatten(),
      });
      return;
    }

    // Malformed JSON body (Fastify body parser) — not a 500
    if (
      error instanceof SyntaxError ||
      (typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        (error as { statusCode?: number }).statusCode === 400 &&
        /json|unexpected token|Expected property/i.test(String((error as Error).message ?? '')))
    ) {
      void reply.status(400).send({
        success: false,
        errorCode: 'INVALID_JSON',
        message: 'Request body must be valid JSON',
      });
      return;
    }

    if (error instanceof MetioraBaseError) {
      void reply.status(error.httpStatusCode).send({
        success: false,
        errorCode: error.errorCode,
        message: error.message,
        details: error.details ?? undefined,
      });
      return;
    }

    // Fastify validation / payload errors
    if (error.validation) {
      void reply.status(400).send({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: error.message,
        details: error.validation,
      });
      return;
    }

    const maybePrisma = error as unknown;
    if (isPrismaKnownError(maybePrisma)) {
      if (maybePrisma.code === 'P2002') {
        void reply.status(409).send({
          success: false,
          errorCode: 'CONFLICT',
          message: 'A record with this unique value already exists',
          details: maybePrisma.meta,
        });
        return;
      }
      if (maybePrisma.code === 'P2025') {
        void reply.status(404).send({
          success: false,
          errorCode: 'NOT_FOUND',
          message: 'Requested record was not found',
          details: maybePrisma.meta,
        });
        return;
      }
      if (maybePrisma.code === 'P2021' || maybePrisma.code === 'P2022') {
        void reply.status(503).send({
          success: false,
          errorCode: 'SCHEMA_OUT_OF_SYNC',
          message: 'Database schema is out of date. Run migrations.',
          details: maybePrisma.meta,
        });
        return;
      }
    }

    fastify.log.error(error, 'Unhandled error');
    void reply.status(500).send({
      success: false,
      errorCode: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  });
}
