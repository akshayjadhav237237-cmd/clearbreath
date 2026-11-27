import { useState, type JSX } from 'react';
import type { Explanation } from '../../domain/contracts';
import { getActionCatalog } from '../../domain/actions';
import type { Language } from '../../shared/i18n';
import { translateActionDescription } from '../../shared/i18n/catalog-hi';
import { translateActionTitle } from '../../shared/i18n/compare-action-titles';
import { ConfidenceMeter } from '../../shared/ui';
import {
  getActionsDict,
  type ActionsDict,
} from '../../shared/i18n/actions-dict';
import { CardHeaderBadges, CardImpactColumn } from './card-sections';
import { WhyThisDrawer } from './why-this-drawer';

/** Evaluated recommendation item with quantified benefit metrics. */
export interface RecItem {
  readonly action: ReturnType<typeof getActionCatalog>[number];
  readonly dailyDoseReductionUg: number;
  readonly doseReductionBasisPoints: number;
  readonly co2eSavedGramsPerDay: number;
  readonly explanation?: Explanation;
}

interface ItemCardProps {
  readonly item: RecItem;
  readonly isDone: boolean;
  readonly onToggle: (actionId: string) => void;
  readonly dict?: ActionsDict;
  readonly locale?: string;
  readonly language?: Language;
  readonly estimateNote?: string;
}

/** Card sub-component presenting action benefits, costs, confidence, provenance drawer, and completion toggle. */
export function RecommendationItemCard({
  item,
  isDone,
  onToggle,
  dict = getActionsDict('en'),
  locale = 'en-IN',
  language = 'en',
  estimateNote = dict.whyThis.estimateDisclaimer,
}: ItemCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const { action, dailyDoseReductionUg, co2eSavedGramsPerDay } = item;
  const panelId = `why-this-${action.id}`;
  const costText = `${dict.card.costLabel}: ₹${action.costRupees.toLocaleString(locale)} • ${dict.card.effortLabel} ${action.effort}${dict.card.effortScaleSuffix}`;
  const titleText = translateActionTitle(action.id, action.title, language);
  const descText = translateActionDescription(
    action.id,
    action.description,
    language
  );

  return (
    <li
      className={`rounded-2xl border p-5 shadow-sm transition-all ${
        isDone
          ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 flex-1">
          <CardHeaderBadges
            category={action.category}
            confidence={action.confidence}
            costText={costText}
            isDone={isDone}
            dict={dict}
          />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {titleText}
          </h3>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {descText}
          </p>
          <div className="flex flex-wrap items-start justify-between gap-3 pt-2">
            <ConfidenceMeter
              level={action.confidence}
              explanation={estimateNote}
              language={language}
            />
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={panelId}
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100 dark:hover:bg-sky-900"
            >
              <span>{dict.whyThis.toggleBtn}</span>
              <span aria-hidden="true">{isExpanded ? '▴' : '▾'}</span>
            </button>
          </div>
        </div>
        <CardImpactColumn
          actionId={action.id}
          dailyDoseReductionUg={dailyDoseReductionUg}
          co2eSavedGramsPerDay={co2eSavedGramsPerDay}
          isDone={isDone}
          onToggle={onToggle}
          dict={dict}
          locale={locale}
        />
      </div>
      {isExpanded ? (
        <WhyThisDrawer
          panelId={panelId}
          dailyDoseReductionUg={dailyDoseReductionUg}
          doseReductionBasisPoints={item.doseReductionBasisPoints}
          co2eSavedGramsPerDay={co2eSavedGramsPerDay}
          explanation={item.explanation}
          fallbackSourceIds={action.sourceIds}
          dict={dict}
          locale={locale}
          language={language}
          estimateNote={estimateNote}
        />
      ) : null}
    </li>
  );
}
