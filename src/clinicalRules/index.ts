import { ScreeningType } from '../types/screening.interface';
import { AnemiaRules } from './anemiaRules';
import { HypertensionRules } from './hypertensionRules';

export interface RiskStrategy {
  calculate(readings: any): { riskClassifications: any; overall: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'; recommendations?: string[] };
}

export class AnemiaStrategy implements RiskStrategy {
  calculate(readings: any) {
    return AnemiaRules.calculate(readings);
  }
}

export class HypertensionStrategy implements RiskStrategy {
  calculate(readings: any) {
    return HypertensionRules.calculate(readings);
  }
}

export class RiskEngine {
  private static strategies: Record<string, RiskStrategy> = {
    [ScreeningType.ANEMIA]: new AnemiaStrategy(),
    [ScreeningType.HYPERTENSION_DIABETES]: new HypertensionStrategy(),
  };

  public static calculateRisk(screeningType: string, readings: any) {
    const strategy = this.strategies[screeningType];
    if (strategy) {
      return strategy.calculate(readings);
    }
    return {
      riskClassifications: { overall: 'LOW' },
      overall: 'LOW' as const,
      recommendations: ['No recommendations available']
    };
  }
}
