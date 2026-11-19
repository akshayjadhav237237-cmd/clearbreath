import type { StoragePort } from '../shared/ports';
import { useAppStore } from './store';
import {
  loadPersistedState,
  savePersistedState,
  type PersistedStateV1,
} from '../persistence';

/** Connects the centralized application store to versioned storage persistence. */
export function initStorageSync(storage: StoragePort): () => void {
  const store = useAppStore.getState();

  // Initial load and hydration
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
  } else if (
    loadResult.error.code === 'INVALID_SCHEMA' ||
    loadResult.error.code === 'MIGRATION_FAILED'
  ) {
    store.showToast(
      'Corrupted or incompatible stored data reset to default family profile.'
    );
  }

  // Subscribe to changes and write forward
  const unsubscribe = useAppStore.subscribe((state) => {
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

  return unsubscribe;
}
