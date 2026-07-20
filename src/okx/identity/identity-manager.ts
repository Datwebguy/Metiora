import { IOkxIntegrationRepository } from '@core/ports/okx-integration-repository.js';
import { OkxAgentIdentity } from '@core/domain/okx-integration.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class IdentityManager {
  constructor(private readonly repo: IOkxIntegrationRepository) {}

  public async registerIdentity(agentId: string, address: string): Promise<OkxAgentIdentity> {
    const existing = await this.repo.findAgentIdentity(agentId);
    if (existing) {
      return existing;
    }

    const now = new Date();
    const identity: OkxAgentIdentity = {
      agentId,
      address,
      status: 'ACTIVE',
      metadata: {
        registeredAt: now.toISOString(),
        agentType: 'A2A_AGENT_SERVICE_PROVIDER',
        marketplace: 'OKX.AI',
      },
      createdAt: now,
      updatedAt: now,
    };

    return this.repo.saveAgentIdentity(identity);
  }

  public async getIdentity(agentId: string): Promise<OkxAgentIdentity> {
    const identity = await this.repo.findAgentIdentity(agentId);
    if (!identity) {
      throw new ApplicationError(`Agent identity not found for ID '${agentId}'.`);
    }
    return identity;
  }
}
