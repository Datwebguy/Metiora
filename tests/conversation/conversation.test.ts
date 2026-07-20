import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserMemoryRepository } from '../user-memory/in-memory-user-memory-repository.js';
import { InMemoryStartupMemoryRepository } from '../startup-memory/in-memory-startup-memory-repository.js';
import { InMemoryConversationRepository } from './in-memory-conversation-repository.js';
import { CreateFounderProfile } from '../../src/memory/user-memory/use-cases/create-founder-profile.js';
import { CreateStartup } from '../../src/memory/startup-memory/use-cases/create-startup.js';
import { StartConversation } from '../../src/conversation/use-cases/start-conversation.js';
import { ContinueConversation } from '../../src/conversation/use-cases/continue-conversation.js';
import { PauseConversation } from '../../src/conversation/use-cases/pause-conversation.js';
import { ResumeConversation } from '../../src/conversation/use-cases/resume-conversation.js';
import { EndConversation } from '../../src/conversation/use-cases/end-conversation.js';
import { LoadConversationContext } from '../../src/conversation/use-cases/load-conversation-context.js';
import { GenerateConversationSummary } from '../../src/conversation/use-cases/generate-conversation-summary.js';

describe('Conversation Engine Core Tests', () => {
  let userRepo: InMemoryUserMemoryRepository;
  let startupRepo: InMemoryStartupMemoryRepository;
  let conversationRepo: InMemoryConversationRepository;

  let createFounder: CreateFounderProfile;
  let createStartup: CreateStartup;
  let startConversation: StartConversation;
  let continueConversation: ContinueConversation;
  let pauseConversation: PauseConversation;
  let resumeConversation: ResumeConversation;
  let endConversation: EndConversation;
  let loadContext: LoadConversationContext;
  let generateSummary: GenerateConversationSummary;

  let founderId: string;
  let startupId: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserMemoryRepository();
    startupRepo = new InMemoryStartupMemoryRepository();
    conversationRepo = new InMemoryConversationRepository();

    createFounder = new CreateFounderProfile(userRepo);
    createStartup = new CreateStartup(startupRepo, userRepo);
    startConversation = new StartConversation(conversationRepo, userRepo, startupRepo);
    continueConversation = new ContinueConversation(conversationRepo, userRepo, startupRepo);
    pauseConversation = new PauseConversation(conversationRepo);
    resumeConversation = new ResumeConversation(conversationRepo);
    endConversation = new EndConversation(conversationRepo);
    loadContext = new LoadConversationContext(conversationRepo, userRepo, startupRepo);
    generateSummary = new GenerateConversationSummary(conversationRepo);

    const founder = await createFounder.execute({
      email: 'operator@metiora.ai',
      fullName: 'Operator Founder',
    });
    founderId = founder.id;

    const startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Metiora AI OS',
      industry: 'Artificial Intelligence',
      mission: 'Turn ideas into enduring companies.',
      problemStatement: 'Founders lack persistent memory AI tools.',
      productDescription: 'Autonomous business workspace with persistent Company Memory.',
      businessModel: 'ASP Marketplace Escrow Model',
    });
    startupId = startup.id;
  });

  it('should start a new conversation and ask 1 single focused question if dependencies are missing', async () => {
    const result = await startConversation.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
      initialMessage: 'I want to raise investment.',
    });

    expect(result.sessionId).toBeDefined();
    expect(result.mode).toBeDefined();
    expect(result.executionPlan?.objective).toBe('RAISE_INVESTMENT');
  });

  it('should continue multi-turn conversation and accumulate messages', async () => {
    const startRes = await startConversation.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
      initialMessage: 'I need an investor pitch deck.',
    });

    const turnRes = await continueConversation.execute({
      sessionId: startRes.sessionId,
      userMessage: 'Our primary customers are early stage startup founders and accelerators.',
    });

    expect(turnRes.sessionId).toBe(startRes.sessionId);
    const session = await conversationRepo.findById(startRes.sessionId);
    expect(session?.messages.length).toBeGreaterThan(2);
  });

  it('should support pausing and saving a resume point during conversation interruption', async () => {
    const startRes = await startConversation.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
      initialMessage: 'Help us launch our token.',
    });

    const pauseRes = await continueConversation.execute({
      sessionId: startRes.sessionId,
      userMessage: 'We will continue tomorrow.',
    });

    expect(pauseRes.mode).toBe('STATUS_UPDATE');

    const session = await conversationRepo.findById(startRes.sessionId);
    expect(session?.status).toBe('PAUSED');
    expect(session?.resumePoint).toBeDefined();
  });

  it('should resume a paused conversation session upon explicit user command', async () => {
    const startRes = await startConversation.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
      initialMessage: 'Help us apply for grants.',
    });

    await pauseConversation.execute(startRes.sessionId);

    const resumeRes = await continueConversation.execute({
      sessionId: startRes.sessionId,
      userMessage: 'resume',
    });

    const session = await conversationRepo.findById(startRes.sessionId);
    expect(session?.status).toBe('ACTIVE');
  });

  it('should load full conversation context combining session, User Memory, and Startup Memory', async () => {
    const startRes = await startConversation.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
      initialMessage: 'Build a partnership proposal.',
    });

    const context = await loadContext.execute(startRes.sessionId);
    expect(context.session.id).toBe(startRes.sessionId);
    expect(context.userSnapshot.founderId).toBe(founderId);
    expect(context.startupSnapshot.startupId).toBe(startupId);
  });

  it('should end conversation session cleanly', async () => {
    const startRes = await startConversation.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
      initialMessage: 'General strategic guidance.',
    });

    const ended = await endConversation.execute(startRes.sessionId);
    expect(ended.status).toBe('COMPLETED');
  });

  it('should generate a conversation summary with key insights', async () => {
    const startRes = await startConversation.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
      initialMessage: 'I need funding.',
    });

    await continueConversation.execute({
      sessionId: startRes.sessionId,
      userMessage: 'We target B2B Web3 startups.',
    });

    const summary = await generateSummary.execute(startRes.sessionId);
    expect(summary.totalTurns).toBeGreaterThan(0);
    expect(summary.keyInsights.length).toBeGreaterThan(0);
  });
});
