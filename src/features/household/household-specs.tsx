import { useState, type JSX } from 'react';
import type { HomeProfile } from '../../domain/contracts';
import {
  getHouseholdSpecDict,
  type HouseholdSpecDict,
} from '../../shared/i18n/household-dict';

interface HouseholdHomeSpecsProps {
  readonly home: HomeProfile;
  readonly budgetRupees: number;
  readonly title: string;
  readonly budgetTitle?: string;
  readonly specDict?: HouseholdSpecDict;
  readonly onBudgetChange: (newBudget: number) => void;
}

/** Component presenting housing specs and editable budget with input validation. */
export function HouseholdHomeSpecs({
  home,
  budgetRupees,
  title,
  budgetTitle = 'Monthly Mitigation Budget (₹)',
  specDict = getHouseholdSpecDict('en'),
  onBudgetChange,
}: HouseholdHomeSpecsProps): JSX.Element {
  const [budgetInput, setBudgetInput] = useState(String(budgetRupees));
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (val: string) => {
    setBudgetInput(val);
    const parsed = Number(val);
    if (!val.trim() || isNaN(parsed) || parsed < 0 || parsed > 500000) {
      setError(specDict.budgetError);
    } else {
      setError(null);
      onBudgetChange(Math.floor(parsed));
    }
  };

  return (
    <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-slate-700 dark:text-slate-300">
            {specDict.homeTypeLabel}
          </span>
          <p className="mt-1 font-semibold capitalize text-slate-900 dark:text-slate-100">
            {specDict.homeTypes[home.type]}
          </p>
        </div>
        <div>
          <span className="text-slate-700 dark:text-slate-300">
            {specDict.floorAreaLabel}
          </span>
          <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
            {home.floorAreaM2} {specDict.sqMetersUnit}
          </p>
        </div>
        <div>
          <span className="text-slate-700 dark:text-slate-300">
            {specDict.sealingLabel}
          </span>
          <p className="mt-1 font-semibold capitalize text-slate-900 dark:text-slate-100">
            {specDict.sealingTypes[home.sealing]}
          </p>
        </div>
        <div>
          <span className="text-slate-700 dark:text-slate-300">
            {specDict.cookingFuelLabel}
          </span>
          <p className="mt-1 font-semibold uppercase text-slate-900 dark:text-slate-100">
            {specDict.fuels[home.cookingFuel]}
          </p>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
        <label
          htmlFor="household-budget-input"
          className="block font-medium text-slate-700 dark:text-slate-300"
        >
          {budgetTitle}
        </label>
        <input
          id="household-budget-input"
          type="number"
          value={budgetInput}
          aria-invalid={error !== null}
          aria-describedby={error ? 'household-budget-error' : undefined}
          onChange={(e) => handleInputChange(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-1.5 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        {error ? (
          <p
            id="household-budget-error"
            role="alert"
            className="mt-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300"
          >
            {error}
          </p>
        ) : null}
      </div>
    </article>
  );
}
