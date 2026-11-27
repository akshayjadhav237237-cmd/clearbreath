import { lazy, Suspense, useEffect, useMemo, type JSX } from 'react';
import { useAppStore, type NavigationTab } from './store';
import { getTranslations } from '../shared/i18n';
import { getShellDict } from '../shared/i18n/shell-dict';
import { selectCurrentAqi } from '../shared/state/selectors';
import { Badge, Toast, SegmentedControl, ErrorBoundary } from '../shared/ui';
import { AirNowPanel } from '../features/air-now';

const HouseholdPanel = lazy(() =>
  import('../features/household').then((m) => ({ default: m.HouseholdPanel }))
);
const PlanPanel = lazy(() =>
  import('../features/plan').then((m) => ({ default: m.PlanPanel }))
);
const RecommendationsPanel = lazy(() =>
  import('../features/recommendations').then((m) => ({
    default: m.RecommendationsPanel,
  }))
);
const ComparePanel = lazy(() =>
  import('../features/compare').then((m) => ({ default: m.ComparePanel }))
);
const AssistantPanel = lazy(() =>
  import('../features/assistant').then((m) => ({ default: m.AssistantPanel }))
);
const CommunityPanel = lazy(() =>
  import('../features/community').then((m) => ({ default: m.CommunityPanel }))
);

const NAV_TABS: readonly NavigationTab[] = [
  'airNow',
  'household',
  'plan',
  'actions',
  'compare',
  'assistant',
  'community',
];

const LANG_OPTIONS = [
  { value: 'en' as const, label: 'EN' },
  { value: 'hi' as const, label: 'हिन्दी' },
];

function AppHeader(): JSX.Element {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    selectedCity,
    hourlySeries,
    profile,
  } = useAppStore();
  const t = getTranslations(language);
  const shell = getShellDict(language);
  const aqi = useMemo(
    () => selectCurrentAqi({ selectedCity, hourlySeries, profile }),
    [selectedCity, hourlySeries, profile]
  );

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {t.appName}
          </h1>
          <p className="text-[11px] text-slate-700 dark:text-slate-300">
            {shell.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge severity={aqi.category}>
            {shell.aqiLabel} {aqi.value} ({t.severity[aqi.category]})
          </Badge>
          <SegmentedControl
            options={LANG_OPTIONS}
            value={language}
            onChange={setLanguage}
            ariaLabel={shell.langAria}
            size="sm"
          />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? shell.toDark : shell.toLight}
            className="rounded-lg border border-slate-200 p-[6px] text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
}

function AppNav(): JSX.Element {
  const { activeTab, setActiveTab, language } = useAppStore();
  const t = getTranslations(language);
  const shell = getShellDict(language);

  return (
    <nav
      aria-label={shell.navAria}
      className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="scrollbar-none mx-auto flex max-w-5xl overflow-x-auto px-4 sm:px-6">
        {NAV_TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-bold transition-colors ${
              activeTab === id
                ? 'border-sky-700 text-sky-700 dark:border-sky-400 dark:text-sky-400'
                : 'border-transparent text-slate-700 hover:border-slate-300 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
            }`}
          >
            {t.nav[id]}
          </button>
        ))}
      </div>
    </nav>
  );
}

/** Top-level application shell component routing vertical feature slices. */
export function App(): JSX.Element {
  const { activeTab, toastMessage, hideToast, theme, language } = useAppStore();
  const shell = getShellDict(language);
  const t = getTranslations(language);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.lang = language;
  }, [theme, language]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-sky-700 focus:px-4 focus:py-2 focus:text-white"
      >
        {shell.skipLink}
      </a>
      <AppHeader />
      <AppNav />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6"
      >
        <ErrorBoundary
          fallbackTitle={t.common.errorTitle}
          fallbackMessage={t.common.errorDesc}
        >
          <Suspense
            fallback={
              <div
                role="status"
                aria-live="polite"
                className="p-8 text-center text-xs text-slate-700 dark:text-slate-300"
              >
                {shell.loading}
              </div>
            }
          >
            {activeTab === 'airNow' && <AirNowPanel />}
            {activeTab === 'household' && <HouseholdPanel />}
            {activeTab === 'plan' && <PlanPanel />}
            {activeTab === 'actions' && <RecommendationsPanel />}
            {activeTab === 'compare' && <ComparePanel />}
            {activeTab === 'assistant' && <AssistantPanel />}
            {activeTab === 'community' && <CommunityPanel />}
          </Suspense>
        </ErrorBoundary>
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <p>{shell.footer}</p>
      </footer>
      <Toast
        message={toastMessage}
        onDismiss={hideToast}
        dismissLabel={t.common.dismissToast}
      />
    </div>
  );
}
