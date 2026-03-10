'use client';

import { useEffect, useState } from 'react';
import Card, { CardBody } from '@/components/ui/Card';
import { PillarBadge, StateBadge } from '@/components/ui/Badge';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

const PILLARS = ['All', 'Psychology of Chaos', 'Media Intelligence', 'Identity Shift', 'Physics of Business', 'The Survivor', 'External Mirrors'];
const ERAS = ['All', 'Colombia', 'Immigration', 'Corporate', 'Founder', 'Family', 'Philosophical', 'Meta'];

export default function StoryLibraryPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pillarFilter, setPillarFilter] = useState('All');
  const [eraFilter, setEraFilter] = useState('All');
  const [selected, setSelected] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function loadStories() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (pillarFilter !== 'All') params.set('pillar', pillarFilter);
    if (eraFilter !== 'All') params.set('era', eraFilter);
    try {
      const res = await fetch(`/api/stories?${params}`);
      const data = res.ok ? await res.json() : [];
      setStories(Array.isArray(data) ? data : []);
    } catch { setStories([]); }
    setLoading(false);
  }

  useEffect(() => { loadStories(); }, [search, pillarFilter, eraFilter]);

  async function createStory(form: any) {
    await fetch('/api/stories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowCreate(false);
    loadStories();
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* List Panel */}
      <div className="w-[420px] flex flex-col shrink-0">
        {/* Search & Filters */}
        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Search stories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-bg-secondary border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim"
          />
          <div className="flex gap-2 flex-wrap">
            {PILLARS.map(p => (
              <button key={p} onClick={() => setPillarFilter(p)}
                className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider transition-colors ${pillarFilter === p ? 'bg-accent-gold-dim text-bg-primary' : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'}`}>
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {ERAS.map(e => (
              <button key={e} onClick={() => setEraFilter(e)}
                className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider transition-colors ${eraFilter === e ? 'bg-accent-blue/20 text-accent-blue' : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'}`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Story List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-text-muted text-sm text-center py-8">Loading...</div>
          ) : stories.length === 0 ? (
            <EmptyState icon="â" title="No Stories" description="Add your first story to the library." action={<Button onClick={() => setShowCreate(true)}>Add Story</Button>} />
          ) : (
            stories.map(story => (
              <Card key={story.story_id} hover onClick={() => setSelected(story)}
                className={selected?.story_id === story.story_id ? 'border-accent-gold-dim' : ''}>
                <CardBody className="py-3">
                  <div className="text-sm text-text-primary font-medium">{story.title}</div>
                  <div className="text-xs text-text-muted mt-1 line-clamp-2">{story.raw_memory}</div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {story.pillar && <PillarBadge pillar={story.pillar} />}
                    {story.era && <Badge variant="muted">{story.era}</Badge>}
                    {story.intake_state && <StateBadge state={story.intake_state} />}
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>

        <div className="mt-3">
          <Button onClick={() => setShowCreate(true)} className="w-full">+ Add Story</Button>
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <StoryDetail story={selected} onUpdate={() => { loadStories(); setSelected(null); }} />
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            Select a story to view details
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && <CreateStoryModal onClose={() => setShowCreate(false)} onCreate={createStory} />}
    </div>
  );
}

function StoryDetail({ story, onUpdate }: { story: any; onUpdate: () => void }) {
  async function transition(newState: string) {
    await fetch(`/api/stories/${story.story_id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'transition', new_state: newState }),
    });
    onUpdate();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-text-primary">{story.title}</h2>
        <div className="flex gap-2 mt-2">
          {story.pillar && <PillarBadge pillar={story.pillar} />}
          {story.era && <Badge variant="muted">{story.era}</Badge>}
          {story.permission_level && <Badge variant={story.permission_level === 'Public' ? 'green' : story.permission_level === 'Private' ? 'red' : 'amber'}>{story.permission_level}</Badge>}
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Raw Memory</div>
          <div className="text-sm text-text-secondary whitespace-pre-wrap">{story.raw_memory || 'â'}</div>
        </CardBody>
      </Card>

      {story.refined_narrative && (
        <Card>
          <CardBody>
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Refined Narrative</div>
            <div className="text-sm text-text-secondary whitespace-pre-wrap">{story.refined_narrative}</div>
          </CardBody>
        </Card>
      )}

      {story.themes && story.themes.length > 0 && (
        <Card>
          <CardBody>
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Themes</div>
            <div className="flex gap-1.5 flex-wrap">
              {story.themes.map((t: string) => <Badge key={t} variant="default">{t}</Badge>)}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Metadata</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-text-muted">Confidence:</span> <span className="text-text-secondary">{story.confidence_score ?? 'â'}/10</span></div>
            <div><span className="text-text-muted">Times Used:</span> <span className="text-text-secondary">{story.times_used ?? 0}</span></div>
            <div><span className="text-text-muted">Intake State:</span> <span className="text-text-secondary">{story.intake_state || 'â'}</span></div>
            <div><span className="text-text-muted">Created:</span> <span className="text-text-secondary">{story.created_at ? new Date(story.created_at).toLocaleDateString() : 'â'}</span></div>
          </div>
        </CardBody>
      </Card>

      {/* State Actions */}
      <div className="flex gap-2">
        {story.intake_state === 'Raw' && <Button size="sm" onClick={() => transition('Enriched')}>Mark Enriched</Button>}
        {story.intake_state === 'Enriched' && <Button size="sm" onClick={() => transition('Categorized')}>Mark Categorized</Button>}
        {story.intake_state === 'Categorized' && <Button size="sm" onClick={() => transition('Canonicalized')}>Canonicalize</Button>}
      </div>
    </div>
  );
}

function CreateStoryModal({ onClose, onCreate }: { onClose: () => void; onCreate: (form: any) => void }) {
  const [form, setForm] = useState({ title: '', raw_memory: '', pillar: '', era: '', permission_level: 'Public' });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-bg-secondary border border-border rounded-lg w-[500px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-text-primary">Add New Story</h3>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" />
          </div>
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Raw Memory</label>
            <textarea value={form.raw_memory} onChange={e => setForm({ ...form, raw_memory: e.target.value })} rows={4}
              className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Pillar</label>
              <select value={form.pillar} onChange={e => setForm({ ...form, pillar: e.target.value })}
                className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim">
                <option value="">Select...</option>
                {PILLARS.filter(p => p !== 'All').map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Era</label>
              <select value={form.era} onChange={e => setForm({ ...form, era: e.target.value })}
                className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim">
                <option value="">Select...</option>
                {ERAS.filter(e => e !== 'All').map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Permission</label>
            <select value={form.permission_level} onChange={e => setForm({ ...form, permission_level: e.target.value })}
              className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim">
              <option value="Public">Public</option>
              <option value="Internal Only">Internal Only</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onCreate(form)} disabled={!form.title}>Create Story</Button>
        </div>
      </div>
    </div>
  );
}
