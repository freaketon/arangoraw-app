// ============================================================
// ArangoRAW â Metadata Pack Data Operations
// ============================================================

import { MetadataPack } from '@/lib/types';
import { create, read, update, list, query, generateId, logEvent } from './store';

const COLLECTION = 'metadata_packs';

export function createMetadataPack(data: {
  episode_id: string;
  title_options: string[];
  recommended_title: string;
  description: string;
  pinned_comment: string;
  yt_shorts_caption?: string;
  ig_reel_caption?: string;
  ig_story_copy_options?: string[];
}): MetadataPack {
  const now = new Date().toISOString();
  const pack: MetadataPack = {
    metadata_pack_id: generateId(),
    episode_id: data.episode_id,
    title_options: data.title_options,
    recommended_title: data.recommended_title,
    description: data.description,
    pinned_comment: data.pinned_comment,
    yt_shorts_caption: data.yt_shorts_caption || '',
    ig_reel_caption: data.ig_reel_caption || '',
    ig_story_copy_options: data.ig_story_copy_options || [],
    created_at: now,
    updated_at: now,
  };
  create(COLLECTION, pack);
  logEvent('created', 'metadata_pack', pack.metadata_pack_id, { episode_id: data.episode_id });
  return pack;
}

export function getMetadataPack(id: string): MetadataPack | null {
  return read<MetadataPack>(COLLECTION, id);
}

export function getMetadataByEpisode(episodeId: string): MetadataPack[] {
  return query<MetadataPack>(COLLECTION, m => m.episode_id === episodeId);
}

export function updateMetadataPack(id: string, updates: Partial<MetadataPack>): MetadataPack | null {
  return update<MetadataPack>(COLLECTION, id, updates);
}

export function listMetadataPacks(): MetadataPack[] {
  return list<MetadataPack>(COLLECTION);
}
