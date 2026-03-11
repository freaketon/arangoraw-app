'use client';

import { useEffect, useState, useCallback } from 'react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Badge, { StateBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

interface PlanProgress {
  step: string;
  status: string;
  message?: string;
  index?: number;
  title?: string;
  error?: string;
  summary?: {
    week_id: string;
    week_theme: string;
    episodes_created: number;
    scripts_generated: number;
    scripts_failed: number;
    episodes: Array<{ episode_id: string; working_title: string; script_status: string; script_title: string | null }>;
  };
}

export default function WeeklyPlannerPage() {
  const [weeks, setWeeks] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState<any | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // AI Plan state
  const [planning, setPlanning] = useState(false);
  const [planProgress, setPlanProgress] = useState<PlanProgress[]>([]);
  const [planComplete, setPlanComplete] = useState(false);

  // Regenerate script state
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [weekRes, epRes] = await Promise.all([
        fetch('/api/weekly-cycles'),
        fetch('/api/episodes'),
      ]);
      const weekData = weekRes.ok ? await weekRes.json() : [];
      const epData = epRes.ok ? await epRes.json() : [];
      const allWeeks = Array.isArray(weekData) ? weekData : [];
      setWeeks(allWeeks);
      const curr = allWeeks.find((w: any) => w.state !== 'Archived' && w.state !== 'Completed') || allWeeks[0] || null;
      setCurrentWeek(curr);
      setEpisodes(Array.isArray(epData) ? epData : []);
    } catch { setWeeks([]); setEpisodes([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createWeek(form: any) {
    await fetch('/api/weekly-cycles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowCreate(false);
    load();
  }

  async function transitionWeek(id: string, newState: string) {
    await fetch(`/api/weekly-cycles/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'transition', new_state: newState }),
    });
    load();
  }

  async function lockWeek(id: string) {
    await fetch(`/api/weekly-cycles/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'lock' }),
    });
    load();
  }

  // ── Plan Week with AI ──
  async function planWeekWithAI() {
    setPlanning(true);
    setPlanProgress([]);
    setPlanComplete(false);

    try {
      const res = await fetch('/api/ai/plan-week', { method: 'POST' });
      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as PlanProgress;
              setPlanProgress(prev => [...prev, data]);
              if (data.step === 'complete' || data.step === 'error') {
                setPlanComplete(true);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setPlanProgress(prev => [...prev, { step: 'error', status: 'failed', error: err instanceof Error ? err.message : 'Failed' }]);
      setPlanComplete(true);
    } finally {
      setPlanning(false);
      load();
    }
  }

  // ── Regenerate Script ──
  async function regenerateScript(episodeId: string) {
    setRegenerating(episodeId);
    try {
      await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_script', episode_id: episodeId }),
      });
      load();
    } catch {}
    setRegenerating(null);
  }

  if (loading) return <div className="text-text-muted text-sm text-center py-12">Loading planner...</div>;

  const weekEpisodes = currentWeek?.episode_ids
    ? episodes.filter(e => currentWeek.episode_ids.includes(e.episode_id))
    : [];

  const availableEpisodes = episodes.filter(e => !currentWeek?.episode_ids?.includes(e.episode_id) && !['Published', 'Archived'].includes(e.state));

  return (
    <div className="space-y-6">
      {/* AI Plan Progress */}
      {(planning || planProgress.length > 0) && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">🤖 AI Plan Week</span>
            {planComplete && (
              <Button size="sm" variant="ghost" onClick={() => { setPlanProgress([]); setPlanComplete(false); }}>Dismiss</Button>
            )}
          </CardHeader>
          <CardBody>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {planProgress.map((p, i) => (
                <div key={i} className={`text-xs flex items-center gap-2 ${
                  p.status === 'failed' ? 'text-red-400' : p.status === 'done' ? 'text-green-400' : 'text-text-muted'
                }`}>
                  <span>{p.status === 'generating' || p.status === 'creating' ? '⏳' : p.status === 'done' ? '✓' : '✗'}</span>
                  <span>{p.message || p.title || p.error || `${p.step}: ${p.status}`}</span>
                </div>
              ))}
              {planning && <div className="text-xs text-accent-gold-dim animate-pulse">Working...</div>}
            </div>
            {planComplete && planProgress.find(p => p.step === 'complete')?.summary && (
              <div className="mt-3 pt-3 border-t border-border text-xs text-text-secondary">
                {(() => {
                  const s = planProgress.find(p => p.step === 'complete')!.summary!;
                  return `Created ${s.episodes_created} episodes, ${s.scripts_generated} scripts generated${s.scripts_failed > 0 ? `, ${s.scripts_failed} failed` : ''}`;
                })()}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Week Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-text-primary">Week Cycles</h2>
          <div className="flex gap-2">
            {weeks.slice(0, 8).map(w => (
              <button key={w.cycle_id} onClick={() => setCurrentWeek(w)}
                className={`text-[10px] px-3 py-1.5 rounded transition-colors ${currentWeek?.cycle_id === w.cycle_id ? 'bg-accent-gold-dim text-bg-primary' : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'}`}>
                {w.week_label || w.cycle_id?.slice(0, 8)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={planWeekWithAI} disabled={planning}>
            {planning ? '⏳ Planning...' : '🤖 Plan Week with AI'}
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>+ New Week</Button>
        </div>
      </div>

      {!currentWeek ? (
        <EmptyState icon="📅" title="No Weekly Cycles" description="Create your first weekly cycle or let AI plan one for you."
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={planWeekWithAI} disabled={planning}>
                {planning ? '⏳ Planning...' : '🤖 Plan Week with AI'}
              </Button>
              <Button onClick={() => setShowCreate(true)}>Create Manually</Button>
            </div>
          } />
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Week Overview */}
          <div className="col-span-2 space-y-6">
            {/* Week Info */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">{currentWeek.week_label || 'Current Week'}</span>
                  <StateBadge state={currentWeek.state} />
                  {currentWeek.locked && <Badge variant="red">Locked</Badge>}
                </div>
                <div className="flex gap-2">
                  {currentWeek.state === 'Planning' && !currentWeek.locked && (
                    <Button size="sm" variant="secondary" onClick={() => lockWeek(currentWeek.cycle_id)}>Lock Week</Button>
                  )}
                  {currentWeek.state === 'Planning' && (
                    <Button size="sm" onClick={() => transitionWeek(currentWeek.cycle_id, 'Locked')}>→ Lock</Button>
                  )}
                  {currentWeek.state === 'Locked' && (
                    <Button size="sm" onClick={() => transitionWeek(currentWeek.cycle_id, 'In Production')}>→ Production</Button>
                  )}
                  {currentWeek.state === 'In Production' && (
                    <Button size="sm" onClick={() => transitionWeek(currentWeek.cycle_id, 'Review')}>→ Review</Button>
                  )}
                  {currentWeek.state === 'Review' && (
                    <Button size="sm" onClick={() => transitionWeek(currentWeek.cycle_id, 'Published')}>→ Publish</Button>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div><span className="text-text-muted">Theme:</span> <span className="text-text-secondary">{currentWeek.theme || currentWeek.week_theme || '—'}</span></div>
                  <div><span className="text-text-muted">Start:</span> <span className="text-text-secondary">{currentWeek.start_date ? new Date(currentWeek.start_date).toLocaleDateString() : '—'}</span></div>
                  <div><span className="text-text-muted">End:</span> <span className="text-text-secondary">{currentWeek.end_date ? new Date(currentWeek.end_date).toLocaleDateString() : '—'}</span></div>
                </div>
              </CardBody>
            </Card>

            {/* Week Episodes */}
            <Card>
              <CardHeader><span className="text-sm font-medium">Episodes This Week</span></CardHeader>
              <CardBody>
                {weekEpisodes.length === 0 ? (
                  <div className="text-sm text-text-muted py-4 text-center">No episodes assigned to this week.</div>
                ) : (
                  <div className="space-y-2">
                    {weekEpisodes.map(ep => (
                      <div key={ep.episode_id} className="flex items-center justify-between py-2 px-3 rounded bg-bg-tertiary">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-text-primary">{ep.working_title || ep.title}</div>
                          <div className="text-xs text-text-muted flex items-center gap-2">
                            <span>{ep.pillar}</span>
                            {ep.core_thesis && <span>· {ep.core_thesis.slice(0, 60)}{ep.core_thesis.length > 60 ? '...' : ''}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StateBadge state={ep.state} />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => regenerateScript(ep.episode_id)}
                            disabled={regenerating === ep.episode_id}
                          >
                            {regenerating === ep.episode_id ? '⏳' : '🔄 Script'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Story Themes */}
            {currentWeek.story_themes && currentWeek.story_themes.length > 0 && (
              <Card>
                <CardHeader><span className="text-sm font-medium">Story Themes</span></CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {currentWeek.story_themes.map((theme: any, i: number) => (
                      <div key={i} className="py-2">
                        <div className="text-sm text-text-primary">{theme.theme || theme}</div>
                        {theme.description && <div className="text-xs text-text-muted mt-0.5">{theme.description}</div>}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Sidebar — Available Episodes */}
          <div className="space-y-4">
            <Card>
              <CardHeader><span className="text-sm font-medium">Available Episodes</span></CardHeader>
              <CardBody className="max-h-[400px] overflow-y-auto">
                {availableEpisodes.length === 0 ? (
                  <div className="text-xs text-text-muted">No unassigned episodes.</div>
                ) : (
                  <div className="space-y-2">
                    {availableEpisodes.map(ep => (
                      <AddEpisodeRow key={ep.episode_id} episode={ep} weekId={currentWeek.cycle_id} locked={currentWeek.locked} onAdd={load} />
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Week Notes */}
            <Card>
              <CardHeader><span className="text-sm font-medium">Notes</span></CardHeader>
              <CardBody>
                <div className="text-xs text-text-muted">{currentWeek.notes || 'No notes for this week.'}</div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {showCreate && <CreateWeekModal onClose={() => setShowCreate(false)} onCreate={createWeek} />}
    </div>
  );
}

function AddEpisodeRow({ episode, weekId, locked, onAdd }: { episode: any; weekId: string; locked: boolean; onAdd: () => void }) {
  async function add() {
    await fetch(`/api/weekly-cycles/${weekId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_episode', episode_id: episode.episode_id }),
    });
    onAdd();
  }

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="min-w-0 flex-1">
        <div className="text-xs text-text-secondary truncate">{episode.working_title || episode.title}</div>
        <StateBadge state={episode.state} />
      </div>
      {!locked && <Button size="sm" variant="ghost" onClick={add}>Add</Button>}
    </div>
  );
}

function CreateWeekModal({ onClose, onCreate }: { onClose: () => void; onCreate: (form: any) => void }) {
  const [form, setForm] = useState({ week_label: '', theme: '', start_date: '', end_date: '' });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-bg-secondary border border-border rounded-lg w-[460px]" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-text-primary">Create Weekly Cycle</h3>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Week Label</label>
            <input value={form.week_label} onChange={e => setForm({ ...form, week_label: e.target.value })}
              className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" placeholder="e.g. Week 12 — Mar 17-23" />
          </div>
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Theme</label>
            <input value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })}
              className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" />
            </div>
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" />
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onCreate(form)} disabled={!form.week_label}>Create</Button>
        </div>
      </div>
    </div>
  );
}
