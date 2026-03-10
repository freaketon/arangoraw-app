'use client';

import { useEffect, useState } from 'react';
import Card, { CardBody } from '@/components/ui/Card';
import Badge, { ApprovalBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

const TYPES = ['All', 'Academic Paper', 'Book', 'Article', 'Podcast', 'Documentary', 'Historical', 'Statistic', 'Quote', 'Framework'];
const QUALITY = ['All', 'Gold', 'Silver', 'Bronze', 'Unverified'];

export default function ResearchLibraryPage() {
  const [refs, setRefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [qualityFilter, setQualityFilter] = useState('All');
  const [selected, setSelected] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function loadRefs() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter !== 'All') params.set('type', typeFilter);
    if (qualityFilter !== 'All') params.set('quality', qualityFilter);
    try {
      const res = await fetch(`/api/research?${params}`);
      const data = res.ok ? await res.json() : [];
      setRefs(Array.isArray(data) ? data : []);
    } catch { setRefs([]); }
    setLoading(false);
  }

  useEffect(() => { loadRefs(); }, [search, typeFilter, qualityFilter]);

  async function createRef(form: any) {
    await fetch('/api/research', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowCreate(false);
    loadRefs();
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* List */}
      <div className="w-[420px] flex flex-col shrink-0">
        <div className="space-y-3 mb-4">
          <input type="text" placeholder="Search references..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-bg-secondary border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim" />
          <div className="flex gap-2 flex-wrap">
            {TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider transition-colors ${typeFilter === t ? 'bg-accent-gold-dim text-bg-primary' : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {QUALITY.map(q => (
              <button key={q} onClick={() => setQualityFilter(q)}
                className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider transition-colors ${qualityFilter === q ? 'bg-accent-green/20 text-accent-green' : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'}`}>
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-text-muted text-sm text-center py-8">Loading...</div>
          ) : refs.length === 0 ? (
            <EmptyState icon="â" title="No References" description="Add research to the library." action={<Button onClick={() => setShowCreate(true)}>Add Reference</Button>} />
          ) : (
            refs.map(ref => (
              <Card key={ref.reference_id} hover onClick={() => setSelected(ref)}
                className={selected?.reference_id === ref.reference_id ? 'border-accent-gold-dim' : ''}>
                <CardBody className="py-3">
                  <div className="text-sm text-text-primary font-medium">{ref.title}</div>
                  <div className="text-xs text-text-muted mt-0.5">{ref.author || 'Unknown author'} Â· {ref.year || 'â'}</div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {ref.type && <Badge variant="default">{ref.type}</Badge>}
                    {ref.source_quality && <Badge variant={ref.source_quality === 'Gold' ? 'gold' : ref.source_quality === 'Silver' ? 'default' : 'muted'}>{ref.source_quality}</Badge>}
                    {ref.approved !== undefined && <ApprovalBadge state={ref.approved ? 'Approved' : 'Pending Review'} />}
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>

        <div className="mt-3">
          <Button onClick={() => setShowCreate(true)} className="w-full">+ Add Reference</Button>
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <RefDetail ref_data={selected} onUpdate={() => { loadRefs(); setSelected(null); }} />
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            Select a reference to view details
          </div>
        )}
      </div>

      {showCreate && <CreateRefModal onClose={() => setShowCreate(false)} onCreate={createRef} />}
    </div>
  );
}

function RefDetail({ ref_data, onUpdate }: { ref_data: any; onUpdate: () => void }) {
  async function approve() {
    await fetch(`/api/research/${ref_data.reference_id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });
    onUpdate();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-text-primary">{ref_data.title}</h2>
        <div className="text-xs text-text-muted mt-1">{ref_data.author || 'Unknown'} Â· {ref_data.year || 'â'} Â· {ref_data.source || 'â'}</div>
        <div className="flex gap-2 mt-2">
          {ref_data.type && <Badge variant="default">{ref_data.type}</Badge>}
          {ref_data.source_quality && <Badge variant={ref_data.source_quality === 'Gold' ? 'gold' : 'default'}>{ref_data.source_quality}</Badge>}
        </div>
      </div>

      {ref_data.key_insight && (
        <Card><CardBody>
          <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Key Insight</div>
          <div className="text-sm text-text-secondary">{ref_data.key_insight}</div>
        </CardBody></Card>
      )}

      {ref_data.full_citation && (
        <Card><CardBody>
          <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Full Citation</div>
          <div className="text-sm text-text-secondary">{ref_data.full_citation}</div>
        </CardBody></Card>
      )}

      {ref_data.tags && ref_data.tags.length > 0 && (
        <Card><CardBody>
          <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Tags</div>
          <div className="flex gap-1.5 flex-wrap">
            {ref_data.tags.map((t: string) => <Badge key={t} variant="default">{t}</Badge>)}
          </div>
        </CardBody></Card>
      )}

      <Card><CardBody>
        <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Metadata</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-text-muted">Overuse Risk:</span> <span className="text-text-secondary">{ref_data.overuse_risk || 'â'}</span></div>
          <div><span className="text-text-muted">Times Used:</span> <span className="text-text-secondary">{ref_data.times_used ?? 0}</span></div>
          <div><span className="text-text-muted">Approved:</span> <span className="text-text-secondary">{ref_data.approved ? 'Yes' : 'No'}</span></div>
          <div><span className="text-text-muted">URL:</span> <span className="text-text-secondary truncate">{ref_data.url || 'â'}</span></div>
        </div>
      </CardBody></Card>

      {!ref_data.approved && (
        <Button onClick={approve}>Approve Reference</Button>
      )}
    </div>
  );
}

function CreateRefModal({ onClose, onCreate }: { onClose: () => void; onCreate: (form: any) => void }) {
  const [form, setForm] = useState({ title: '', author: '', year: '', type: '', source_quality: 'Unverified', key_insight: '', full_citation: '', url: '' });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-bg-secondary border border-border rounded-lg w-[500px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-text-primary">Add New Reference</h3>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Author</label>
              <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
                className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" />
            </div>
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Year</label>
              <input value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}
                className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim">
                <option value="">Select...</option>
                {TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Source Quality</label>
              <select value={form.source_quality} onChange={e => setForm({ ...form, source_quality: e.target.value })}
                className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim">
                {QUALITY.filter(q => q !== 'All').map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Key Insight</label>
            <textarea value={form.key_insight} onChange={e => setForm({ ...form, key_insight: e.target.value })} rows={3}
              className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim resize-none" />
          </div>
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">URL</label>
            <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
              className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" />
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onCreate(form)} disabled={!form.title}>Create Reference</Button>
        </div>
      </div>
    </div>
  );
}
