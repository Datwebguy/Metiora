import { IStartupHealthRepository } from '@core/ports/startup-health-repository.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export interface HealthComparisonResult {
  versionA: number;
  versionB: number;
  overallScoreDelta: number;
  categoryDeltas: { dimension: string; scoreA: number; scoreB: number; delta: number }[];
}

export class CompareHealthReports {
  constructor(private readonly healthRepo: IStartupHealthRepository) {}

  public async execute(
    reportId: string,
    versionNumberA: number,
    versionNumberB: number
  ): Promise<HealthComparisonResult> {
    const history = await this.healthRepo.getVersionHistory(reportId);
    const verA = history.find((v) => v.versionNumber === versionNumberA);
    const verB = history.find((v) => v.versionNumber === versionNumberB);

    if (!verA || !verB) {
      throw new ApplicationError(
        `One or both health report version numbers (${versionNumberA}, ${versionNumberB}) do not exist for report '${reportId}'.`
      );
    }

    const overallScoreDelta = verB.overallScore - verA.overallScore;

    const categoryDeltas = verA.categoryScoresJson.map((catA) => {
      const catB = verB.categoryScoresJson.find((c) => c.dimension === catA.dimension);
      const scoreB = catB ? catB.score : catA.score;
      return {
        dimension: catA.dimension,
        scoreA: catA.score,
        scoreB,
        delta: scoreB - catA.score,
      };
    });

    return {
      versionA: versionNumberA,
      versionB: versionNumberB,
      overallScoreDelta,
      categoryDeltas,
    };
  }
}
