import { OkxMarketplaceCatalogItem, OkxValidationResult } from '@core/domain/okx-marketplace.js';

export class ServiceValidator {
  public validateService(item: OkxMarketplaceCatalogItem): OkxValidationResult {
    const errors: string[] = [];

    if (!item.name) errors.push('Service name missing.');
    if (!item.description) errors.push('Service description missing.');
    if (!item.inputSchema || Object.keys(item.inputSchema).length === 0) errors.push('Input schema missing.');
    if (!item.outputSchema || Object.keys(item.outputSchema).length === 0) errors.push('Output schema missing.');
    if (item.pricing.basePriceUsd <= 0) errors.push('Base price must be greater than 0.');
    if (!item.executionModes || item.executionModes.length === 0) errors.push('At least one execution mode required.');

    return {
      isValid: errors.length === 0,
      serviceType: item.serviceType,
      checkedCapabilities: item.capabilities,
      validationErrors: errors,
    };
  }
}
