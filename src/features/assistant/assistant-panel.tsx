import { useState, type JSX } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { getCityById } from '../../config/cities';
import { useAppStore } from '../../app/store';
import { calculateAqi } from '../../domain/aqi';
import { getTranslations } from '../../shared/i18n';
import type { GroundingFact } from '../../ai/contracts';
import type { AqiResult } from '../../domain/contracts';
import { AssistantChatBox, FactsModal } from './chat-transcript';
import { AssistantHeader } from './assistant-header';
import { useAssistantChat } from './use-assistant-chat';

/** Interactive AI conversational assistant providing grounded air quality mitigation guidance. */
export function AssistantPanel(): JSX.Element {
  const {
    profile,
    hourlySeries,
    selectedCity,
    aiConsent,
    setAiConsent,
    language,
  } = useAppStore(
    useShallow((s) => ({
      profile: s.profile,
      hourlySeries: s.hourlySeries,
      selectedCity: s.selectedCity,
      aiConsent: s.aiConsent,
      setAiConsent: s.setAiConsent,
      language: s.language,
    }))
  );
  const t = getTranslations(language);
  const [showFacts, setShowFacts] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const aqiRes = calculateAqi(
    hourlySeries?.readings[12] ?? { hour: 12, pm25: 180, pm10: 290 }
  );
  const aqi: AqiResult = aqiRes.ok
    ? aqiRes.value
    : { value: 180, category: 'moderate', dominant: 'pm25' };
  const safeCityName = getCityById(selectedCity)?.name ?? 'Selected City';

  const facts: readonly GroundingFact[] = [
    {
      id: 'aqi-current',
      kind: 'aqi',
      text: `Current AQI in ${safeCityName} is ${aqi.value} (${aqi.category})`,
      value: aqi.value,
    },
    {
      id: 'act-indoor-seal-gaps',
      kind: 'action',
      text: 'Weatherstripping reduces infiltration by 20%',
    },
  ];

  const { messages, input, setInput, isLoading, sendMessage } =
    useAssistantChat({
      profile,
      aqi,
      city: selectedCity,
      facts,
      aiConsent,
      language,
      apiKey,
    });

  return (
    <section aria-labelledby="assistant-heading" className="space-y-6">
      <AssistantHeader
        title={t.assistant.title}
        disclaimer={t.assistant.disclaimer}
        aiConsent={aiConsent}
        onToggleConsent={setAiConsent}
        onOpenFacts={() => setShowFacts(true)}
        modeGemini={t.assistant.modeGemini}
        modeLocal={t.assistant.modeLocal}
        consentToggleText={t.assistant.consentToggle}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />

      <AssistantChatBox
        messages={messages}
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSend={(text) => void sendMessage(text)}
        placeholder={t.assistant.placeholder}
        sendLabel={t.assistant.send}
      />

      <FactsModal
        isOpen={showFacts}
        onClose={() => setShowFacts(false)}
        facts={facts}
      />
    </section>
  );
}
