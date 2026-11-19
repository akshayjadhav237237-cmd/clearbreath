import type { JSX } from 'react';
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
}: AssistantHeaderProps): JSX.Element {
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
            Grounding Facts
          </button>
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2 cursor-pointer border-t border-slate-100 pt-3 text-xs text-slate-700 dark:border-slate-800 dark:text-slate-300">
        <input
          type="checkbox"
          checked={aiConsent}
          onChange={(e) => onToggleConsent(e.target.checked)}
          className="rounded text-sky-600 focus:ring-sky-500"
        />
        <span className="font-medium">{consentToggleText}</span>
      </label>
    </div>
  );
}
