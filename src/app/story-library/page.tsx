'use client';

import { useEffect, useState } from 'react';
import Card, { CardBody } from '@/components/ui/Card';
import { PillarBadge, StateBadge } from '@/components/ui/Badge';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useAIGenerate } from '@/hooks/useAIGenerate';

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
            <EmptyState icon="◈" title="No Stories" description="Add your first story to the library." action={<Button onClick={() => setShowCreate(true)}>Add Story</Button>} />
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
      {showCreate && <CreateStoryModal onClose={() => setShowCreate(false)} onCreate={createStory} onExtractDone={() => { setShowCreate(false); loadStories(); }} />}
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
          <div className="text-sm text-text-secondary whitespace-pre-wrap">{story.raw_memory || '—'}</div>
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

      {story.emotional_truth && (
        <Card>
          <CardBody>
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Emotional Truth</div>
            <div className="text-sm text-text-secondary whitespace-pre-wrap">{story.emotional_truth}</div>
          </CardBody>
        </Card>
      )}

      {story.philosophical_lesson && (
        <Card>
          <CardBody>
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Philosophical Lesson</div>
            <div className="text-sm text-text-secondary whitespace-pre-wrap">{story.philosophical_lesson}</div>
          </CardBody>
        </Card>
      )}

      {story.sensory_details && story.sensory_details.length > 0 && (
        <Card>
          <CardBody>
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Sensory Details</div>
            <div className="flex gap-1.5 flex-wrap">
              {story.sensory_details.map((d: string, i: number) => <Badge key={i} variant="default">{d}</Badge>)}
            </div>
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

      {story.related_pillars && story.related_pillars.length > 0 && (
        <Card>
          <CardBody>
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Related Pillars</div>
            <div className="flex gap-1.5 flex-wrap">
              {story.related_pillars.map((p: string) => <PillarBadge key={p} pillar={p} />)}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Metadata</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-text-muted">Confidence:</span> <span className="text-text-secondary">{story.confidence_level || story.confidence_score || '—'}</span></div>
            <div><span className="text-text-muted">Times Used:</span> <span className="text-text-secondary">{story.times_used ?? 0}</span></div>
            <div><span className="text-text-muted">Intake State:</span> <span className="text-text-secondary">{story.intake_state || '—'}</span></div>
            <div><span className="text-text-muted">Source:</span> <span className="text-text-secondary">{story.source || '—'}</span></div>
            <div><span className="text-text-muted">Story Type:</span> <span className="text-text-secondary">{story.story_type || '—'}</span></div>
            <div><span className="text-text-muted">Created:</span> <span className="text-text-secondary">{story.created_at ? new Date(story.created_at).toLocaleDateString() : '—'}</span></div>
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

function CreateStoryModal({ onClose, onCreate, onExtractDone }: { onClose: () => void; onCreate: (form: any) => void; onExtractDone: () => void }) {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [form, setForm] = useState({ title: '', raw_memory: '', pillar: '', era: '', permission_level: 'Public' });
  const [rawInput, setRawInput] = useState('');
  const { generate, generating, error: aiError } = useAIGenerate();
  const [extractResult, setExtractResult] = useState<any>(null);

  async function handleExtract() {
    const result = await generate('extract_story' as any, { raw_input: rawInput });
    if (result) {
      setExtractResult(result);
      onExtractDone();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-bg-secondary border border-border rounded-lg w-[560px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary">Add New Story</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setMode('manual')}
              className={`text-[10px] px-3 py-1 rounded uppercase tracking-wider transition-colors ${mode === 'manual' ? 'bg-accent-gold-dim text-bg-primary' : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'}`}
            >
              Manual
            </button>
            <button
              onClick={() => setMode('ai')}
              className={`text-[10px] px-3 py-1 rounded uppercase tracking-wider transition-colors ${mode === 'ai' ? 'bg-accent-gold-dim text-bg-primary' : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'}`}
            >
              🤖 AI Extract
            </button>
          </div>
        </div>

        {mode === 'manual' ? (
          <>
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
          </>
        ) : (
          <>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Paste Raw Text</label>
                <p className="text-xs text-text-muted mb-2">Paste a raw memory, journal entry, conversation, or experience. AI will extract the story structure, emotional truth, philosophical lesson, sensory details, and classify it into the right pillar and era.</p>
                <textarea
                  value={rawInput}
                  onChange={e => setRawInput(e.target.value)}
                  rows={8}
                  placeholder="I remember when I was 12 in Medellín, there was this one afternoon where..."
                  className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim resize-none"
                />
              </div>
              {aiError && <div className="text-xs text-red-400">Error: {aiError}</div>}
              {extractResult && (
                <div className="px-3 py-2 rounded bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs">
                  ✓ Story extracted and saved to library
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button
                onClick={handleExtract}
                disabled={!rawInput.trim() || generating !== null}
              >
                {generating === 'extract_story' ? '⏳ Extracting...' : '🤖 Extract with AI'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
