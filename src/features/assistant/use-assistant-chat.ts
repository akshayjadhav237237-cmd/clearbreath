import { useState } from 'react';
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

/** Custom hook managing conversational turn state, context allowlisting, and AI invocation. */
export function useAssistantChat(options: ChatOptions) {
  const { profile, aqi, city, facts, aiConsent, language, apiKey } = options;
  const [messages, setMessages] = useState<readonly ChatMessage[]>([
    DEFAULT_MESSAGE,
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    const keyHolder = new ApiKeyHolder();
    if (apiKey) {
      keyHolder.setKey(apiKey);
    }
    const orchestrator = new AiOrchestrator({
      localProvider: new LocalProvider(),
      keyHolder,
      fetcher: new SystemFetchPort(),
      sleepPort: new SystemSleepPort(),
      randomPort: new SystemRandomPort(),
      clock: new SystemClock(),
    });
    const res = await orchestrator.getAnswer(safeCtx, { consent: aiConsent });
    setIsLoading(false);
    if (res.ok) {
      const msg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: res.value.data.answer,
        source: res.value.source,
        ...(res.value.data.refusal !== undefined
          ? { refusal: res.value.data.refusal }
          : {}),
        ...(res.value.fallbackReason !== undefined
          ? { fallbackReason: res.value.fallbackReason }
          : {}),
      };
      setMessages((prev) => [...prev, msg]);
    }
  };

  return { messages, input, setInput, isLoading, sendMessage };
}
