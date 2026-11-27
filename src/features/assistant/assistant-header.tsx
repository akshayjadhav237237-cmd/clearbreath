import type { JSX } from 'react';
import type { Language } from '../../shared/i18n';
import { getShellDict } from '../../shared/i18n/shell-dict';
import { Badge } from '../../shared/ui';

interface AssistantHeaderProps {
  readonly title: string;
  readonly disclaimer: string;
  readonly aiConsent: boolean;
  readonly onToggleConsent: (consent: boolean) => void;
  readonly onOpenFacts: () => void;
  readonly modeGemini: string;
  readonly modeLocal: string;
  readonly consentToggleText: string;
  readonly apiKey?: string;
  readonly onApiKeyChange?: (key: string) => void;
  readonly language?: Language;
}

/** Header sub-component rendering AI disclaimer, mode badge, and consent toggle. */
export function AssistantHeader({
  title,
  disclaimer,
  aiConsent,
  onToggleConsent,
  onOpenFacts,
  modeGemini,
  modeLocal,
  consentToggleText,
  apiKey = '',
  onApiKeyChange,
  language = 'en',
}: AssistantHeaderProps): JSX.Element {
  const { factsBtn, apiKeyLabel, apiKeyAria, apiKeyPlaceholder } =
    getShellDict(language);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="assistant-heading"
            className="text-xl font-bold text-slate-900 dark:text-slate-50"
          >
            {title}
          </h2>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
            {disclaimer}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge severity={aiConsent ? 'info' : 'neutral'}>
            {aiConsent ? modeGemini : modeLocal}
          </Badge>
          <button
            type="button"
            onClick={onOpenFacts}
            className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            {factsBtn}
          </button>
        </div>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-700 dark:border-slate-800 dark:text-slate-300">
        <input
          type="checkbox"
          checked={aiConsent}
          onChange={(e) => onToggleConsent(e.target.checked)}
          className="rounded text-sky-700 focus:ring-sky-500"
        />
        <span className="font-medium">{consentToggleText}</span>
      </label>

      {aiConsent && onApiKeyChange && (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <label
            htmlFor="gemini-key-input"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {apiKeyLabel}
          </label>
          <input
            id="gemini-key-input"
            type="password"
            autoComplete="off"
            aria-label={apiKeyAria}
            placeholder={apiKeyPlaceholder}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      )}
    </div>
  );
}
