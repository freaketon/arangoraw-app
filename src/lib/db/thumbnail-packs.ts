// ============================================================
// ArangoRAW - Thumbnail Packs DB Module
// ============================================================

import type { ThumbnailPack } from '@/lib/types';
import { generateId, create, read, update, remove, list, query } from './store';

const COLLECTION = 'thumbnail_packs';

export function createThumbnailPack(data: {
  episode_id: string;
  concept_a: string;
  concept_b: string;
  text_options: string[];
  nano_banana_prompt_a: string;
  nano_banana_prompt_b: string;
}): ThumbnailPack {
  const now = new Date().toISOString();
  const pack: ThumbnailPack = {
    thumbnail_pack_id: generateId(COLLECTION),
    ...data,
    created_at: now,
    updated_at: now,
  };
  create(COLLECTION, pack);
  return pack;
}

export function getThumbnailPack(id: string): ThumbnailPack | null {
  return read<ThumbnailPack>(COLLECTION, id);
}

export function updateThumbnailPack(
  id: string,
  updates: Partial<ThumbnailPack>
): ThumbnailPack | null {
  return update<ThumbnailPack>(COLLECTION, id, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

export function deleteThumbnailPack(id: string): boolean {
  return remove(COLLECTION, id);
}

export function listThumbnailPacks(): ThumbnailPack[] {
  return list<ThumbnailPack>(COLLECTION);
}

export function getThumbnailPackByEpisode(episodeId: string): ThumbnailPack | null {
  const results = query<ThumbnailPack>(COLLECTION, (pack) => pack.episode_id === episodeId);
  return results.length > 0 ? results[0] : null;
}
