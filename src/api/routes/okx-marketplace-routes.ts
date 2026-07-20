import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { IOkxMarketplaceRepository } from '@core/ports/okx-marketplace-repository.js';
import { ProfilePublisher } from '../../okx/marketplace/profile-publisher.js';
import { CatalogPublisher } from '../../okx/marketplace/catalog-publisher.js';
import { ServiceValidator } from '../../okx/marketplace/service-validator.js';

const ValidateTaskSchema = z.object({
  serviceType: z.string(),
  executionMode: z.enum(['AUTO_MATCH', 'DIRECT_ASSIGNMENT', 'PUBLIC_LISTING']),
});

export async function registerOkxMarketplaceRoutes(
  fastify: FastifyInstance,
  marketplaceRepo: IOkxMarketplaceRepository
): Promise<void> {
  const profilePublisher = new ProfilePublisher(marketplaceRepo);
  const catalogPublisher = new CatalogPublisher(marketplaceRepo);
  const serviceValidator = new ServiceValidator();

  // POST /okx/marketplace/profile
  fastify.post('/okx/marketplace/profile', async (_request: FastifyRequest, reply: FastifyReply) => {
    const profile = await profilePublisher.publishProfile();
    return reply.status(200).send({ success: true, data: profile });
  });

  // GET /okx/marketplace/profile
  fastify.get('/okx/marketplace/profile', async (_request: FastifyRequest, reply: FastifyReply) => {
    const profile = await marketplaceRepo.getAspProfile();
    return reply.status(200).send({ success: true, data: profile });
  });

  // POST /okx/marketplace/register-service
  fastify.post('/okx/marketplace/register-service', async (_request: FastifyRequest, reply: FastifyReply) => {
    const registered = await catalogPublisher.registerAllServices();
    return reply.status(201).send({ success: true, data: registered });
  });

  // GET /okx/marketplace/catalog
  fastify.get('/okx/marketplace/catalog', async (request: FastifyRequest, reply: FastifyReply) => {
    const { keyword, maxPriceUsd, executionMode } = request.query as {
      keyword?: string;
      maxPriceUsd?: string;
      executionMode?: string;
    };
    const items = await catalogPublisher.queryCatalog({
      keyword,
      maxPriceUsd: maxPriceUsd ? parseFloat(maxPriceUsd) : undefined,
      executionMode,
    });
    return reply.status(200).send({ success: true, data: items });
  });

  // POST /okx/marketplace/validate-task
  fastify.post('/okx/marketplace/validate-task', async (request: FastifyRequest, reply: FastifyReply) => {
    const { serviceType, executionMode } = ValidateTaskSchema.parse(request.body);
    const item = await marketplaceRepo.getCatalogItemByServiceType(serviceType);

    if (!item) {
      return reply.status(404).send({
        success: false,
        error: `Service type '${serviceType}' not registered in OKX Marketplace Catalog.`,
      });
    }

    const validation = serviceValidator.validateService(item);
    const isModeSupported = item.executionModes.includes(executionMode);

    return reply.status(200).send({
      success: validation.isValid && isModeSupported,
      data: {
        serviceType,
        executionMode,
        isModeSupported,
        validation,
      },
    });
  });
}
