'use client';

import { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Badge, { PillarBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

export default function AnalyticsPage() {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    async function load() {
      try {
        const [snapRes, epRes, recRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/episodes'),
          fetch('/api/search?type=recommendations'),
        ]);
        const snaps = snapRes.ok ? await snapRes.json() : [];
        const eps = epRes.ok ? await epRes.json() : [];
        const recs = recRes.ok ? await recRes.json() : [];
        setSnapshots(Array.isArray(snaps) ? snaps : []);
        setEpisodes(Array.isArray(eps) ? eps : []);
        setRecommendations(Array.isArray(recs) ? recs : []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="text-text-muted text-sm text-center py-12">Loading analytics...</div>;

  // Build episode lookup
  const epMap = new Map(episodes.map((e: any) => [e.episode_id, e]));

  // Enrich snapshots with episode data
  const enriched = snapshots.map(s => ({
    ...s,
    episode: epMap.get(s.episode_id),
  })).sort((a, b) => (b.views || 0) - (a.views || 0));

  // Aggregate stats
  const totalViews = enriched.reduce((sum, s) => sum + (s.views || 0), 0);
  const avgCTR = enriched.length > 0 ? (enriched.reduce((sum, s) => sum + (s.ctr || 0), 0) / enriched.length).toFixed(1) : 'â';
  const totalWatchHours = enriched.reduce((sum, s) => sum + (s.watch_time_hours || 0), 0);
  const avgRetention = enriched.length > 0 ? (enriched.reduce((sum, s) => sum + (s.avg_view_duration || 0), 0) / enriched.length).toFixed(1) : 'â';

  const stats = [
    { label: 'Total Views', value: totalViews.toLocaleString(), color: 'text-accent-gold' },
    { label: 'Avg CTR', value: `${avgCTR}%`, color: 'text-accent-blue' },
    { label: 'Watch Hours', value: `${totalWatchHours.toLocaleString()}h`, color: 'text-accent-green' },
    { label: 'Avg Retention', value: `${avgRetention}%`, color: 'text-accent-purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-bg-secondary rounded p-1">
          {(['7d', '30d', '90d', 'all'] as const).map(r => (
            <button key={r} onClick={() => setTimeRange(r)}
              className={`text-xs px-3 py-1.5 rounded transition-colors ${timeRange === r ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
              {r === 'all' ? 'All Time' : `${r.replace('d', '')} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardBody>
              <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1">{stat.label}</div>
              <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Performance Table */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <span className="text-sm font-medium text-text-primary">Episode Performance</span>
            </CardHeader>
            <CardBody>
              {enriched.length === 0 ? (
                <div className="text-text-muted text-sm text-center py-8">No analytics data yet.</div>
              ) : (
                <div className="space-y-1">
                  {/* Table Header */}
                  <div className="grid grid-cols-6 gap-2 text-[10px] text-text-muted uppercase tracking-wider py-2 border-b border-border">
                    <div className="col-span-2">Episode</div>
                    <div className="text-right">Views</div>
                    <div className="text-right">CTR</div>
                    <div className="text-right">Watch Hrs</div>
                    <div className="text-right">Retention</div>
                  </div>
                  {enriched.map(s => (
                    <div key={s.snapshot_id} className="grid grid-cols-6 gap-2 py-2 text-xs hover:bg-bg-hover rounded transition-colors">
                      <div className="col-span-2 text-text-primary truncate">{s.episode?.title || s.episode_id?.slice(0, 12) || 'â'}</div>
                      <div className="text-right text-text-secondary">{s.views?.toLocaleString() || 'â'}</div>
                      <div className="text-right text-text-secondary">{s.ctr ? `${s.ctr}%` : 'â'}</div>
                      <div className="text-right text-text-secondary">{s.watch_time_hours || 'â'}</div>
                      <div className="text-right text-text-secondary">{s.avg_view_duration ? `${s.avg_view_duration}%` : 'â'}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <span className="text-sm font-medium text-text-primary">AI Recommendations</span>
            </CardHeader>
            <CardBody>
              {recommendations.length === 0 ? (
                <div className="text-xs text-text-muted">No recommendations yet. Analytics data drives AI suggestions.</div>
              ) : (
                <div className="space-y-3">
                  {recommendations.slice(0, 5).map((rec: any) => (
                    <div key={rec.recommendation_id} className="py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={rec.priority === 'High' ? 'red' : rec.priority === 'Medium' ? 'amber' : 'default'}>
                          {rec.priority || 'Normal'}
                        </Badge>
                        <Badge variant="muted">{rec.type || 'General'}</Badge>
                      </div>
                      <div className="text-xs text-text-secondary">{rec.recommendation_text}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <span className="text-sm font-medium text-text-primary">Top Performers</span>
            </CardHeader>
            <CardBody>
              {enriched.length === 0 ? (
                <div className="text-xs text-text-muted">No data available.</div>
              ) : (
                <div className="space-y-2">
                  {enriched.slice(0, 3).map((s, i) => (
                    <div key={s.snapshot_id} className="flex items-center gap-3 py-1.5">
                      <span className={`text-lg font-bold ${i === 0 ? 'text-accent-gold' : i === 1 ? 'text-text-secondary' : 'text-accent-amber'}`}>
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-text-primary truncate">{s.episode?.title || 'â'}</div>
                        <div className="text-[10px] text-text-muted">{s.views?.toLocaleString() || 0} views</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
