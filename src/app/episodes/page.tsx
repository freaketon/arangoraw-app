'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card, { CardBody } from '@/components/ui/Card';
import { StateBadge, PillarBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

const STATES = ['All', 'Idea', 'Story Attached', 'Research Loaded', 'Scripting', 'Script Review', 'Approved Script', 'Packaging', 'Packaging Review', 'Final Review', 'Scheduled', 'Published', 'Archived'];

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  async function loadEpisodes() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (stateFilter !== 'All') params.set('state', stateFilter);
    try {
      const res = await fetch(`/api/episodes?${params}`);
      const data = res.ok ? await res.json() : [];
      setEpisodes(Array.isArray(data) ? data : []);
    } catch { setEpisodes([]); }
    setLoading(false);
  }

  useEffect(() => { loadEpisodes(); }, [search, stateFilter]);

  async function createEpisode(form: any) {
    await fetch('/api/episodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowCreate(false);
    loadEpisodes();
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <input type="text" placeholder="Search episodes..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-72 bg-bg-secondary border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim" />
        <Button onClick={() => setShowCreate(true)}>+ New Episode</Button>
      </div>

      {/* State Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATES.map(s => (
          <button key={s} onClick={() => setStateFilter(s)}
            className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider transition-colors ${stateFilter === s ? 'bg-accent-gold-dim text-bg-primary' : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Episode Grid */}
      {loading ? (
        <div className="text-text-muted text-sm text-center py-12">Loading episodes...</div>
      ) : episodes.length === 0 ? (
        <EmptyState icon="â¶" title="No Episodes" description="Create your first episode to start the pipeline."
          action={<Button onClick={() => setShowCreate(true)}>Create Episode</Button>} />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {episodes.map(ep => (
            <Link key={ep.episode_id} href={`/episodes/${ep.episode_id}`}>
              <Card hover>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">{ep.title || 'Untitled'}</div>
                      <div className="text-xs text-text-muted mt-0.5">Ep {ep.episode_number || 'â'}</div>
                    </div>
                    <StateBadge state={ep.state} />
                  </div>
                  {ep.angle && <div className="text-xs text-text-secondary mt-2 line-clamp-2">{ep.angle}</div>}
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {ep.pillar && <PillarBadge pillar={ep.pillar} />}
                    {ep.target_platform && (
                      <span className="text-[10px] text-text-muted">{ep.target_platform}</span>
                    )}
                  </div>
                  {ep.publish_date && (
                    <div className="text-[10px] text-text-muted mt-2">
                      ð {new Date(ep.publish_date).toLocaleDateString()}
                    </div>
                  )}
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateEpisodeModal onClose={() => setShowCreate(false)} onCreate={createEpisode} />}
    </div>
  );
}

function CreateEpisodeModal({ onClose, onCreate }: { onClose: () => void; onCreate: (form: any) => void }) {
  const [form, setForm] = useState({ title: '', episode_number: '', angle: '', pillar: '', target_platform: 'YouTube' });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-bg-secondary border border-border rounded-lg w-[480px]" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-text-primary">Create New Episode</h3>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Episode #</label>
              <input type="number" value={form.episode_number} onChange={e => setForm({ ...form, episode_number: e.target.value })}
                className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" />
            </div>
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Platform</label>
              <select value={form.target_platform} onChange={e => setForm({ ...form, target_platform: e.target.value })}
                className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim">
                <option value="YouTube">YouTube</option>
                <option value="Instagram">Instagram</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Angle</label>
            <textarea value={form.angle} onChange={e => setForm({ ...form, angle: e.target.value })} rows={2}
              className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim resize-none" />
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onCreate(form)} disabled={!form.title}>Create</Button>
        </div>
      </div>
    </div>
  );
}
