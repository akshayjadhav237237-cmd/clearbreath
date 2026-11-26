import type {
  Clock,
  FetchPort,
  RandomPort,
  SleepPort,
} from '../../../src/shared/ports';
import type { LlmSafeContext } from '../../../src/ai/contracts';
import { ApiKeyHolder } from '../../../src/ai/key-holder';
import { LocalProvider } from '../../../src/ai/providers/local-provider';

export const VALID_KEY = 'valid-key';
export const ACTION_SEAL_GAPS = 'act-indoor-seal-gaps';

/** Builds mocked orchestrator dependencies for deterministic unit tests. */
export function createMockDeps(
  fetchImpl: (input: RequestInfo | URL) => Promise<Response>,
  options?: { key?: string; nowMs?: number }
) {
  const nowMs = options?.nowMs ?? 1000;
  const clock: Clock = { now: () => nowMs };
  const sleepPort: SleepPort = {
    sleep: async (ms: number, signal?: AbortSignal) => {
      return new Promise((resolve) => {
        const timer = setTimeout(resolve, ms);
        signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          resolve();
        });
      });
    },
  };
  const randomPort: RandomPort = { random: () => 0 };
  const keyHolder = new ApiKeyHolder();
  if (options?.key) keyHolder.setKey(options.key);
  const localProvider = new LocalProvider();
  const fetcher: FetchPort = { fetch: fetchImpl };
  return { clock, sleepPort, randomPort, keyHolder, localProvider, fetcher };
}

export const SAMPLE_CONTEXT: LlmSafeContext = {
  city: 'Delhi',
  aqiCategory: 'severe',
  aqiValue: 412,
  sensitivityLevel: 'high',
  ageGroupsPresent: ['child', 'older'],
  homeType: 'apartment',
  sealing: 'average',
  cookingFuel: 'lpg',
  commuteMode: 'metro',
  budgetBand: 'medium',
  language: 'en',
  facts: [
    { id: 'aqi-1', kind: 'aqi', text: 'Severe AQI 412', value: 412 },
    { id: ACTION_SEAL_GAPS, kind: 'action', text: 'Seal window gaps' },
  ],
  question: null,
};

export const BASE_CONTEXT: LlmSafeContext = {
  ...SAMPLE_CONTEXT,
  ageGroupsPresent: ['child'],
  facts: [{ id: 'aqi-1', kind: 'aqi', text: 'AQI 412', value: 412 }],
};
