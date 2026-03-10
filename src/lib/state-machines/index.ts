// ============================================================
// ArangoRAW â State Machines
// Explicit state transitions for Episode, WeeklyCycle, StoryIntake
// ============================================================

import { EpisodeState, WeeklyCycleState, StoryIntakeState } from '@/lib/types';

// === EPISODE STATE MACHINE ===

const EPISODE_TRANSITIONS: Record<EpisodeState, EpisodeState[]> = {
  'Idea': ['Selected'],
  'Selected': ['Story Matched', 'Idea'],
  'Story Matched': ['Research Matched', 'Selected'],
  'Research Matched': ['Script Drafted', 'Story Matched'],
  'Script Drafted': ['Script Approved', 'Research Matched'],
  'Script Approved': ['Recorded', 'Script Drafted'],
  'Recorded': ['Edited'],
  'Edited': ['Packaged', 'Recorded'],
  'Packaged': ['Ready to Publish', 'Edited'],
  'Ready to Publish': ['Published', 'Packaged'],
  'Published': ['Reviewed'],
  'Reviewed': [],
};

export function canTransitionEpisode(from: EpisodeState, to: EpisodeState): boolean {
  return EPISODE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextEpisodeStates(current: EpisodeState): EpisodeState[] {
  return EPISODE_TRANSITIONS[current] ?? [];
}

export function getEpisodeProgress(state: EpisodeState): number {
  const ORDER: EpisodeState[] = [
    'Idea', 'Selected', 'Story Matched', 'Research Matched',
    'Script Drafted', 'Script Approved', 'Recorded', 'Edited',
    'Packaged', 'Ready to Publish', 'Published', 'Reviewed',
  ];
  return Math.round(((ORDER.indexOf(state) + 1) / ORDER.length) * 100);
}

// === WEEKLY CYCLE STATE MACHINE ===

const WEEKLY_TRANSITIONS: Record<WeeklyCycleState, WeeklyCycleState[]> = {
  'Planning': ['Locked'],
  'Locked': ['Recording', 'Planning'],
  'Recording': ['Editing'],
  'Editing': ['Publishing', 'Recording'],
  'Publishing': ['Review Complete'],
  'Review Complete': [],
};

export function canTransitionWeeklyCycle(from: WeeklyCycleState, to: WeeklyCycleState): boolean {
  return WEEKLY_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextWeeklyCycleStates(current: WeeklyCycleState): WeeklyCycleState[] {
  return WEEKLY_TRANSITIONS[current] ?? [];
}

// === STORY INTAKE STATE MACHINE ===

const INTAKE_TRANSITIONS: Record<StoryIntakeState, StoryIntakeState[]> = {
  'Captured': ['Transcribed'],
  'Transcribed': ['Extracted', 'Captured'],
  'Extracted': ['Validated'],
  'Validated': ['Canonicalized', 'Follow-Up Needed'],
  'Canonicalized': [],
  'Follow-Up Needed': ['Captured', 'Extracted'],
};

export function canTransitionStoryIntake(from: StoryIntakeState, to: StoryIntakeState): boolean {
  return INTAKE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextIntakeStates(current: StoryIntakeState): StoryIntakeState[] {
  return INTAKE_TRANSITIONS[current] ?? [];
}

// === VALIDATION HELPERS ===

export function validateEpisodeTransition(from: EpisodeState, to: EpisodeState): { valid: boolean; error?: string } {
  if (canTransitionEpisode(from, to)) {
    return { valid: true };
  }
  const allowed = getNextEpisodeStates(from);
  return {
    valid: false,
    error: `Cannot transition episode from "${from}" to "${to}". Allowed transitions: ${allowed.length ? allowed.join(', ') : 'none (terminal state)'}`,
  };
}

export function validateWeeklyCycleTransition(from: WeeklyCycleState, to: WeeklyCycleState): { valid: boolean; error?: string } {
  if (canTransitionWeeklyCycle(from, to)) {
    return { valid: true };
  }
  const allowed = getNextWeeklyCycleStates(from);
  return {
    valid: false,
    error: `Cannot transition weekly cycle from "${from}" to "${to}". Allowed: ${allowed.length ? allowed.join(', ') : 'none (terminal state)'}`,
  };
}
