// ============================================================
// ArangoRAW â Episode Data Operations
// ============================================================

import { Episode, EpisodeState, ApprovalState, Pillar } from '@/lib/types';
import { create, read, update, list, query, generateId, logEvent, search } from './store';
import { validateEpisodeTransition } from '@/lib/state-machines';

const COLLECTION = 'episodes';

export function createEpisode(data: {
  working_title: string;
  pillar: Pillar;
  core_thesis: string;
  mental_model: string;
  week_id?: string;
}): Episode {
  const now = new Date().toISOString();
  const episode: Episode = {
    episode_id: generateId(),
    working_title: data.working_title,
    final_title: null,
    pillar: data.pillar,
    core_thesis: data.core_thesis,
    mental_model: data.mental_model,
    week_id: data.week_id || null,
    state: 'Idea',
    primary_story_id: null,
    primary_reference_id: null,
    script_id: null,
    metadata_pack_id: null,
    thumbnail_pack_id: null,
    shorts_pack_id: null,
    publishing_packet_id: null,
    analytics_snapshot_ids: [],
    approval_state: 'Pending',
    created_at: now,
    updated_at: now,
  };

  create(COLLECTION, episode);
  logEvent('state_change', 'episode', episode.episode_id, { new_state: 'Idea' });
  return episode;
}

export function getEpisode(id: string): Episode | null {
  return read<Episode>(COLLECTION, id);
}

export function listEpisodes(): Episode[] {
  return list<Episode>(COLLECTION);
}

export function getEpisodesByState(state: EpisodeState): Episode[] {
  return query<Episode>(COLLECTION, e => e.state === state);
}

export function getEpisodesByWeek(weekId: string): Episode[] {
  return query<Episode>(COLLECTION, e => e.week_id === weekId);
}

export function transitionEpisode(id: string, newState: EpisodeState): { success: boolean; episode?: Episode; error?: string } {
  const episode = getEpisode(id);
  if (!episode) return { success: false, error: 'Episode not found' };

  const validation = validateEpisodeTransition(episode.state, newState);
  if (!validation.valid) return { success: false, error: validation.error };

  const updated = update<Episode>(COLLECTION, id, { state: newState } as Partial<Episode>);
  if (updated) {
    logEvent('state_change', 'episode', id, { from: episode.state, to: newState });
  }
  return { success: true, episode: updated! };
}

export function updateEpisode(id: string, updates: Partial<Episode>): Episode | null {
  // Prevent direct state changes through update â use transitionEpisode
  const { state, ...safeUpdates } = updates;
  void state;
  return update<Episode>(COLLECTION, id, safeUpdates);
}

export function attachStory(episodeId: string, storyId: string): Episode | null {
  const episode = getEpisode(episodeId);
  if (!episode) return null;
  const updated = update<Episode>(COLLECTION, episodeId, { primary_story_id: storyId } as Partial<Episode>);
  if (updated && (episode.state === 'Selected')) {
    transitionEpisode(episodeId, 'Story Matched');
  }
  return updated;
}

export function attachReference(episodeId: string, referenceId: string): Episode | null {
  const episode = getEpisode(episodeId);
  if (!episode) return null;
  const updated = update<Episode>(COLLECTION, episodeId, { primary_reference_id: referenceId } as Partial<Episode>);
  if (updated && episode.state === 'Story Matched') {
    transitionEpisode(episodeId, 'Research Matched');
  }
  return updated;
}

export function searchEpisodes(term: string): Episode[] {
  return search<Episode>(COLLECTION, ['working_title', 'final_title', 'core_thesis', 'mental_model', 'pillar'], term);
}
