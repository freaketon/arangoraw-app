// ============================================================
// ArangoRAW â Analytics Snapshot Data Operations
// ============================================================

import { AnalyticsSnapshot, Platform } from '@/lib/types';
import { create, read, list, query, generateId } from './store';

const COLLECTION = 'analytics_snapshots';

export function createSnapshot(data: {
  platform: Platform;
  content_id: string;
  episode_id: string | null;
  date_captured: string;
  snapshot_window: '1h' | '24h' | '72h' | '7d' | '30d';
  views: number;
  ctr: number;
  watch_time: number;
  avg_view_duration: number;
  subscribers_gained: number;
  saves: number;
  shares: number;
  profile_visits: number;
  story_completion?: number | null;
  qualitative_notes?: string;
}): AnalyticsSnapshot {
  const now = new Date().toISOString();
  const snapshot: AnalyticsSnapshot = {
    analytics_snapshot_id: generateId(),
    platform: data.platform,
    content_id: data.content_id,
    episode_id: data.episode_id,
    date_captured: data.date_captured,
    snapshot_window: data.snapshot_window,
    views: data.views,
    ctr: data.ctr,
    watch_time: data.watch_time,
    avg_view_duration: data.avg_view_duration,
    subscribers_gained: data.subscribers_gained,
    saves: data.saves,
    shares: data.shares,
    profile_visits: data.profile_visits,
    story_completion: data.story_completion ?? null,
    qualitative_notes: data.qualitative_notes || '',
    created_at: now,
  };
  create(COLLECTION, snapshot);
  return snapshot;
}

export function getSnapshot(id: string): AnalyticsSnapshot | null {
  return read<AnalyticsSnapshot>(COLLECTION, id);
}

export function getSnapshotsByEpisode(episodeId: string): AnalyticsSnapshot[] {
  return query<AnalyticsSnapshot>(COLLECTION, s => s.episode_id === episodeId)
    .sort((a, b) => new Date(b.date_captured).getTime() - new Date(a.date_captured).getTime());
}

export function getLatestSnapshot(episodeId: string, platform?: Platform): AnalyticsSnapshot | null {
  const snapshots = query<AnalyticsSnapshot>(COLLECTION, s =>
    s.episode_id === episodeId && (!platform || s.platform === platform)
  ).sort((a, b) => new Date(b.date_captured).getTime() - new Date(a.date_captured).getTime());
  return snapshots.length > 0 ? snapshots[0] : null;
}

export function getTopPerformers(metric: 'views' | 'ctr' | 'watch_time', limit = 10): AnalyticsSnapshot[] {
  return list<AnalyticsSnapshot>(COLLECTION)
    .sort((a, b) => (b[metric] as number) - (a[metric] as number))
    .slice(0, limit);
}

export function getSnapshotsByDateRange(start: string, end: string): AnalyticsSnapshot[] {
  return query<AnalyticsSnapshot>(COLLECTION, s =>
    s.date_captured >= start && s.date_captured <= end
  );
}

export function listSnapshots(): AnalyticsSnapshot[] {
  return list<AnalyticsSnapshot>(COLLECTION);
}
