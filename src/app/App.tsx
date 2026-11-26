import { lazy, Suspense, useEffect, type JSX } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, type NavigationTab } from './store';
import { APP_NAME } from '../config/constants';
import { getTranslations } from '../shared/i18n';
import { Toast, SegmentedControl, ErrorBoundary } from '../shared/ui';
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

/** Header component presenting application branding, bilingual controls, and theme toggle. */
function AppHeader(): JSX.Element {
  const { language, setLanguage, theme, toggleTheme } = useAppStore(
    useShallow((s) => ({
      language: s.language,
      setLanguage: s.setLanguage,
      theme: s.theme,
      toggleTheme: s.toggleTheme,
    }))
  );
  const langOptions = [
    { value: 'en' as const, label: 'EN' },
    { value: 'hi' as const, label: 'हिन्दी' },
  ];

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {APP_NAME}
          </h1>
          <p className="text-[11px] text-slate-700 dark:text-slate-300">
            Winter Smog Assistant
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SegmentedControl
            options={langOptions}
            value={language}
            onChange={setLanguage}
            ariaLabel="Language Selector"
            size="sm"
          />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="rounded-lg border border-slate-200 p-[6px] text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
}

/** Primary tab navigation bar for switching between vertical domain views. */
function AppNav(): JSX.Element {
  const { activeTab, setActiveTab, language } = useAppStore(
    useShallow((s) => ({
      activeTab: s.activeTab,
      setActiveTab: s.setActiveTab,
      language: s.language,
    }))
  );
  const t = getTranslations(language);

  const tabs: readonly { id: NavigationTab; label: string }[] = [
    { id: 'airNow', label: t.nav.airNow },
    { id: 'household', label: t.nav.household },
    { id: 'plan', label: t.nav.plan },
    { id: 'actions', label: t.nav.actions },
    { id: 'compare', label: t.nav.compare },
    { id: 'assistant', label: t.nav.assistant },
    { id: 'community', label: t.nav.community },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mx-auto flex max-w-5xl overflow-x-auto px-4 sm:px-6 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'border-sky-700 text-sky-700 dark:border-sky-400 dark:text-sky-400'
                : 'border-transparent text-slate-700 hover:border-slate-300 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

/** Top-level application shell component routing vertical feature slices. */
export function App(): JSX.Element {
  const activeTab = useAppStore((s) => s.activeTab);
  const toastMessage = useAppStore((s) => s.toastMessage);
  const hideToast = useAppStore((s) => s.hideToast);
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-sky-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <AppHeader />
      <AppNav />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6"
      >
        <ErrorBoundary>
          <Suspense
            fallback={
              <div
                role="status"
                aria-live="polite"
                className="p-8 text-center text-xs text-slate-700 dark:text-slate-300"
              >
                Loading view...
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
        <p>
          &copy; 2026 Clearbreath • CPCB NAQI & EPA Mass-Balance Air Quality
          Models
        </p>
      </footer>
      <Toast message={toastMessage} onDismiss={hideToast} />
    </div>
  );
}
