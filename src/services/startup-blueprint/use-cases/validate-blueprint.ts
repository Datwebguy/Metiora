import { BlueprintValidator } from '../domain/blueprint-validator.js';
import { StartupBlueprintContent, BlueprintValidationResult } from '@core/domain/startup-blueprint.js';

export class ValidateBlueprint {
  private validator: BlueprintValidator;

  constructor() {
    this.validator = new BlueprintValidator();
  }

  public execute(content: StartupBlueprintContent): BlueprintValidationResult {
    return this.validator.validate(content);
  }
}
