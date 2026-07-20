import { OkxAspProfile, OkxMarketplaceCatalogItem } from '../domain/okx-marketplace.js';

export interface IOkxMarketplaceRepository {
  saveAspProfile(profile: OkxAspProfile): Promise<OkxAspProfile>;
  getAspProfile(): Promise<OkxAspProfile | null>;
  saveCatalogItem(item: OkxMarketplaceCatalogItem): Promise<OkxMarketplaceCatalogItem>;
  getCatalogItems(): Promise<OkxMarketplaceCatalogItem[]>;
  getCatalogItemByServiceType(serviceType: string): Promise<OkxMarketplaceCatalogItem | null>;
}
