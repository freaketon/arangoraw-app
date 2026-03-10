// ============================================================
// ArangoRAW â Weekly Cycle Data Operations
// ============================================================

import { WeeklyCycle, WeeklyCycleState, WeeklyStoryTheme } from '@/lib/types';
import { create, read, update, list, query, generateId, logEvent } from './store';
import { validateWeeklyCycleTransition } from '@/lib/state-machines';

const COLLECTION = 'weekly_cycles';

export function createWeeklyCycle(data: {
  week_theme: string;
  start_date: string;
  end_date: string;
  story_theme_map?: WeeklyStoryTheme[];
  episode_ids?: string[];
  planning_state?: WeeklyCycleState;
}): WeeklyCycle {
  const now = new Date().toISOString();
  const cycle: WeeklyCycle = {
    week_id: generateId(),
    week_theme: data.week_theme,
    start_date: data.start_date,
    end_date: data.end_date,
    episode_ids: data.episode_ids || [],
    story_theme_map: data.story_theme_map || [],
    planning_state: data.planning_state || 'Planning',
    created_at: now,
    updated_at: now,
  };
  create(COLLECTION, cycle);
  logEvent('state_change', 'weekly_cycle', cycle.week_id, { new_state: cycle.planning_state });
  return cycle;
}

export function getWeeklyCycle(id: string): WeeklyCycle | null {
  return read<WeeklyCycle>(COLLECTION, id);
}

export function listWeeklyCycles(): WeeklyCycle[] {
  return list<WeeklyCycle>(COLLECTION);
}

export function getCurrentWeek(): WeeklyCycle | null {
  const now = new Date().toISOString().split('T')[0];
  const cycles = query<WeeklyCycle>(COLLECTION, c =>
    c.start_date <= now && c.end_date >= now
  );
  return cycles.length > 0 ? cycles[0] : null;
}

export function transitionWeeklyCycle(id: string, newState: WeeklyCycleState): { success: boolean; error?: string } {
  const cycle = getWeeklyCycle(id);
  if (!cycle) return { success: false, error: 'Weekly cycle not found' };
  const validation = validateWeeklyCycleTransition(cycle.planning_state, newState);
  if (!validation.valid) return { success: false, error: validation.error };
  update<WeeklyCycle>(COLLECTION, id, { planning_state: newState } as Partial<WeeklyCycle>);
  logEvent('state_change', 'weekly_cycle', id, { from: cycle.planning_state, to: newState });
  return { success: true };
}

export function addEpisodeToWeek(weekId: string, episodeId: string): WeeklyCycle | null {
  const cycle = getWeeklyCycle(weekId);
  if (!cycle) return null;
  const episodeIds = [...cycle.episode_ids, episodeId];
  return update<WeeklyCycle>(COLLECTION, weekId, { episode_ids: episodeIds } as Partial<WeeklyCycle>);
}

export function updateWeeklyCycle(id: string, updates: Partial<WeeklyCycle>): WeeklyCycle | null {
  const { planning_state, ...safeUpdates } = updates;
  void planning_state;
  return update<WeeklyCycle>(COLLECTION, id, safeUpdates);
}
