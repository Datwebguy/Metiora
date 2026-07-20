import { OkxDelivery } from '@core/domain/okx-integration.js';

export class DeliveryFormatter {
  public formatDelivery(
    taskId: string,
    contentJson: Record<string, unknown>,
    contentMarkdown: string,
    serviceType: string,
    startupVersion: number,
    confidenceScore: number = 0.95,
    options: { memoryMutated?: boolean } = {}
  ): OkxDelivery {
    const memoryMutated = options.memoryMutated === true;

    return {
      taskId,
      deliveryId: `del_${crypto.randomUUID()}`,
      contentJson,
      contentMarkdown,
      metadata: {
        provider: 'Metiora AI Operating Partner',
        protocol: 'OKX.AI A2A Service Provider',
        serviceType,
        memoryMutated,
      },
      executionSummary: `Executed ${serviceType} via Metiora engines (startup memory version at execution: v${startupVersion}).`,
      versionInfo: {
        serviceVersion: '1.0.0',
        startupVersion,
      },
      memoryUpdatesSummary: memoryMutated
        ? `Startup Memory was updated; current version is ${startupVersion}.`
        : `No Startup Memory mutation performed during this task. Memory remains at version ${startupVersion}. Approve deliverables explicitly to persist facts.`,
      confidenceScore,
      executionTimestamp: new Date(),
    };
  }
}
