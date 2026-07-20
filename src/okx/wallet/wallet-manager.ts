import { IOkxIntegrationRepository } from '@core/ports/okx-integration-repository.js';
import { OkxWalletSession } from '@core/domain/okx-integration.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class WalletManager {
  constructor(private readonly repo: IOkxIntegrationRepository) {}

  public async loginWallet(walletAddress: string): Promise<OkxWalletSession> {
    if (!walletAddress || !walletAddress.startsWith('0x')) {
      throw new ApplicationError(`Invalid wallet address format '${walletAddress}'.`);
    }

    const sessionToken = `okx_sess_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const now = new Date();

    const session: OkxWalletSession = {
      walletAddress,
      sessionToken,
      status: 'ACTIVE',
      expiresAt,
      createdAt: now,
      updatedAt: now,
    };

    return this.repo.saveWalletSession(session);
  }

  public async validateSession(sessionToken: string): Promise<OkxWalletSession> {
    const session = await this.repo.findWalletSession(sessionToken);
    if (!session) {
      throw new ApplicationError('Wallet session not found.');
    }
    if (session.expiresAt < new Date()) {
      session.status = 'EXPIRED';
      await this.repo.saveWalletSession(session);
      throw new ApplicationError('Wallet session expired.');
    }
    return session;
  }
}
