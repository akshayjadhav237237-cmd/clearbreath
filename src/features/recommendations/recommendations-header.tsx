import type { JSX } from 'react';
import { Badge, MetricCard } from '../../shared/ui';
import type { ActionsDict } from '../../shared/i18n/actions-dict';
import type { ActionCategory, AqiResult } from '../../domain/contracts';

interface HeaderProps {
  readonly aqi: AqiResult;
  readonly selectedCity: string;
  readonly totalAvoidedDoseUg: number;
  readonly totalEmissionsSavedG: number;
  readonly completedCount: number;
  readonly selectedCategory: ActionCategory | 'all';
  readonly onSelectCategory: (cat: ActionCategory | 'all') => void;
  readonly dict: ActionsDict;
  readonly locale: string;
}

function buildCategories(
  dict: ActionsDict
): readonly { id: ActionCategory | 'all'; label: string }[] {
  return [
    { id: 'all', label: dict.categories.all },
    { id: 'indoor', label: dict.categories.indoor },
    { id: 'mobility', label: dict.categories.mobility },
    { id: 'outdoor', label: dict.categories.outdoor },
    { id: 'household', label: dict.categories.household },
    { id: 'community', label: dict.categories.community },
  ];
}

/** Header panel rendering live AQI context, summary metrics, and category filter buttons. */
export function RecommendationsHeader({
  aqi,
  selectedCity,
  totalAvoidedDoseUg,
  totalEmissionsSavedG,
  completedCount,
  selectedCategory,
  onSelectCategory,
  dict,
  locale,
}: HeaderProps): JSX.Element {
  const categories = buildCategories(dict);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="recommendations-heading"
            className="text-xl font-bold text-slate-900 dark:text-slate-50"
          >
            {dict.heading}
          </h2>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
            {dict.subtitle}
          </p>
        </div>
        <Badge severity={aqi.category}>
          {dict.summary.liveContextPrefix}: {selectedCity} •{' '}
          {dict.summary.aqiLabel} {aqi.value}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          label={dict.summary.avoidedDoseLabel}
          value={totalAvoidedDoseUg.toLocaleString(locale)}
          unit={dict.summary.avoidedDoseUnit}
          deltaType="positive"
          delta={`${completedCount} ${dict.summary.actionsAppliedSuffix}`}
        />
        <MetricCard
          label={dict.summary.avoidedCo2Label}
          value={totalEmissionsSavedG.toLocaleString(locale)}
          unit={dict.summary.avoidedCo2Unit}
          deltaType="positive"
          delta={dict.summary.communityBenefit}
        />
      </div>
      <nav
        aria-label={dict.categoryNavAriaLabel}
        className="mt-6 flex flex-wrap gap-2"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={selectedCategory === cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`rounded-lg px-3 py-[6px] text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              selectedCategory === cat.id
                ? 'bg-sky-700 text-white hover:bg-sky-800'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
