'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Badge, { StateBadge, PillarBadge, ApprovalBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function EpisodeWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [episode, setEpisode] = useState<any>(null);
  const [scripts, setScripts] = useState<any[]>([]);
  const [packaging, setPackaging] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [epRes, scriptRes, pkgRes, analyticsRes] = await Promise.all([
        fetch(`/api/episodes/${id}`),
        fetch(`/api/scripts?episode_id=${id}`),
        fetch(`/api/packaging?episode_id=${id}`),
        fetch(`/api/analytics?episode_id=${id}`),
      ]);
      if (epRes.ok) setEpisode(await epRes.json());
      if (scriptRes.ok) { const d = await scriptRes.json(); setScripts(Array.isArray(d) ? d : []); }
      if (pkgRes.ok) { const d = await pkgRes.json(); setPackaging(Array.isArray(d) ? d : []); }
      if (analyticsRes.ok) { const d = await analyticsRes.json(); setAnalytics(Array.isArray(d) ? d : []); }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function transition(newState: string) {
    await fetch(`/api/episodes/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'transition', new_state: newState }),
    });
    load();
  }

  if (loading) return <div className="text-text-muted text-sm text-center py-12">Loading episode...</div>;
  if (!episode) return <div className="text-text-muted text-sm text-center py-12">Episode not found.</div>;

  // Determine available next states
  const stateActions: Record<string, { label: string; next: string }[]> = {
    'Idea': [{ label: 'Attach Story', next: 'Story Attached' }],
    'Story Attached': [{ label: 'Load Research', next: 'Research Loaded' }],
    'Research Loaded': [{ label: 'Start Scripting', next: 'Scripting' }],
    'Scripting': [{ label: 'Submit for Review', next: 'Script Review' }],
    'Script Review': [{ label: 'Approve Script', next: 'Approved Script' }, { label: 'Reject â Rescript', next: 'Scripting' }],
    'Approved Script': [{ label: 'Start Packaging', next: 'Packaging' }],
    'Packaging': [{ label: 'Submit Packaging', next: 'Packaging Review' }],
    'Packaging Review': [{ label: 'Approve Packaging', next: 'Final Review' }, { label: 'Reject â Repackage', next: 'Packaging' }],
    'Final Review': [{ label: 'Approve & Schedule', next: 'Scheduled' }],
    'Scheduled': [{ label: 'Mark Published', next: 'Published' }],
    'Published': [{ label: 'Archive', next: 'Archived' }],
  };
  const actions = stateActions[episode.state] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.push('/episodes')} className="text-xs text-text-muted hover:text-text-secondary mb-2 block">â Back to Episodes</button>
          <h2 className="text-xl font-semibold text-text-primary">{episode.title || 'Untitled Episode'}</h2>
          <div className="flex items-center gap-3 mt-2">
            <StateBadge state={episode.state} />
            {episode.pillar && <PillarBadge pillar={episode.pillar} />}
            <span className="text-xs text-text-muted">Ep {episode.episode_number || 'â'}</span>
            {episode.target_platform && <Badge variant="default">{episode.target_platform}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          {actions.map(a => (
            <Button key={a.next} size="sm" variant={a.next.includes('Reject') ? 'secondary' : 'primary'} onClick={() => transition(a.next)}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <EpisodeProgress state={episode.state} />

      <div className="grid grid-cols-2 gap-6">
        {/* Story Section */}
        <Card>
          <CardHeader><span className="text-sm font-medium">Story</span></CardHeader>
          <CardBody>
            {episode.story_id ? (
              <div className="text-sm text-text-secondary">Story attached: <span className="text-accent-gold">{episode.story_id}</span></div>
            ) : (
              <div className="text-sm text-text-muted">No story attached yet.</div>
            )}
          </CardBody>
        </Card>

        {/* Research Section */}
        <Card>
          <CardHeader><span className="text-sm font-medium">Research</span></CardHeader>
          <CardBody>
            {episode.reference_ids && episode.reference_ids.length > 0 ? (
              <div className="text-sm text-text-secondary">{episode.reference_ids.length} reference(s) loaded</div>
            ) : (
              <div className="text-sm text-text-muted">No references loaded yet.</div>
            )}
          </CardBody>
        </Card>

        {/* Scripts Section */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="text-sm font-medium">Scripts</span>
            {['Scripting', 'Script Review'].includes(episode.state) && (
              <Link href={`/script-studio/${id}`}><Button variant="ghost" size="sm">Open Studio</Button></Link>
            )}
          </CardHeader>
          <CardBody>
            {scripts.length === 0 ? (
              <div className="text-sm text-text-muted">No scripts yet.</div>
            ) : (
              <div className="space-y-2">
                {scripts.map(s => (
                  <div key={s.script_id} className="flex items-center justify-between py-1">
                    <span className="text-xs text-text-secondary">v{s.version}</span>
                    <ApprovalBadge state={s.approval_state || 'Pending Review'} />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Packaging Section */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="text-sm font-medium">Packaging</span>
            {['Packaging', 'Packaging Review'].includes(episode.state) && (
              <Link href={`/packaging-studio/${id}`}><Button variant="ghost" size="sm">Open Studio</Button></Link>
            )}
          </CardHeader>
          <CardBody>
            {packaging.length === 0 ? (
              <div className="text-sm text-text-muted">No packaging assets yet.</div>
            ) : (
              <div className="space-y-2">
                {packaging.map(p => (
                  <div key={p.metadata_pack_id || p.thumbnail_pack_id || p.shorts_pack_id || Math.random()} className="flex items-center justify-between py-1">
                    <span className="text-xs text-text-secondary">{p.type || 'Pack'}</span>
                    <ApprovalBadge state={p.approval_state || 'Pending Review'} />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Analytics Section */}
        <Card className="col-span-2">
          <CardHeader><span className="text-sm font-medium">Analytics</span></CardHeader>
          <CardBody>
            {analytics.length === 0 ? (
              <div className="text-sm text-text-muted">No analytics data available yet.</div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {analytics.slice(0, 1).map(a => (
                  <div key={a.snapshot_id} className="contents">
                    <div className="text-center">
                      <div className="text-[11px] text-text-muted uppercase mb-1">Views</div>
                      <div className="text-lg font-semibold text-accent-gold">{a.views?.toLocaleString() || 'â'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[11px] text-text-muted uppercase mb-1">CTR</div>
                      <div className="text-lg font-semibold text-accent-blue">{a.ctr ? `${a.ctr}%` : 'â'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[11px] text-text-muted uppercase mb-1">Watch Time</div>
                      <div className="text-lg font-semibold text-accent-green">{a.watch_time_hours ? `${a.watch_time_hours}h` : 'â'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[11px] text-text-muted uppercase mb-1">Retention</div>
                      <div className="text-lg font-semibold text-accent-purple">{a.avg_view_duration ? `${a.avg_view_duration}%` : 'â'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Episode Metadata */}
      <Card>
        <CardHeader><span className="text-sm font-medium">Episode Details</span></CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div><span className="text-text-muted">Angle:</span> <span className="text-text-secondary">{episode.angle || 'â'}</span></div>
            <div><span className="text-text-muted">Hook:</span> <span className="text-text-secondary">{episode.hook || 'â'}</span></div>
            <div><span className="text-text-muted">Publish Date:</span> <span className="text-text-secondary">{episode.publish_date ? new Date(episode.publish_date).toLocaleDateString() : 'â'}</span></div>
            <div><span className="text-text-muted">Week ID:</span> <span className="text-text-secondary">{episode.weekly_cycle_id || 'â'}</span></div>
            <div><span className="text-text-muted">Created:</span> <span className="text-text-secondary">{episode.created_at ? new Date(episode.created_at).toLocaleDateString() : 'â'}</span></div>
            <div><span className="text-text-muted">Updated:</span> <span className="text-text-secondary">{episode.updated_at ? new Date(episode.updated_at).toLocaleDateString() : 'â'}</span></div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function EpisodeProgress({ state }: { state: string }) {
  const ORDERED_STATES = ['Idea', 'Story Attached', 'Research Loaded', 'Scripting', 'Script Review', 'Approved Script', 'Packaging', 'Packaging Review', 'Final Review', 'Scheduled', 'Published'];
  const idx = ORDERED_STATES.indexOf(state);
  const progress = idx >= 0 ? ((idx + 1) / ORDERED_STATES.length) * 100 : 0;

  return (
    <div>
      <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
        <div className="h-full bg-accent-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-text-muted">Idea</span>
        <span className="text-[9px] text-text-muted">Published</span>
      </div>
    </div>
  );
}
