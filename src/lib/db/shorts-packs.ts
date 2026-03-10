// ============================================================
// ArangoRAW â Shorts Pack Data Operations
// ============================================================

import { ShortsPack, ShortClip, PlatformRecommendation } from '@/lib/types';
import { create, read, update, list, query, generateId, logEvent } from './store';

const COLLECTION = 'shorts_packs';

export function createShortsPack(data: {
  episode_id: string;
  clips: ShortClip[];
  captions: string[];
  platform_recommendations: PlatformRecommendation[];
  status?: 'Draft' | 'Ready' | 'Published';
}): ShortsPack {
  const now = new Date().toISOString();
  const pack: ShortsPack = {
    shorts_pack_id: generateId(),
    episode_id: data.episode_id,
    clips: data.clips,
    captions: data.captions,
    platform_recommendations: data.platform_recommendations,
    status: data.status || 'Draft',
    created_at: now,
    updated_at: now,
  };
  create(COLLECTION, pack);
  logEvent('created', 'shorts_pack', pack.shorts_pack_id, { episode_id: data.episode_id });
  return pack;
}

export function getShortsPack(id: string): ShortsPack | null {
  return read<ShortsPack>(COLLECTION, id);
}

export function getShortsByEpisode(episodeId: string): ShortsPack[] {
  return query<ShortsPack>(COLLECTION, s => s.episode_id === episodeId);
}

export function updateShortsPack(id: string, updates: Partial<ShortsPack>): ShortsPack | null {
  return update<ShortsPack>(COLLECTION, id, updates);
}

export function listShortsPacks(): ShortsPack[] {
  return list<ShortsPack>(COLLECTION);
}
