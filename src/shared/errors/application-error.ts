export abstract class MetioraBaseError extends Error {
  abstract readonly errorCode: string;
  abstract readonly httpStatusCode: number;

  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DomainError extends MetioraBaseError {
  readonly errorCode = 'DOMAIN_RULE_VIOLATION';
  readonly httpStatusCode = 422;
}

export class ApplicationError extends MetioraBaseError {
  readonly errorCode = 'APPLICATION_ERROR';
  readonly httpStatusCode = 400;
}

export class InfrastructureError extends MetioraBaseError {
  readonly errorCode = 'INFRASTRUCTURE_FAILURE';
  readonly httpStatusCode = 500;
}

export class AIProviderError extends MetioraBaseError {
  readonly errorCode = 'AI_PROVIDER_FAILURE';
  readonly httpStatusCode = 502;
}

export class OKXProtocolError extends MetioraBaseError {
  readonly errorCode = 'OKX_PROTOCOL_VIOLATION';
  readonly httpStatusCode = 400;
}

export class AuthorizationError extends MetioraBaseError {
  readonly errorCode = 'FORBIDDEN';
  readonly httpStatusCode = 403;
}

export class NotFoundError extends MetioraBaseError {
  readonly errorCode = 'NOT_FOUND';
  readonly httpStatusCode = 404;
}

export class ConflictError extends MetioraBaseError {
  readonly errorCode = 'CONFLICT';
  readonly httpStatusCode = 409;
}
