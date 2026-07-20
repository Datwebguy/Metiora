import { IOkxIntegrationRepository } from '@core/ports/okx-integration-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { A2aServiceAdapter } from '../adapter/a2a-service-adapter.js';
import { DeliveryFormatter } from '../delivery/delivery-formatter.js';
import { OkxDelivery, OkxServiceType, OkxTask } from '@core/domain/okx-integration.js';
import { NotFoundError } from '@shared/errors/application-error.js';
import { assertStartupOwnedByFounder } from '@shared/security/ownership.js';

export interface ReceiveTaskDTO {
  taskId: string;
  requesterAgentId: string;
  founderProfileId: string;
  startupProfileId: string;
  serviceType: OkxServiceType;
  priceUsd: number;
}

export class TaskHandler {
  private deliveryFormatter: DeliveryFormatter;

  constructor(
    private readonly okxRepo: IOkxIntegrationRepository,
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository,
    private readonly adapter: A2aServiceAdapter
  ) {
    this.deliveryFormatter = new DeliveryFormatter();
  }

  public async processTask(dto: ReceiveTaskDTO): Promise<OkxDelivery> {
    const now = new Date();
    const task: OkxTask = {
      taskId: dto.taskId,
      requesterAgentId: dto.requesterAgentId,
      founderProfileId: dto.founderProfileId,
      startupProfileId: dto.startupProfileId,
      serviceType: dto.serviceType,
      status: 'RECEIVED',
      scope: { serviceType: dto.serviceType },
      pricing: { priceUsd: dto.priceUsd, currency: 'USD' },
      createdAt: now,
      updatedAt: now,
    };
    await this.okxRepo.saveTask(task);

    try {
      const founder = await this.userRepo.findById(dto.founderProfileId);
      if (!founder) {
        task.status = 'REJECTED';
        task.updatedAt = new Date();
        await this.okxRepo.saveTask(task);
        throw new NotFoundError(`Founder profile not found for ID '${dto.founderProfileId}'.`);
      }

      const startup = await this.startupRepo.findById(dto.startupProfileId);
      if (!startup) {
        task.status = 'REJECTED';
        task.updatedAt = new Date();
        await this.okxRepo.saveTask(task);
        throw new NotFoundError(`Startup profile not found for ID '${dto.startupProfileId}'.`);
      }

      assertStartupOwnedByFounder(startup, dto.founderProfileId);

      task.status = 'EXECUTING';
      task.updatedAt = new Date();
      await this.okxRepo.saveTask(task);

      const result = await this.adapter.executeService(
        dto.serviceType,
        dto.founderProfileId,
        dto.startupProfileId
      );

      task.status = 'DELIVERED';
      task.updatedAt = new Date();
      await this.okxRepo.saveTask(task);

      // Memory is NOT auto-mutated by A2A execution — only deliverable content is returned
      const delivery = this.deliveryFormatter.formatDelivery(
        dto.taskId,
        result.contentJson,
        result.contentMarkdown,
        dto.serviceType,
        startup.version,
        0.95,
        { memoryMutated: false }
      );

      return this.okxRepo.saveDelivery(delivery);
    } catch (err) {
      if (task.status === 'EXECUTING') {
        task.status = 'FAILED';
        task.updatedAt = new Date();
        await this.okxRepo.saveTask(task);
      }
      throw err;
    }
  }
}
