import type { StoragePort } from '../shared/ports';
import { useAppStore } from './store';
import {
  loadPersistedState,
  savePersistedState,
  type PersistedStateV1,
} from '../persistence';

function hydrateInitialState(storage: StoragePort): void {
  const loadResult = loadPersistedState(storage);
  if (loadResult.ok) {
    const s = loadResult.value;
    useAppStore.setState({
      profile: s.profile,
      language: s.language,
      completedActionIds: s.completedActionIds,
      aiConsent: s.aiConsent,
      selectedCity: s.selectedCity,
    });
    return;
  }
  const code = loadResult.error.code;
  if (
    code === 'INVALID_SCHEMA' ||
    code === 'MIGRATION_FAILED' ||
    code === 'PAYLOAD_TOO_LARGE'
  ) {
    useAppStore
      .getState()
      .showToast(
        'Corrupted or incompatible stored data reset to default family profile.'
      );
  }
}

/** Connects the centralized application store to versioned storage persistence. */
export function initStorageSync(storage: StoragePort): () => void {
  hydrateInitialState(storage);
  let prev = useAppStore.getState();

  return useAppStore.subscribe((state) => {
    const unchanged =
      state.profile === prev.profile &&
      state.language === prev.language &&
      state.completedActionIds === prev.completedActionIds &&
      state.aiConsent === prev.aiConsent &&
      state.selectedCity === prev.selectedCity;
    if (unchanged) return;
    prev = state;
    const payload: PersistedStateV1 = {
      version: 1,
      profile: state.profile,
      language: state.language,
      completedActionIds: state.completedActionIds,
      aiConsent: state.aiConsent,
      selectedCity: state.selectedCity,
      updatedAt: Date.now(),
    };
    savePersistedState(storage, payload);
  });
}
