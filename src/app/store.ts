import { create } from 'zustand';
import type { HouseholdProfile } from '../domain/contracts';
import type { HourlySeries, Language } from '../ai/contracts';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../config/persona';
import { PRESETS, type PresetKey } from '../config';

/** Primary application navigation view identifiers. */
export type NavigationTab =
  | 'airNow'
  | 'household'
  | 'plan'
  | 'actions'
  | 'compare'
  | 'assistant'
  | 'community';

/** Global interactive application state interface. */
export interface AppState {
  readonly activeTab: NavigationTab;
  readonly language: Language;
  readonly theme: 'light' | 'dark';
  readonly selectedCity: string;
  readonly profile: HouseholdProfile;
  readonly activePreset: PresetKey;
  readonly completedActionIds: readonly string[];
  readonly hourlySeries: HourlySeries | null;
  readonly isAirDataLoading: boolean;
  readonly airDataError: string | null;
  readonly aiConsent: boolean;
  readonly toastMessage: string | null;

  readonly setActiveTab: (tab: NavigationTab) => void;
  readonly setLanguage: (language: Language) => void;
  readonly toggleTheme: () => void;
  readonly setSelectedCity: (city: string) => void;
  readonly setProfile: (profile: HouseholdProfile) => void;
  readonly loadPreset: (
    key: 'delhiFamily' | 'puneStudent' | 'mumbaiSenior'
  ) => void;
  readonly toggleActionCompleted: (actionId: string) => void;
  readonly setHourlySeries: (series: HourlySeries | null) => void;
  readonly setAirDataLoading: (loading: boolean) => void;
  readonly setAirDataError: (error: string | null) => void;
  readonly setAiConsent: (consent: boolean) => void;
  readonly showToast: (message: string) => void;
  readonly hideToast: () => void;
}

/** Centralized Zustand application state store. */
export const useAppStore = create<AppState>((set) => ({
  activeTab: 'airNow',
  language: 'en',
  theme: 'light',
  selectedCity: 'Delhi',
  profile: DEFAULT_HOUSEHOLD_PERSONA,
  activePreset: 'delhiFamily',
  completedActionIds: [],
  hourlySeries: null,
  isAirDataLoading: false,
  airDataError: null,
  aiConsent: false,
  toastMessage: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setLanguage: (language) => set({ language }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setSelectedCity: (selectedCity) => set({ selectedCity }),
  setProfile: (profile) => set({ profile, activePreset: 'custom' }),
  loadPreset: (key) => set({ profile: PRESETS[key], activePreset: key }),
  toggleActionCompleted: (actionId) =>
    set((state) => {
      const exists = state.completedActionIds.includes(actionId);
      const updated = exists
        ? state.completedActionIds.filter((id) => id !== actionId)
        : [...state.completedActionIds, actionId];
      return { completedActionIds: updated };
    }),
  setHourlySeries: (hourlySeries) => set({ hourlySeries }),
  setAirDataLoading: (isAirDataLoading) => set({ isAirDataLoading }),
  setAirDataError: (airDataError) => set({ airDataError }),
  setAiConsent: (aiConsent) => set({ aiConsent }),
  showToast: (toastMessage) => set({ toastMessage }),
  hideToast: () => set({ toastMessage: null }),
}));
