import React from 'react';
import { APP_NAME } from '../config/constants';

/** Top-level application shell component. */
export function App(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-sky-700 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        Skip to main content
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {APP_NAME}
          </h1>
          <span className="text-xs font-medium text-slate-600">
            Air Quality Assistant
          </span>
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6"
      >
        <section
          aria-labelledby="hero-heading"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2
            id="hero-heading"
            className="text-lg font-semibold text-slate-900"
          >
            Winter Smog Protection
          </h2>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            Clearbreath helps families monitor urban air quality and plan daily
            activities safely.
          </p>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 text-center text-xs text-slate-600 sm:px-6">
          <p>&copy; 2026 Clearbreath. Built for family winter air safety.</p>
        </div>
      </footer>
    </div>
  );
}
