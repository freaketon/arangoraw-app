'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import { ApprovalBadge } from '@/components/ui/Badge';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

type PackType = 'metadata' | 'thumbnail' | 'shorts' | 'publishing';

export default function PackagingWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;
  const [activeTab, setActiveTab] = useState<PackType>('metadata');
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/packaging?episode_id=${episodeId}&type=${activeTab}`);
      const data = res.ok ? await res.json() : [];
      setPacks(Array.isArray(data) ? data : []);
    } catch { setPacks([]); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [episodeId, activeTab]);

  async function createPack(form: any) {
    await fetch('/api/packaging', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, episode_id: episodeId, type: activeTab }),
    });
    setShowCreate(false);
    load();
  }

  async function approvePack(packId: string) {
    await fetch(`/api/packaging/${packId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });
    load();
  }

  const tabs: { key: PackType; label: string; color: string }[] = [
    { key: 'metadata', label: 'Metadata', color: 'text-accent-gold' },
    { key: 'thumbnail', label: 'Thumbnails', color: 'text-accent-amber' },
    { key: 'shorts', label: 'Shorts', color: 'text-accent-purple' },
    { key: 'publishing', label: 'Publishing', color: 'text-accent-blue' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.push('/packaging-studio')} className="text-xs text-text-muted hover:text-text-secondary mb-1 block">â Back to Packaging</button>
          <h2 className="text-lg font-medium text-text-primary">Packaging Studio â Episode {episodeId.slice(0, 8)}</h2>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ New {tabs.find(t => t.key === activeTab)?.label} Pack</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-secondary rounded p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 text-xs py-2 rounded transition-colors ${activeTab === t.key ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Pack List */}
      {loading ? (
        <div className="text-text-muted text-sm text-center py-8">Loading...</div>
      ) : packs.length === 0 ? (
        <div className="text-text-muted text-sm text-center py-12">No {tabs.find(t => t.key === activeTab)?.label.toLowerCase()} packs yet.</div>
      ) : (
        <div className="space-y-4">
          {packs.map(pack => (
            <PackCard key={pack.metadata_pack_id || pack.thumbnail_pack_id || pack.shorts_pack_id || pack.publishing_packet_id || Math.random()}
              pack={pack} type={activeTab} onApprove={approvePack} />
          ))}
        </div>
      )}

      {showCreate && <CreatePackModal type={activeTab} onClose={() => setShowCreate(false)} onCreate={createPack} />}
    </div>
  );
}

function PackCard({ pack, type, onApprove }: { pack: any; type: PackType; onApprove: (id: string) => void }) {
  const id = pack.metadata_pack_id || pack.thumbnail_pack_id || pack.shorts_pack_id || pack.publishing_packet_id;
  const approved = pack.approval_state === 'Approved' || pack.approved;

  return (
    <Card>
      <CardHeader className="py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-text-primary">{packTitle(pack, type)}</span>
          <ApprovalBadge state={pack.approval_state || (approved ? 'Approved' : 'Pending Review')} />
        </div>
        {!approved && <Button size="sm" onClick={() => onApprove(id)}>Approve</Button>}
      </CardHeader>
      <CardBody>
        {type === 'metadata' && <MetadataView pack={pack} />}
        {type === 'thumbnail' && <ThumbnailView pack={pack} />}
        {type === 'shorts' && <ShortsView pack={pack} />}
        {type === 'publishing' && <PublishingView pack={pack} />}
        <div className="text-[10px] text-text-muted mt-3">
          Created: {pack.created_at ? new Date(pack.created_at).toLocaleDateString() : 'â'}
        </div>
      </CardBody>
    </Card>
  );
}

function packTitle(pack: any, type: PackType): string {
  if (type === 'metadata') return pack.seo_title || pack.youtube_title || 'Metadata Pack';
  if (type === 'thumbnail') return pack.concept_description || 'Thumbnail Pack';
  if (type === 'shorts') return pack.shorts_hook || 'Shorts Pack';
  if (type === 'publishing') return pack.platform || 'Publishing Packet';
  return 'Pack';
}

function MetadataView({ pack }: { pack: any }) {
  return (
    <div className="space-y-3 text-xs">
      <Row label="YouTube Title" value={pack.youtube_title} />
      <Row label="SEO Title" value={pack.seo_title} />
      <Row label="Description" value={pack.youtube_description} multiline />
      {pack.tags && pack.tags.length > 0 && (
        <div>
          <span className="text-text-muted">Tags:</span>
          <div className="flex gap-1 flex-wrap mt-1">
            {pack.tags.map((t: string) => <Badge key={t} variant="default">{t}</Badge>)}
          </div>
        </div>
      )}
      <Row label="Hashtags" value={pack.hashtags?.join(', ')} />
      <Row label="Category" value={pack.category} />
    </div>
  );
}

function ThumbnailView({ pack }: { pack: any }) {
  return (
    <div className="space-y-3 text-xs">
      <Row label="Concept" value={pack.concept_description} multiline />
      <Row label="Text Overlay" value={pack.text_overlay} />
      <Row label="Style" value={pack.style_reference} />
      {pack.thumbnail_url && (
        <div>
          <span className="text-text-muted">Preview:</span>
          <div className="mt-1 bg-bg-tertiary rounded p-2 text-text-secondary">{pack.thumbnail_url}</div>
        </div>
      )}
    </div>
  );
}

function ShortsView({ pack }: { pack: any }) {
  return (
    <div className="space-y-3 text-xs">
      <Row label="Hook" value={pack.shorts_hook} />
      <Row label="Clip Timecodes" value={pack.clip_timecodes?.join(', ')} />
      <Row label="Caption Text" value={pack.caption_text} multiline />
      <Row label="CTA Overlay" value={pack.cta_overlay} />
      <Row label="Platform" value={pack.target_platform} />
    </div>
  );
}

function PublishingView({ pack }: { pack: any }) {
  return (
    <div className="space-y-3 text-xs">
      <Row label="Platform" value={pack.platform} />
      <Row label="Scheduled At" value={pack.scheduled_publish_at ? new Date(pack.scheduled_publish_at).toLocaleString() : undefined} />
      <Row label="Published At" value={pack.actual_publish_at ? new Date(pack.actual_publish_at).toLocaleString() : undefined} />
      <Row label="Status" value={pack.state} />
      {pack.checklist && (
        <div>
          <span className="text-text-muted">Checklist:</span>
          <div className="mt-1 space-y-1">
            {Object.entries(pack.checklist).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className={v ? 'text-accent-green' : 'text-text-muted'}>{v ? 'â' : 'â'}</span>
                <span className="text-text-secondary">{k}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value?: string; multiline?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-text-muted">{label}:</span>
      {multiline ? (
        <div className="text-text-secondary whitespace-pre-wrap mt-0.5">{value}</div>
      ) : (
        <span className="text-text-secondary ml-1">{value}</span>
      )}
    </div>
  );
}

function CreatePackModal({ type, onClose, onCreate }: { type: PackType; onClose: () => void; onCreate: (form: any) => void }) {
  const [form, setForm] = useState<Record<string, string>>({});

  const fields: Record<PackType, { key: string; label: string; textarea?: boolean }[]> = {
    metadata: [
      { key: 'youtube_title', label: 'YouTube Title' },
      { key: 'seo_title', label: 'SEO Title' },
      { key: 'youtube_description', label: 'Description', textarea: true },
      { key: 'category', label: 'Category' },
    ],
    thumbnail: [
      { key: 'concept_description', label: 'Concept', textarea: true },
      { key: 'text_overlay', label: 'Text Overlay' },
      { key: 'style_reference', label: 'Style Reference' },
    ],
    shorts: [
      { key: 'shorts_hook', label: 'Hook' },
      { key: 'caption_text', label: 'Caption Text', textarea: true },
      { key: 'cta_overlay', label: 'CTA Overlay' },
      { key: 'target_platform', label: 'Platform' },
    ],
    publishing: [
      { key: 'platform', label: 'Platform' },
    ],
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-bg-secondary border border-border rounded-lg w-[500px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-text-primary">New {type.charAt(0).toUpperCase() + type.slice(1)} Pack</h3>
        </div>
        <div className="px-5 py-4 space-y-4">
          {fields[type].map(f => (
            <div key={f.key}>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">{f.label}</label>
              {f.textarea ? (
                <textarea value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} rows={3}
                  className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim resize-none" />
              ) : (
                <input value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold-dim" />
              )}
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onCreate(form)}>Create</Button>
        </div>
      </div>
    </div>
  );
}
