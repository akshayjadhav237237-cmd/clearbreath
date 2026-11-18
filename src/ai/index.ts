/** AI layer contracts and marker tokens. */
export const AI_LAYER = 'ai';

export type {
  AiAnswer,
  AiError,
  AiErrorCode,
  AiPlanNarrative,
  AiProvider,
  AirDataError,
  AirDataErrorCode,
  AirDataProvider,
  BudgetBand,
  GroundingFact,
  HourlySeries,
  Language,
  LlmSafeContext,
} from './contracts';

export { aiAnswerSchema, aiPlanNarrativeSchema } from './contracts';
