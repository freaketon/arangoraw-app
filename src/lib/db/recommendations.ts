// ============================================================
// ArangoRAW â Recommendation Engine Data Operations
// ============================================================

import { Recommendation } from '@/lib/types';
import { create, read, update, list, query, generateId } from './store';

const COLLECTION = 'recommendations';

export function createRecommendation(data: {
  week_id?: string | null;
  episode_id?: string | null;
  category: 'topic' | 'story' | 'reference' | 'hook' | 'thumbnail' | 'title' | 'pacing' | 'story_cadence';
  recommendation: string;
  evidence_source: string;
  confidence: number;
}): Recommendation {
  const now = new Date().toISOString();
  const rec: Recommendation = {
    recommendation_id: generateId(),
    week_id: data.week_id || null,
    episode_id: data.episode_id || null,
    category: data.category,
    recommendation: data.recommendation,
    evidence_source: data.evidence_source,
    confidence: data.confidence,
    created_at: now,
  };
  create(COLLECTION, rec);
  return rec;
}

export function getRecommendation(id: string): Recommendation | null {
  return read<Recommendation>(COLLECTION, id);
}

export function getRecommendationsByEpisode(episodeId: string): Recommendation[] {
  return query<Recommendation>(COLLECTION, r => r.episode_id === episodeId)
    .sort((a, b) => b.confidence - a.confidence);
}

export function getRecommendationsByWeek(weekId: string): Recommendation[] {
  return query<Recommendation>(COLLECTION, r => r.week_id === weekId)
    .sort((a, b) => b.confidence - a.confidence);
}

export function getTopRecommendations(limit: number = 10): Recommendation[] {
  return list<Recommendation>(COLLECTION)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

export function updateRecommendation(id: string, updates: Partial<Recommendation>): Recommendation | null {
  return update<Recommendation>(COLLECTION, id, updates);
}

export function listRecommendations(): Recommendation[] {
  return list<Recommendation>(COLLECTION);
}
