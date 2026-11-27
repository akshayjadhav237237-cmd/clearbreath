import type { JSX } from 'react';
import type { Action, HomeProfile } from '../../domain/contracts';
import type { ComparisonResult } from '../../domain/recommend/types';
import {
  translateActionTitle,
  translateSealingClass,
} from '../../shared/i18n/compare-action-titles';
import type { CompareTranslations } from '../../shared/i18n/compare-dict';
import type { Language } from '../../shared/i18n';
import { PickerOutcomes } from './picker-outcomes';

interface PickerProps {
  readonly actions: readonly Action[];
  readonly choiceA: Action;
  readonly choiceB: Action;
  readonly onSelectA: (id: string) => void;
  readonly onSelectB: (id: string) => void;
  readonly comparison: ComparisonResult;
  readonly outdoorPm25: number;
  readonly home: HomeProfile;
  readonly commuteKm: number;
  readonly language: Language;
  readonly dict: CompareTranslations;
}

interface SelectProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (id: string) => void;
  readonly actions: readonly Action[];
  readonly language: Language;
}

function ActionSelect({
  id,
  label,
  value,
  onChange,
  actions,
  language,
}: SelectProps): JSX.Element {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        {actions.map((action) => (
          <option key={action.id} value={action.id}>
            {translateActionTitle(action.id, action.title, language)}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Interactive two-action comparison picker powered by domain compareChoices and live context. */
export function ActionComparisonPicker({
  actions,
  choiceA,
  choiceB,
  onSelectA,
  onSelectB,
  comparison,
  outdoorPm25,
  home,
  commuteKm,
  language,
  dict,
}: PickerProps): JSX.Element {
  const titleA = translateActionTitle(choiceA.id, choiceA.title, language);
  const titleB = translateActionTitle(choiceB.id, choiceB.title, language);
  const contextText = dict.pickerContextTemplate
    .replace('{pm25}', String(outdoorPm25))
    .replace('{area}', String(home.floorAreaM2))
    .replace('{sealing}', translateSealingClass(home.sealing, language))
    .replace('{km}', String(commuteKm));

  return (
    <section
      aria-labelledby="action-compare-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h3
        id="action-compare-heading"
        className="text-base font-bold text-slate-900 dark:text-slate-100"
      >
        {dict.pickerTitle}
      </h3>
      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
        {dict.pickerSubtitle}
      </p>
      <p className="mt-2 text-xs font-medium text-sky-800 dark:text-sky-300">
        {contextText}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ActionSelect
          id="compare-choice-a"
          label={dict.choiceALabel}
          value={choiceA.id}
          onChange={onSelectA}
          actions={actions}
          language={language}
        />
        <ActionSelect
          id="compare-choice-b"
          label={dict.choiceBLabel}
          value={choiceB.id}
          onChange={onSelectB}
          actions={actions}
          language={language}
        />
      </div>

      <PickerOutcomes
        comparison={comparison}
        titleA={titleA}
        titleB={titleB}
        dict={dict}
      />
    </section>
  );
}
