import { PrismaClient } from '@prisma/client';
import { loadEnvironment } from './shared/config/environment.js';
import { buildApiServer } from './api/server.js';
import { PrismaUserMemoryRepository } from './storage/database/repositories/prisma-user-memory-repository.js';
import { PrismaStartupMemoryRepository } from './storage/database/repositories/prisma-startup-memory-repository.js';
import { PrismaConversationRepository } from './storage/database/repositories/prisma-conversation-repository.js';
import { PrismaStartupBlueprintRepository } from './storage/database/repositories/prisma-startup-blueprint-repository.js';
import { PrismaInvestorReadyRepository } from './storage/database/repositories/prisma-investor-ready-repository.js';
import { PrismaGrantBuilderRepository } from './storage/database/repositories/prisma-grant-builder-repository.js';
import { PrismaPartnershipStudioRepository } from './storage/database/repositories/prisma-partnership-studio-repository.js';
import { PrismaTokenLaunchKitRepository } from './storage/database/repositories/prisma-token-launch-kit-repository.js';
import { PrismaStartupHealthRepository } from './storage/database/repositories/prisma-startup-health-repository.js';
import { PrismaOkxIntegrationRepository } from './storage/database/repositories/prisma-okx-integration-repository.js';
import { PrismaOkxMarketplaceRepository } from './storage/database/repositories/prisma-okx-marketplace-repository.js';

async function main() {
  const config = loadEnvironment();

  const prisma = new PrismaClient();
  await prisma.$connect();

  const userRepo = new PrismaUserMemoryRepository(prisma);
  const startupRepo = new PrismaStartupMemoryRepository(prisma);
  const convRepo = new PrismaConversationRepository(prisma);
  const blueprintRepo = new PrismaStartupBlueprintRepository(prisma);
  const investorRepo = new PrismaInvestorReadyRepository(prisma);
  const grantRepo = new PrismaGrantBuilderRepository(prisma);
  const partnershipRepo = new PrismaPartnershipStudioRepository(prisma);
  const tokenRepo = new PrismaTokenLaunchKitRepository(prisma);
  const healthRepo = new PrismaStartupHealthRepository(prisma);
  const okxRepo = new PrismaOkxIntegrationRepository(prisma);
  const marketplaceRepo = new PrismaOkxMarketplaceRepository(prisma);

  const server = await buildApiServer(
    userRepo,
    startupRepo,
    convRepo,
    blueprintRepo,
    investorRepo,
    grantRepo,
    partnershipRepo,
    tokenRepo,
    healthRepo,
    okxRepo,
    marketplaceRepo,
    {
      configOverride: config,
      readinessCheck: async () => {
        await prisma.$queryRaw`SELECT 1`;
      },
    }
  );

  const address = await server.listen({ port: config.PORT, host: config.HOST });
  console.log(`[Metiora Backend] Server listening at ${address}`);

  const shutdown = async () => {
    console.log('[Metiora Backend] Shutting down gracefully...');
    await server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('[Metiora Backend] Fatal startup error:', err);
  process.exit(1);
});
