import { useMemo, useState, type JSX } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { getCityById } from '../../config/cities';
import { useAppStore } from '../../app/store';
import { getTranslations } from '../../shared/i18n';
import { formatAqiFactText, getShellDict } from '../../shared/i18n/shell-dict';
import {
  selectCurrentAqi,
  selectCurrentReading,
  selectDayPlan,
} from '../../shared/state/selectors';
import type { GroundingFact, Language } from '../../ai/contracts';
import type {
  AqiResult,
  DailyPlan,
  HourlyReading,
} from '../../domain/contracts';
import { AssistantChatBox, FactsModal } from './chat-transcript';
import { AssistantHeader } from './assistant-header';
import { useAssistantChat } from './use-assistant-chat';

function formatWindowFact(plan: DailyPlan, lang: Language): GroundingFact {
  const win = plan.outdoorWindows[0];
  if (!win) {
    return {
      id: 'outdoor-window',
      kind: 'window',
      text:
        lang === 'hi'
          ? 'आज कोई सुरक्षित बाहरी समय नहीं है; घर के अंदर रहें।'
          : 'No low-AQI outdoor window today; prioritize indoor air cleaning.',
    };
  }
  const hrs = `${String(win.startHour).padStart(2, '0')}:00-${String(win.endHour).padStart(2, '0')}:00`;
  return {
    id: 'outdoor-window',
    kind: 'window',
    value: win.averageAqi,
    text:
      lang === 'hi'
        ? `उपयुक्त बाहरी समय ${hrs} (औसत एक्यूआई ${win.averageAqi})`
        : `Lowest AQI outdoor window is ${hrs} (avg AQI ${win.averageAqi})`,
  };
}

function buildPanelFacts(options: {
  readonly language: Language;
  readonly safeCityName: string;
  readonly aqi: AqiResult;
  readonly reading: HourlyReading;
  readonly plan: DailyPlan;
  readonly categoryLabel: string;
}): readonly GroundingFact[] {
  const { language, safeCityName, aqi, reading, plan, categoryLabel } = options;
  const shell = getShellDict(language);
  const pmText =
    language === 'hi'
      ? `पीएम 2.5 ${reading.pm25} व पीएम 10 ${reading.pm10} माइक्रोग्राम/मी³ है`
      : `Current PM2.5 is ${reading.pm25} and PM10 is ${reading.pm10} µg/m³`;
  return [
    {
      id: 'aqi-current',
      kind: 'aqi',
      text: `${formatAqiFactText(language, safeCityName, aqi.value, categoryLabel)}. ${pmText}`,
      value: aqi.value,
    },
    formatWindowFact(plan, language),
    { id: 'act-indoor-seal-gaps', kind: 'action', text: shell.factSealGaps },
    {
      id: 'act-indoor-box-fan',
      kind: 'action',
      value: 65,
      text:
        language === 'hi'
          ? 'DIY बॉक्स-फैन MERV-13 क्लीनर इनडोर PM2.5 में ~65% कमी कर सकता है'
          : 'DIY box-fan with MERV-13 reduces indoor PM2.5 by ~65%',
    },
    {
      id: 'act-outdoor-wear-n95-transit',
      kind: 'action',
      value: 95,
      text:
        language === 'hi'
          ? 'बाहरी यात्रा में फिटेड N95 मास्क कणों का जोखिम कम करता है'
          : 'Fitted N95 respirator reduces transit particulate exposure by 95% nominal',
    },
  ];
}

function useAssistantModel() {
  const store = useAppStore(
    useShallow((s) => ({
      profile: s.profile,
      hourlySeries: s.hourlySeries,
      selectedCity: s.selectedCity,
      aiConsent: s.aiConsent,
      setAiConsent: s.setAiConsent,
      language: s.language,
    }))
  );
  const { profile, hourlySeries, selectedCity, language } = store;
  const t = getTranslations(language);
  const safeCityName =
    getCityById(selectedCity)?.name ??
    getShellDict(language).selectedCityFallback;
  const selectorSlice = useMemo(
    () => ({ selectedCity, hourlySeries, profile }),
    [selectedCity, hourlySeries, profile]
  );
  const aqi = useMemo(() => selectCurrentAqi(selectorSlice), [selectorSlice]);
  const reading = useMemo(
    () => selectCurrentReading(selectorSlice),
    [selectorSlice]
  );
  const plan = useMemo(() => selectDayPlan(selectorSlice), [selectorSlice]);
  const facts = useMemo(
    () =>
      buildPanelFacts({
        language,
        safeCityName,
        aqi,
        reading,
        plan,
        categoryLabel: t.severity[aqi.category],
      }),
    [language, safeCityName, aqi, reading, plan, t]
  );
  return { ...store, t, safeCityName, aqi, facts };
}

/** Interactive AI conversational assistant providing grounded air quality mitigation guidance. */
export function AssistantPanel(): JSX.Element {
  const {
    profile,
    aiConsent,
    setAiConsent,
    language,
    t,
    safeCityName,
    aqi,
    facts,
  } = useAssistantModel();
  const [showFacts, setShowFacts] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const { messages, input, setInput, isLoading, sendMessage } =
    useAssistantChat({
      profile,
      aqi,
      city: safeCityName,
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
        language={language}
      />

      <AssistantChatBox
        messages={messages}
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSend={(text) => void sendMessage(text)}
        placeholder={t.assistant.placeholder}
        sendLabel={t.assistant.send}
        language={language}
      />

      <FactsModal
        isOpen={showFacts}
        onClose={() => setShowFacts(false)}
        facts={facts}
        language={language}
      />
    </section>
  );
}
