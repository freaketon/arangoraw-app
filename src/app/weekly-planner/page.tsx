'use client';

import { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Badge, { StateBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

export default function WeeklyPlannerPage() {
  const [weeks, setWeeks] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState<any | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
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
      // Find current (most recent non-archived)
      const curr = allWeeks.find((w: any) => w.state !== 'Archived' && w.state !== 'Completed') || allWeeks[0] || null;
      setCurrentWeek(curr);
      setEpisodes(Array.isArray(epData) ? epData : []);
    } catch { setWeeks([]); setEpisodes([]); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

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

  if (loading) return <div className="text-text-muted text-sm text-center py-12">Loading planner...</div>;

  const weekEpisodes = currentWeek?.episode_ids
    ? episodes.filter(e => currentWeek.episode_ids.includes(e.episode_id))
    : [];

  const availableEpisodes = episodes.filter(e => !currentWeek?.episode_ids?.includes(e.episode_id) && !['Published', 'Archived'].includes(e.state));

  return (
    <div className="space-y-6">
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
        <Button size="sm" onClick={() => setShowCreate(true)}>+ New Week</Button>
      </div>

      {!currentWeek ? (
        <EmptyState icon="â¦" title="No Weekly Cycles" description="Create your first weekly cycle to start planning."
          action={<Button onClick={() => setShowCreate(true)}>Create Week</Button>} />
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
                    <Button size="sm" onClick={() => transitionWeek(currentWeek.cycle_id, 'Locked')}>â Lock</Button>
                  )}
                  {currentWeek.state === 'Locked' && (
                    <Button size="sm" onClick={() => transitionWeek(currentWeek.cycle_id, 'In Production')}>â Production</Button>
                  )}
                  {currentWeek.state === 'In Production' && (
                    <Button size="sm" onClick={() => transitionWeek(currentWeek.cycle_id, 'Review')}>â Review</Button>
                  )}
                  {currentWeek.state === 'Review' && (
                    <Button size="sm" onClick={() => transitionWeek(currentWeek.cycle_id, 'Published')}>â Publish</Button>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div><span className="text-text-muted">Theme:</span> <span className="text-text-secondary">{currentWeek.theme || 'â'}</span></div>
                  <div><span className="text-text-muted">Start:</span> <span className="text-text-secondary">{currentWeek.start_date ? new Date(currentWeek.start_date).toLocaleDateString() : 'â'}</span></div>
                  <div><span className="text-text-muted">End:</span> <span className="text-text-secondary">{currentWeek.end_date ? new Date(currentWeek.end_date).toLocaleDateString() : 'â'}</span></div>
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
                        <div>
                          <div className="text-sm text-text-primary">{ep.title}</div>
                          <div className="text-xs text-text-muted">Ep {ep.episode_number || 'â'}</div>
                        </div>
                        <StateBadge state={ep.state} />
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

          {/* Sidebar â Available Episodes */}
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
        <div className="text-xs text-text-secondary truncate">{episode.title}</div>
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
              className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" placeholder="e.g. Week 12 â Mar 17-23" />
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
