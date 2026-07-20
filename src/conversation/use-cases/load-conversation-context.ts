import { IConversationRepository } from '@core/ports/conversation-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { ConversationContext } from '@core/domain/conversation.js';
import { SnapshotBuilder } from '../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class LoadConversationContext {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {}

  public async execute(sessionId: string): Promise<ConversationContext> {
    const session = await this.conversationRepo.findById(sessionId);
    if (!session) {
      throw new ApplicationError(`Conversation session not found for ID '${sessionId}'.`);
    }

    const founder = await this.userRepo.findById(session.founderProfileId);
    const startup = await this.startupRepo.findById(session.startupProfileId);
    if (!founder || !startup) {
      throw new ApplicationError('Associated founder or startup profile not found.');
    }

    return {
      session,
      userSnapshot: SnapshotBuilder.buildSnapshot(founder),
      startupSnapshot: StartupSnapshotBuilder.buildSnapshot(startup),
    };
  }
}
