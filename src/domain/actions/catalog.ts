import type { Action, ActionCategory } from '../contracts';
import { INDOOR_ACTIONS } from './indoor';
import { MOBILITY_ACTIONS } from './mobility';
import { OUTDOOR_ACTIONS } from './outdoor';
import { HOUSEHOLD_ACTIONS } from './household';
import { COMMUNITY_ACTIONS } from './community';

/** Complete curated registry of particulate matter and carbon reduction actions. */
export const ACTION_CATALOG: readonly Action[] = [
  ...INDOOR_ACTIONS,
  ...MOBILITY_ACTIONS,
  ...OUTDOOR_ACTIONS,
  ...HOUSEHOLD_ACTIONS,
  ...COMMUNITY_ACTIONS,
];

/** Index map of actions keyed by unique action identifier. */
export const ACTION_MAP: ReadonlyMap<string, Action> = new Map(
  ACTION_CATALOG.map((action) => [action.id, action])
);

/** Returns the entire frozen catalog of particulate mitigation actions. */
export function getActionCatalog(): readonly Action[] {
  return ACTION_CATALOG;
}

/** Retrieves a specific mitigation action by its unique identifier. */
export function getActionById(id: string): Action | undefined {
  return ACTION_MAP.get(id);
}

/** Returns all mitigation actions matching the specified category domain. */
export function getActionsByCategory(
  category: ActionCategory
): readonly Action[] {
  return ACTION_CATALOG.filter((action) => action.category === category);
}
