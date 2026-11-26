import { useEffect, useRef, useState } from 'react';
import type { AqiResult, HouseholdProfile } from '../../domain/contracts';
import type { GroundingFact, Language } from '../../ai/contracts';
import { buildLlmSafeContext } from '../../ai/privacy';
import { AiOrchestrator } from '../../ai/orchestrator';
import { ApiKeyHolder } from '../../ai/key-holder';
import { LocalProvider } from '../../ai/providers/local-provider';
import { determineHouseholdSensitivity } from '../../domain/profile';
import {
  SystemClock,
  SystemFetchPort,
  SystemRandomPort,
  SystemSleepPort,
} from '../../shared/system-ports';
import type { ChatMessage } from './chat-transcript';

interface ChatOptions {
  readonly profile: HouseholdProfile;
  readonly aqi: AqiResult;
  readonly city: string;
  readonly facts: readonly GroundingFact[];
  readonly aiConsent: boolean;
  readonly language: Language;
  readonly apiKey?: string;
}

const DEFAULT_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'assistant',
  text: 'Hello! I am Clearbreath, your winter smog assistant.',
  source: 'local',
};

function buildOrchestrator(keyHolder: ApiKeyHolder): AiOrchestrator {
  return new AiOrchestrator({
    localProvider: new LocalProvider(),
    keyHolder,
    fetcher: new SystemFetchPort(),
    sleepPort: new SystemSleepPort(),
    randomPort: new SystemRandomPort(),
    clock: new SystemClock(),
  });
}

function toAssistantMessage(
  data: { readonly answer: string; readonly refusal?: boolean },
  source: 'local' | 'gemini',
  fallbackReason?: string
): ChatMessage {
  return {
    id: String(Date.now() + 1),
    sender: 'assistant',
    text: data.answer,
    source,
    ...(data.refusal !== undefined ? { refusal: data.refusal } : {}),
    ...(fallbackReason !== undefined ? { fallbackReason } : {}),
  };
}

/** Custom hook managing conversational turn state, context allowlisting, and AI invocation. */
export function useAssistantChat(options: ChatOptions) {
  const { profile, aqi, city, facts, aiConsent, language, apiKey } = options;
  const keyHolderRef = useRef(new ApiKeyHolder());
  const orchestratorRef = useRef<AiOrchestrator | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [messages, setMessages] = useState<readonly ChatMessage[]>([
    DEFAULT_MESSAGE,
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  const sendMessage = async (qText: string) => {
    if (!qText.trim() || isLoading) return;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), sender: 'user', text: qText },
    ]);
    setInput('');
    setIsLoading(true);
    const safeCtx = buildLlmSafeContext({
      profile,
      aqi,
      sensitivityLevel: determineHouseholdSensitivity(profile.members),
      city,
      facts,
      question: qText,
      language,
    });
    if (apiKey) keyHolderRef.current.setKey(apiKey);
    else keyHolderRef.current.clear();
    if (!orchestratorRef.current) {
      orchestratorRef.current = buildOrchestrator(keyHolderRef.current);
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const res = await orchestratorRef.current.getAnswer(safeCtx, {
      consent: aiConsent,
      signal: controller.signal,
    });
    if (controller.signal.aborted) return;
    setIsLoading(false);
    if (res.ok) {
      const msg = toAssistantMessage(
        res.value.data,
        res.value.source,
        res.value.fallbackReason
      );
      setMessages((prev) => [...prev, msg]);
    }
  };

  return { messages, input, setInput, isLoading, sendMessage };
}
