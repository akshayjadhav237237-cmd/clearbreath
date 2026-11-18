import type {
  Clock,
  FetchPort,
  RandomPort,
  SleepPort,
} from '../../shared/ports';
import type { AiProvider } from '../contracts';
import type { ApiKeyHolder } from '../key-holder';

/** Execution dependencies required by the AI orchestrator. */
export interface OrchestratorDependencies {
  readonly localProvider: AiProvider;
  readonly keyHolder: ApiKeyHolder;
  readonly fetcher: FetchPort;
  readonly sleepPort: SleepPort;
  readonly randomPort: RandomPort;
  readonly clock: Clock;
}

/** Orchestrated AI invocation result tagging response provenance and fallback rationales. */
export interface OrchestratedResult<T> {
  readonly data: T;
  readonly source: 'local' | 'gemini';
  readonly fallbackReason?: string;
}

/** User preferences and signals governing orchestrator execution. */
export interface OrchestrationOptions {
  readonly consent: boolean;
  readonly signal?: AbortSignal;
}
