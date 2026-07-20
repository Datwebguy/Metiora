import { BlueprintGenerator } from '../domain/blueprint-generator.js';
import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { StartupBlueprintContent } from '@core/domain/startup-blueprint.js';

export interface GeneratedBlueprintResult {
  content: StartupBlueprintContent;
  contentMarkdown: string;
}

export class GenerateBlueprint {
  private generator: BlueprintGenerator;

  constructor() {
    this.generator = new BlueprintGenerator();
  }

  public execute(startupSnapshot: StartupMemorySnapshot, userSnapshot: UserMemorySnapshot): GeneratedBlueprintResult {
    const content = this.generator.generateContent(startupSnapshot, userSnapshot);
    const contentMarkdown = this.generator.generateMarkdown(content);
    return { content, contentMarkdown };
  }
}
