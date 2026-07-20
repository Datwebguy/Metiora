import { IOkxIntegrationRepository } from '@core/ports/okx-integration-repository.js';
import {
  OkxAgentIdentity,
  OkxWalletSession,
  OkxTask,
  OkxNegotiation,
  OkxEscrow,
  OkxDelivery,
  OkxRating,
} from '@core/domain/okx-integration.js';

export class InMemoryOkxIntegrationRepository implements IOkxIntegrationRepository {
  private identities: Map<string, OkxAgentIdentity> = new Map();
  private sessions: Map<string, OkxWalletSession> = new Map();
  private tasks: Map<string, OkxTask> = new Map();
  private negotiations: Map<string, OkxNegotiation> = new Map();
  private escrows: Map<string, OkxEscrow> = new Map();
  private deliveries: Map<string, OkxDelivery> = new Map();
  private ratings: OkxRating[] = [];

  public async saveAgentIdentity(identity: OkxAgentIdentity): Promise<OkxAgentIdentity> {
    this.identities.set(identity.agentId, identity);
    return identity;
  }

  public async findAgentIdentity(agentId: string): Promise<OkxAgentIdentity | null> {
    return this.identities.get(agentId) || null;
  }

  public async saveWalletSession(session: OkxWalletSession): Promise<OkxWalletSession> {
    this.sessions.set(session.sessionToken, session);
    return session;
  }

  public async findWalletSession(sessionToken: string): Promise<OkxWalletSession | null> {
    return this.sessions.get(sessionToken) || null;
  }

  public async saveTask(task: OkxTask): Promise<OkxTask> {
    this.tasks.set(task.taskId, task);
    return task;
  }

  public async findTaskById(taskId: string): Promise<OkxTask | null> {
    return this.tasks.get(taskId) || null;
  }

  public async saveNegotiation(negotiation: OkxNegotiation): Promise<OkxNegotiation> {
    this.negotiations.set(negotiation.taskId, negotiation);
    return negotiation;
  }

  public async findNegotiationByTaskId(taskId: string): Promise<OkxNegotiation | null> {
    return this.negotiations.get(taskId) || null;
  }

  public async saveEscrow(escrow: OkxEscrow): Promise<OkxEscrow> {
    this.escrows.set(escrow.taskId, escrow);
    return escrow;
  }

  public async findEscrowByTaskId(taskId: string): Promise<OkxEscrow | null> {
    return this.escrows.get(taskId) || null;
  }

  public async saveDelivery(delivery: OkxDelivery): Promise<OkxDelivery> {
    this.deliveries.set(delivery.taskId, delivery);
    return delivery;
  }

  public async findDeliveryByTaskId(taskId: string): Promise<OkxDelivery | null> {
    return this.deliveries.get(taskId) || null;
  }

  public async saveRating(rating: OkxRating): Promise<OkxRating> {
    this.ratings.push(rating);
    return rating;
  }

  public async getRatingsForAgent(agentId: string): Promise<OkxRating[]> {
    return this.ratings.filter((r) => r.ratedAgentId === agentId);
  }
}
