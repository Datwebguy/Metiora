import { IOkxIntegrationRepository } from '@core/ports/okx-integration-repository.js';
import { OkxEscrow } from '@core/domain/okx-integration.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class EscrowManager {
  constructor(private readonly repo: IOkxIntegrationRepository) {}

  public async initiateEscrow(taskId: string, amountUsd: number): Promise<OkxEscrow> {
    const now = new Date();
    const escrow: OkxEscrow = {
      taskId,
      escrowId: `escrow_${crypto.randomUUID()}`,
      amountUsd,
      status: 'INITIATED',
      createdAt: now,
      updatedAt: now,
    };

    return this.repo.saveEscrow(escrow);
  }

  public async confirmEscrow(taskId: string): Promise<OkxEscrow> {
    const escrow = await this.repo.findEscrowByTaskId(taskId);
    if (!escrow) {
      throw new ApplicationError(`Escrow record not found for task ID '${taskId}'.`);
    }

    escrow.status = 'CONFIRMED';
    escrow.updatedAt = new Date();
    return this.repo.saveEscrow(escrow);
  }

  public async settleEscrow(taskId: string): Promise<OkxEscrow> {
    const escrow = await this.repo.findEscrowByTaskId(taskId);
    if (!escrow) {
      throw new ApplicationError(`Escrow record not found for task ID '${taskId}'.`);
    }

    escrow.status = 'SETTLED';
    escrow.updatedAt = new Date();
    return this.repo.saveEscrow(escrow);
  }

  public async refundEscrow(taskId: string, reason?: string): Promise<OkxEscrow> {
    const escrow = await this.repo.findEscrowByTaskId(taskId);
    if (!escrow) {
      throw new ApplicationError(`Escrow record not found for task ID '${taskId}'.`);
    }

    escrow.status = 'REFUNDED';
    escrow.arbitrationStatus = reason ?? 'TASK_FAILED';
    escrow.updatedAt = new Date();
    return this.repo.saveEscrow(escrow);
  }
}
