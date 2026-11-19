import type { JSX } from 'react';
import type {
  Action,
  DailyPlan,
  HouseholdProfile,
} from '../../domain/contracts';
import { ACTION_CATALOG } from '../../domain/actions';

/** Props required to render the ink-saving printable smog-day action plan. */
export interface SmogDayPlanPrintProps {
  readonly profile: HouseholdProfile;
  readonly plan: DailyPlan;
  readonly currentAqi: number;
  readonly aqiCategory: string;
  readonly dateFormatted: string;
  readonly onPrint?: () => void;
}

function PrintTable({ actions }: { actions: readonly Action[] }): JSX.Element {
  return (
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b border-slate-300 print:border-black">
          <th className="py-1">Action</th>
          <th className="py-1">Category</th>
          <th className="py-1">Effort</th>
          <th className="py-1">Cost</th>
        </tr>
      </thead>
      <tbody>
        {actions.map((action) => (
          <tr
            key={action.id}
            className="border-b border-slate-100 print:border-slate-300"
          >
            <td className="py-[6px] font-semibold">{action.title}</td>
            <td className="py-[6px] capitalize">{action.category}</td>
            <td className="py-[6px]">Effort {action.effort}/3</td>
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
}: SmogDayPlanPrintProps): JSX.Element {
  const topActions = ACTION_CATALOG.slice(0, 5);

  return (
    <div className="print-plan-root rounded-xl border border-slate-300 bg-white p-6 text-slate-900 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none">
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 print:border-black">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wide print:text-2xl">
            Clearbreath • Smog-Day Family Action Plan
          </h1>
          <p className="text-xs text-slate-600 print:text-black">
            Generated on: {dateFormatted} • Household Members:{' '}
            {profile.members.length}
          </p>
        </div>
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            aria-label="Print Action Plan"
            className="rounded-lg bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 print:hidden"
          >
            Print Action Plan
          </button>
        )}
      </div>

      <div className="mb-4 rounded border border-slate-300 p-3 print:border-black">
        <h2 className="text-sm font-bold uppercase tracking-wider">
          Air Quality Status
        </h2>
        <p className="text-base font-extrabold text-slate-900 print:text-black">
          AQI {currentAqi} • {aqiCategory.toUpperCase()}
        </p>
        <p className="text-xs text-slate-700 print:text-black">
          {plan.advisorySummary}
        </p>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">
          Priority Household Interventions
        </h2>
        <PrintTable actions={topActions} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded border border-slate-200 p-2.5 print:border-black">
          <h3 className="font-bold">Ventilation Window</h3>
          <p>
            {plan.bestVentilationWindow
              ? `${plan.bestVentilationWindow.startHour}:00 - ${plan.bestVentilationWindow.endHour}:00`
              : 'Keep windows sealed all day'}
          </p>
        </div>
        <div className="rounded border border-slate-200 p-2.5 print:border-black">
          <h3 className="font-bold">Purifier Routine</h3>
          <p>High speed 21:00 - 23:00 prior to sleep</p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 print:border-black print:text-black">
        <p className="font-semibold">
          Scientific Basis: CPCB NAQI 2014, EPA Mass-Balance IAQ, WHO AQG 2021.
        </p>
        <p className="mt-1">
          Disclaimer: Clearbreath provides algorithmic exposure reduction
          advisories and does not offer clinical medical guidance.
        </p>
      </div>
    </div>
  );
}
