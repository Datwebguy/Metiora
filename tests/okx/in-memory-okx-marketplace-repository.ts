import { IOkxMarketplaceRepository } from '@core/ports/okx-marketplace-repository.js';
import { OkxAspProfile, OkxMarketplaceCatalogItem } from '@core/domain/okx-marketplace.js';

export class InMemoryOkxMarketplaceRepository implements IOkxMarketplaceRepository {
  private profile: OkxAspProfile | null = null;
  private catalog: Map<string, OkxMarketplaceCatalogItem> = new Map();

  public async saveAspProfile(profile: OkxAspProfile): Promise<OkxAspProfile> {
    this.profile = profile;
    return profile;
  }

  public async getAspProfile(): Promise<OkxAspProfile | null> {
    return this.profile;
  }

  public async saveCatalogItem(item: OkxMarketplaceCatalogItem): Promise<OkxMarketplaceCatalogItem> {
    this.catalog.set(item.serviceType, item);
    return item;
  }

  public async getCatalogItems(): Promise<OkxMarketplaceCatalogItem[]> {
    return Array.from(this.catalog.values());
  }

  public async getCatalogItemByServiceType(serviceType: string): Promise<OkxMarketplaceCatalogItem | null> {
    return this.catalog.get(serviceType) || null;
  }
}
