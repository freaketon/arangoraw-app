// ============================================================
// ArangoRAW - State Machine Validators
// ============================================================

import type { EpisodeState, WeeklyCycleState } from '@/lib/types';

// --- Episode State Transitions ---

const EPISODE_TRANSITIONS: Record<EpisodeState, EpisodeState[]> = {
  'Idea': ['Selected'],
  'Selected': ['Story Matched'],
  'Story Matched': ['Research Matched'],
  'Research Matched': ['Script Drafted'],
  'Script Drafted': ['Script Reviewed'],
  'Script Reviewed': ['Script Approved', 'Script Drafted'],
  'Script Approved': ['Packaging'],
  'Packaging': ['Package Review'],
  'Package Review': ['Final Review', 'Packaging'],
  'Final Review': ['Scheduled', 'Package Review'],
  'Scheduled': ['Published'],
  'Published': ['Archived'],
  'Archived': [],
};

export function validateEpisodeTransition(
  current: EpisodeState,
  next: EpisodeState
): { valid: boolean; error?: string } {
  const allowed = EPISODE_TRANSITIONS[current];
  if (!allowed) {
    return { valid: false, error: `Unknown episode state: ${current}` };
  }
  if (!allowed.includes(next)) {
    return {
      valid: false,
      error: `Cannot transition from "${current}" to "${next}". Allowed: ${allowed.join(', ') || 'none'}`,
    };
  }
  return { valid: true };
}

// --- Weekly Cycle State Transitions ---

const WEEKLY_CYCLE_TRANSITIONS: Record<WeeklyCycleState, WeeklyCycleState[]> = {
  'Planning': ['In Progress'],
  'In Progress': ['Review'],
  'Review': ['Complete', 'In Progress'],
  'Complete': ['Archived'],
  'Archived': [],
};

export function validateWeeklyCycleTransition(
  current: WeeklyCycleState,
  next: WeeklyCycleState
): { valid: boolean; error?: string } {
  const allowed = WEEKLY_CYCLE_TRANSITIONS[current];
  if (!allowed) {
    return { valid: false, error: `Unknown weekly cycle state: ${current}` };
  }
  if (!allowed.includes(next)) {
    return {
      valid: false,
      error: `Cannot transition from "${current}" to "${next}". Allowed: ${allowed.join(', ') || 'none'}`,
    };
  }
  return { valid: true };
}
