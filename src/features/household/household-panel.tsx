import type { JSX } from 'react';
import { useAppStore } from '../../app/store';
import { determineHouseholdSensitivity } from '../../domain/profile';
import { Badge, SegmentedControl, type BadgeSeverity } from '../../shared/ui';
import { getTranslations } from '../../shared/i18n';
import type {
  HomeProfile,
  Member,
  SensitivityLevel,
} from '../../domain/contracts';

function getSensitivitySeverity(level: SensitivityLevel): BadgeSeverity {
  if (level === 'high') return 'severe';
  if (level === 'elevated') return 'poor';
  return 'good';
}

function HouseholdMembersList({
  members,
  title,
}: {
  readonly members: readonly Member[];
  readonly title: string;
}): JSX.Element {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        {title} ({members.length})
      </h3>
      <ul className="mt-4 divide-y divide-slate-100 text-xs dark:divide-slate-800">
        {members.map((member, index) => (
          <li
            key={member.id}
            className="flex items-center justify-between py-2.5"
          >
            <span className="font-medium capitalize text-slate-900 dark:text-slate-100">
              {index + 1}. {member.ageGroup}
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {member.respiratoryCondition
                ? '⚠️ Respiratory Condition'
                : 'Healthy'}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function HouseholdHomeSpecs({
  home,
  budgetRupees,
  title,
}: {
  readonly home: HomeProfile;
  readonly budgetRupees: number;
  readonly title: string;
}): JSX.Element {
  return (
    <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-slate-700 dark:text-slate-300">Home Type</span>
          <p className="mt-1 font-semibold capitalize text-slate-900 dark:text-slate-100">
            {home.type}
          </p>
        </div>
        <div>
          <span className="text-slate-700 dark:text-slate-300">Floor Area</span>
          <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
            {home.floorAreaM2} m²
          </p>
        </div>
        <div>
          <span className="text-slate-700 dark:text-slate-300">
            Building Sealing
          </span>
          <p className="mt-1 font-semibold capitalize text-slate-900 dark:text-slate-100">
            {home.sealing}
          </p>
        </div>
        <div>
          <span className="text-slate-700 dark:text-slate-300">
            Cooking Fuel
          </span>
          <p className="mt-1 font-semibold uppercase text-slate-900 dark:text-slate-100">
            {home.cookingFuel}
          </p>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
        <span className="text-slate-700 dark:text-slate-300">
          Monthly Mitigation Budget
        </span>
        <p className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-slate-50">
          ₹{budgetRupees.toLocaleString('en-IN')}
        </p>
      </div>
    </article>
  );
}

/** Interactive household demographic and living envelope profile configuration panel. */
export function HouseholdPanel(): JSX.Element {
  const { profile, activePreset, loadPreset, language } = useAppStore();
  const t = getTranslations(language);
  const sensitivity = determineHouseholdSensitivity(profile.members);

  const presetOptions = [
    { value: 'delhiFamily', label: t.household.delhiFamily },
    { value: 'puneStudent', label: t.household.puneStudent },
    { value: 'mumbaiSenior', label: t.household.mumbaiSenior },
  ] as const;

  return (
    <section aria-labelledby="household-heading" className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="household-heading"
              className="text-xl font-bold text-slate-900 dark:text-slate-50"
            >
              {t.household.title}
            </h2>
            <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
              {t.household.desc}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Sensitivity:
            </span>
            <Badge severity={getSensitivitySeverity(sensitivity)}>
              {sensitivity.toUpperCase()} RISK
            </Badge>
          </div>
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t.household.presetsTitle}
          </label>
          <div className="mt-2">
            <SegmentedControl
              options={presetOptions}
              value={activePreset === 'custom' ? 'delhiFamily' : activePreset}
              onChange={(val) =>
                loadPreset(
                  val as 'delhiFamily' | 'puneStudent' | 'mumbaiSenior'
                )
              }
              ariaLabel={t.household.presetsTitle}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <HouseholdMembersList
          members={profile.members}
          title={t.household.membersTitle}
        />
        <HouseholdHomeSpecs
          home={profile.home}
          budgetRupees={profile.lifestyle.budgetRupees}
          title={t.household.homeTitle}
        />
      </div>
    </section>
  );
}
