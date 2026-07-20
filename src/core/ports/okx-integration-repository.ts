import {
  OkxAgentIdentity,
  OkxWalletSession,
  OkxTask,
  OkxNegotiation,
  OkxEscrow,
  OkxDelivery,
  OkxRating,
} from '../domain/okx-integration.js';

export interface IOkxIntegrationRepository {
  saveAgentIdentity(identity: OkxAgentIdentity): Promise<OkxAgentIdentity>;
  findAgentIdentity(agentId: string): Promise<OkxAgentIdentity | null>;
  saveWalletSession(session: OkxWalletSession): Promise<OkxWalletSession>;
  findWalletSession(sessionToken: string): Promise<OkxWalletSession | null>;
  saveTask(task: OkxTask): Promise<OkxTask>;
  findTaskById(taskId: string): Promise<OkxTask | null>;
  saveNegotiation(negotiation: OkxNegotiation): Promise<OkxNegotiation>;
  findNegotiationByTaskId(taskId: string): Promise<OkxNegotiation | null>;
  saveEscrow(escrow: OkxEscrow): Promise<OkxEscrow>;
  findEscrowByTaskId(taskId: string): Promise<OkxEscrow | null>;
  saveDelivery(delivery: OkxDelivery): Promise<OkxDelivery>;
  findDeliveryByTaskId(taskId: string): Promise<OkxDelivery | null>;
  saveRating(rating: OkxRating): Promise<OkxRating>;
  getRatingsForAgent(agentId: string): Promise<OkxRating[]>;
}
