import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryOkxMarketplaceRepository } from './in-memory-okx-marketplace-repository.js';
import { ProfilePublisher } from '../../src/okx/marketplace/profile-publisher.js';
import { CatalogPublisher } from '../../src/okx/marketplace/catalog-publisher.js';
import { ServiceValidator } from '../../src/okx/marketplace/service-validator.js';
import { PricingEngine } from '../../src/okx/marketplace/pricing-engine.js';

describe('OKX.AI Marketplace Registration & Publication Tests', () => {
  let repo: InMemoryOkxMarketplaceRepository;
  let profilePublisher: ProfilePublisher;
  let catalogPublisher: CatalogPublisher;
  let serviceValidator: ServiceValidator;
  let pricingEngine: PricingEngine;

  beforeEach(() => {
    repo = new InMemoryOkxMarketplaceRepository();
    profilePublisher = new ProfilePublisher(repo);
    catalogPublisher = new CatalogPublisher(repo);
    serviceValidator = new ServiceValidator();
    pricingEngine = new PricingEngine();
  });

  it('should publish complete OKX Agent Service Provider (ASP) Profile', async () => {
    const profile = await profilePublisher.publishProfile();

    expect(profile).toBeDefined();
    expect(profile.agentName).toBe('metiora-ai-operating-partner');
    expect(profile.supportedLanguages).toContain('en');
    expect(profile.docsUrl).toBe('https://agentmetiora.xyz');
  });

  it('should register all 6 production services into the OKX Marketplace Catalog', async () => {
    const registered = await catalogPublisher.registerAllServices();

    expect(registered.length).toBe(6);
    const serviceTypes = registered.map((r) => r.serviceType);
    expect(serviceTypes).toContain('startup_blueprint');
    expect(serviceTypes).toContain('investor_ready');
    expect(serviceTypes).toContain('grant_builder');
    expect(serviceTypes).toContain('partnership_studio');
    expect(serviceTypes).toContain('token_launch_kit');
    expect(serviceTypes).toContain('startup_health');
  });

  it('should validate every registered service for input/output schema and pricing compliance', async () => {
    const registered = await catalogPublisher.registerAllServices();

    for (const item of registered) {
      const result = serviceValidator.validateService(item);
      expect(result.isValid).toBe(true);
      expect(result.validationErrors.length).toBe(0);
    }
  });

  it('should support execution mode compatibility for AUTO_MATCH, DIRECT_ASSIGNMENT, and PUBLIC_LISTING', async () => {
    const registered = await catalogPublisher.registerAllServices();

    for (const item of registered) {
      expect(item.executionModes).toContain('AUTO_MATCH');
      expect(item.executionModes).toContain('DIRECT_ASSIGNMENT');
      expect(item.executionModes).toContain('PUBLIC_LISTING');
    }
  });

  it('should query marketplace discovery catalog by max price, execution mode, and keywords', async () => {
    await catalogPublisher.registerAllServices();

    const grantItems = await catalogPublisher.queryCatalog({ keyword: 'grant' });
    expect(grantItems.length).toBeGreaterThan(0);
    expect(grantItems[0].serviceType).toBe('grant_builder');

    // Current list: blueprint/investor $3, grant $2, partnership $1, token/health $0.3
    const affordableItems = await catalogPublisher.queryCatalog({ maxPriceUsd: 7 });
    expect(affordableItems.length).toBe(6);
  });

  it('should calculate accurate pricing using the configurable PricingEngine', async () => {
    await catalogPublisher.registerAllServices();
    const item = await repo.getCatalogItemByServiceType('startup_blueprint');

    expect(item).not.toBeNull();
    if (item) {
      const price = pricingEngine.calculatePrice(item);
      expect(price.priceUsd).toBe(7);
      expect(price.currency).toBe('USD');
    }
  });
});
