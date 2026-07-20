import { OkxMarketplaceCatalogItem } from '@core/domain/okx-marketplace.js';

export class PricingEngine {
  public calculatePrice(item: OkxMarketplaceCatalogItem, tierName?: string): { priceUsd: number; currency: string } {
    if (item.pricing.mode === 'TIERED' && tierName && item.pricing.tiers) {
      const selectedTier = item.pricing.tiers.find((t) => t.name.toLowerCase() === tierName.toLowerCase());
      if (selectedTier) {
        return { priceUsd: selectedTier.priceUsd, currency: 'USD' };
      }
    }
    return { priceUsd: item.pricing.basePriceUsd, currency: 'USD' };
  }
}
