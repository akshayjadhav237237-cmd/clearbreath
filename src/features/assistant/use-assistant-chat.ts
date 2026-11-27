import { useEffect, useMemo, useRef, useState } from 'react';
import type { AqiResult, HouseholdProfile } from '../../domain/contracts';
import type { GroundingFact, Language } from '../../ai/contracts';
import { buildLlmSafeContext } from '../../ai/privacy';
import { AiOrchestrator } from '../../ai/orchestrator';
import { ApiKeyHolder } from '../../ai/key-holder';
import { LocalProvider } from '../../ai/providers/local-provider';
import { determineHouseholdSensitivity } from '../../domain/profile';
import { getShellDict } from '../../shared/i18n/shell-dict';
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
  text: '',
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

async function queryAssistant(
  orchestrator: AiOrchestrator,
  options: ChatOptions,
  qText: string,
  signal: AbortSignal
): Promise<ChatMessage | null> {
  const ctx = buildLlmSafeContext({
    profile: options.profile,
    aqi: options.aqi,
    sensitivityLevel: determineHouseholdSensitivity(options.profile.members),
    city: options.city,
    facts: options.facts,
    question: qText,
    language: options.language,
  });
  const res = await orchestrator.getAnswer(ctx, {
    consent: options.aiConsent,
    signal,
  });
  if (signal.aborted || !res.ok) return null;
  return toAssistantMessage(
    res.value.data,
    res.value.source,
    res.value.fallbackReason
  );
}

function syncKeyHolder(keyHolder: ApiKeyHolder, apiKey?: string): void {
  if (apiKey) keyHolder.setKey(apiKey);
  else keyHolder.clear();
}

/** Custom hook managing conversational turn state, context allowlisting, and AI invocation. */
export function useAssistantChat(options: ChatOptions) {
  const { language, apiKey } = options;
  const keyHolderRef = useRef(new ApiKeyHolder());
  const orchestratorRef = useRef<AiOrchestrator | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [messages, setMessages] = useState<readonly ChatMessage[]>([
    DEFAULT_MESSAGE,
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  const welcomeText = getShellDict(language).welcome;
  const localizedMessages = useMemo(
    () =>
      messages.map((m) =>
        m.id === 'welcome' ? { ...m, text: welcomeText } : m
      ),
    [messages, welcomeText]
  );

  const sendMessage = async (qText: string) => {
    if (!qText.trim() || isLoading) return;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), sender: 'user', text: qText },
    ]);
    setInput('');
    setIsLoading(true);
    syncKeyHolder(keyHolderRef.current, apiKey);
    const orchestrator =
      orchestratorRef.current ?? buildOrchestrator(keyHolderRef.current);
    orchestratorRef.current = orchestrator;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const reply = await queryAssistant(
      orchestrator,
      options,
      qText,
      controller.signal
    );
    if (controller.signal.aborted) return;
    setIsLoading(false);
    if (reply) setMessages((prev) => [...prev, reply]);
  };

  return {
    messages: localizedMessages,
    input,
    setInput,
    isLoading,
    sendMessage,
  };
}
