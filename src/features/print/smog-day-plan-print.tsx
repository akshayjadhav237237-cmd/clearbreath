import type { JSX } from 'react';
import type {
  Action,
  DailyPlan,
  HouseholdProfile,
} from '../../domain/contracts';
import { ACTION_CATALOG } from '../../domain/actions';
import type { Language } from '../../shared/i18n';
import { translatePlanAdvisory } from '../../shared/i18n/catalog-hi';
import { translateActionTitle } from '../../shared/i18n/compare-action-titles';
import { getPlanDict, type PlanDict } from '../../shared/i18n/plan-dict';

/** Props required to render the ink-saving printable smog-day action plan. */
export interface SmogDayPlanPrintProps {
  readonly profile: HouseholdProfile;
  readonly plan: DailyPlan;
  readonly currentAqi: number;
  readonly aqiCategory: string;
  readonly dateFormatted: string;
  readonly onPrint?: () => void;
  readonly language?: Language;
}

function resolveSeverityLabel(dict: PlanDict, aqiCategory: string): string {
  const map: Record<string, string> = dict.severity;
  if (Object.prototype.hasOwnProperty.call(map, aqiCategory)) {
    return map[aqiCategory] ?? aqiCategory.toUpperCase();
  }
  return aqiCategory.toUpperCase();
}

function PrintTable({
  actions,
  dict,
  language,
}: {
  readonly actions: readonly Action[];
  readonly dict: PlanDict;
  readonly language: Language;
}): JSX.Element {
  return (
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b border-slate-300 print:border-black">
          <th className="py-1">{dict.print.colAction}</th>
          <th className="py-1">{dict.print.colCategory}</th>
          <th className="py-1">{dict.print.colEffort}</th>
          <th className="py-1">{dict.print.colCost}</th>
        </tr>
      </thead>
      <tbody>
        {actions.map((action) => (
          <tr
            key={action.id}
            className="border-b border-slate-100 print:border-slate-300"
          >
            <td className="py-[6px] font-semibold">
              {translateActionTitle(action.id, action.title, language)}
            </td>
            <td className="py-[6px] capitalize">
              {dict.categories[action.category]}
            </td>
            <td className="py-[6px]">
              {dict.print.effortPrefix} {action.effort}/3
            </td>
            <td className="py-[6px]">₹{action.costRupees}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Renders high-contrast ink-saving printable family action plan for winter smog emergencies. */
export function SmogDayPlanPrint({
  profile,
  plan,
  currentAqi,
  aqiCategory,
  dateFormatted,
  onPrint,
  language = 'en',
}: SmogDayPlanPrintProps): JSX.Element {
  const dict = getPlanDict(language);
  const topActions = ACTION_CATALOG.slice(0, 5);
  const severityLabel = resolveSeverityLabel(dict, aqiCategory);
  const vent = plan.bestVentilationWindow;

  return (
    <div className="print-plan-root rounded-xl border border-slate-300 bg-white p-6 text-slate-900 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none">
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 print:border-black">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wide print:text-2xl">
            {dict.print.title}
          </h1>
          <p className="text-xs text-slate-600 print:text-black">
            {dict.print.generatedOn} {dateFormatted} •{' '}
            {dict.print.householdMembers} {profile.members.length}
          </p>
        </div>
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            aria-label={dict.print.printActionPlan}
            className="rounded-lg bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 print:hidden"
          >
            {dict.print.printActionPlan}
          </button>
        )}
      </div>

      <div className="mb-4 rounded border border-slate-300 p-3 print:border-black">
        <h2 className="text-sm font-bold uppercase tracking-wider">
          {dict.print.airQualityStatus}
        </h2>
        <p className="text-base font-extrabold text-slate-900 print:text-black">
          {dict.print.aqiPrefix} {currentAqi} • {severityLabel}
        </p>
        <p className="text-xs text-slate-700 print:text-black">
          {translatePlanAdvisory(plan.advisorySummary, language)}
        </p>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">
          {dict.print.priorityHeading}
        </h2>
        <PrintTable actions={topActions} dict={dict} language={language} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded border border-slate-200 p-2.5 print:border-black">
          <h3 className="font-bold">{dict.print.ventilationWindow}</h3>
          <p>
            {vent
              ? `${vent.startHour}:00 - ${vent.endHour}:00`
              : dict.print.keepWindowsClosed}
          </p>
        </div>
        <div className="rounded border border-slate-200 p-2.5 print:border-black">
          <h3 className="font-bold">{dict.print.purifierRoutine}</h3>
          <p>{dict.print.purifierNightBoost}</p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-600 print:border-black print:text-black">
        <p className="font-semibold">{dict.print.scientificBasis}</p>
        <p className="mt-1">{dict.print.disclaimer}</p>
      </div>
    </div>
  );
}
