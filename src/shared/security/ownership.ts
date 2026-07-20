import { AuthorizationError } from '@shared/errors/application-error.js';

/**
 * Ensures a startup profile is owned by the claimed founder.
 * Prevents cross-tenant package generation / A2A task abuse.
 */
export function assertStartupOwnedByFounder(
  startup: { founderProfileId: string },
  founderProfileId: string
): void {
  if (startup.founderProfileId !== founderProfileId) {
    throw new AuthorizationError(
      'Startup profile does not belong to the specified founder profile.'
    );
  }
}
