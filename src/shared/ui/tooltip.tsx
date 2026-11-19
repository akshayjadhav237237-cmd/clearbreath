import React, { useState } from 'react';

/** Props for accessible contextual Tooltip trigger component. */
export interface TooltipProps {
  readonly content: string;
  readonly children: React.ReactNode;
}

/** Contextual tooltip disclosing scientific citations and formula descriptions on hover or focus. */
export function Tooltip({
  content,
  children,
}: TooltipProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible ? (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-40 mb-1.5 -translate-x-1/2 whitespace-normal rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-normal text-slate-100 shadow-lg dark:border-slate-600 dark:bg-slate-800"
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
