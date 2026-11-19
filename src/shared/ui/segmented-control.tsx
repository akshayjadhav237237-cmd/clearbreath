import type { JSX } from 'react';

/** Option item configuration for SegmentedControl options. */
interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

/** Props for keyboard-accessible SegmentedControl switcher. */
export interface SegmentedControlProps<T extends string> {
  readonly options: readonly SegmentedOption<T>[];
  readonly value: T;
  readonly onChange: (val: T) => void;
  readonly ariaLabel: string;
  readonly size?: 'sm' | 'md';
}

/** Accessible segmented control toggle for binary or multi-option state selection. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
}: SegmentedControlProps<T>): JSX.Element {
  const padClass =
    size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-[6px] text-sm';

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-950"
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={`rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${padClass} ${
              isSelected
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-50'
                : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
