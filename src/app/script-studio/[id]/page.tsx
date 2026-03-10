'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Badge, { ApprovalBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function ScriptEditorPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;
  const [scripts, setScripts] = useState<any[]>([]);
  const [activeScript, setActiveScript] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ hook: '', artifact: '', labyrinth: '', twist: '', echo: '', full_script: '' });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/scripts?episode_id=${episodeId}`);
      const data = res.ok ? await res.json() : [];
      const sorted = (Array.isArray(data) ? data : []).sort((a: any, b: any) => (b.version || 0) - (a.version || 0));
      setScripts(sorted);
      if (sorted.length > 0 && !activeScript) setActiveScript(sorted[0]);
    } catch { setScripts([]); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [episodeId]);

  async function createNewVersion() {
    const latest = scripts[0];
    await fetch('/api/scripts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episode_id: episodeId,
        hook: latest?.hook || '',
        artifact: latest?.artifact || '',
        labyrinth: latest?.labyrinth || '',
        twist: latest?.twist || '',
        echo: latest?.echo || '',
        full_script: latest?.full_script || '',
      }),
    });
    load();
  }

  async function approveScript(id: string) {
    await fetch(`/api/scripts/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });
    load();
  }

  async function saveEdit() {
    if (!activeScript) return;
    await fetch(`/api/scripts/${activeScript.script_id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    setEditing(false);
    load();
  }

  function startEdit() {
    if (!activeScript) return;
    setEditForm({
      hook: activeScript.hook || '',
      artifact: activeScript.artifact || '',
      labyrinth: activeScript.labyrinth || '',
      twist: activeScript.twist || '',
      echo: activeScript.echo || '',
      full_script: activeScript.full_script || '',
    });
    setEditing(true);
  }

  if (loading) return <div className="text-text-muted text-sm text-center py-12">Loading scripts...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.push('/script-studio')} className="text-xs text-text-muted hover:text-text-secondary mb-1 block">â Back to Scripts</button>
          <h2 className="text-lg font-medium text-text-primary">Script Studio â Episode {episodeId.slice(0, 8)}</h2>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={createNewVersion}>+ New Version</Button>
          {activeScript && activeScript.approval_state !== 'Approved' && (
            <>
              {!editing && <Button size="sm" variant="secondary" onClick={startEdit}>Edit</Button>}
              <Button size="sm" onClick={() => approveScript(activeScript.script_id)}>Approve</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Version List */}
        <div className="space-y-2">
          <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Versions</div>
          {scripts.map(s => (
            <button key={s.script_id} onClick={() => { setActiveScript(s); setEditing(false); }}
              className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${activeScript?.script_id === s.script_id ? 'bg-bg-tertiary border border-accent-gold-dim' : 'bg-bg-secondary hover:bg-bg-hover border border-transparent'}`}>
              <div className="flex items-center justify-between">
                <span className="text-text-primary">v{s.version}</span>
                <ApprovalBadge state={s.approval_state || 'Pending Review'} />
              </div>
              <div className="text-text-muted mt-0.5">{s.created_at ? new Date(s.created_at).toLocaleDateString() : 'â'}</div>
            </button>
          ))}
        </div>

        {/* Julian Loop Sections */}
        <div className="col-span-3 space-y-4">
          {!activeScript ? (
            <div className="text-text-muted text-sm text-center py-12">No scripts available. Create a new version.</div>
          ) : editing ? (
            <EditMode form={editForm} setForm={setEditForm} onSave={saveEdit} onCancel={() => setEditing(false)} />
          ) : (
            <ViewMode script={activeScript} />
          )}
        </div>
      </div>
    </div>
  );
}

function ViewMode({ script }: { script: any }) {
  const sections = [
    { key: 'hook', label: 'Hook', color: 'text-accent-amber', desc: 'Opening hook â first 30 seconds' },
    { key: 'artifact', label: 'Artifact', color: 'text-accent-gold', desc: 'Surface-level discovery or realization' },
    { key: 'labyrinth', label: 'Labyrinth', color: 'text-accent-purple', desc: 'Deep exploration â complexity, nuance, stakes' },
    { key: 'twist', label: 'Twist', color: 'text-accent-red', desc: 'Unexpected turn â reframe everything' },
    { key: 'echo', label: 'Echo', color: 'text-accent-blue', desc: 'Resolution â what stays with the viewer' },
  ];

  return (
    <div className="space-y-4">
      {sections.map(sec => (
        <Card key={sec.key}>
          <CardHeader className="py-3">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${sec.color}`}>{sec.label}</span>
              <span className="text-[10px] text-text-muted">â {sec.desc}</span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-text-secondary whitespace-pre-wrap">
              {script[sec.key] || <span className="text-text-muted italic">Empty</span>}
            </div>
          </CardBody>
        </Card>
      ))}

      {script.full_script && (
        <Card>
          <CardHeader className="py-3"><span className="text-sm font-medium text-text-primary">Full Script</span></CardHeader>
          <CardBody>
            <div className="text-sm text-text-secondary whitespace-pre-wrap">{script.full_script}</div>
          </CardBody>
        </Card>
      )}

      {/* Highlights & Metadata */}
      {script.highlight_clips && script.highlight_clips.length > 0 && (
        <Card>
          <CardHeader className="py-3"><span className="text-sm font-medium text-text-primary">Highlight Clips</span></CardHeader>
          <CardBody>
            <div className="space-y-2">
              {script.highlight_clips.map((clip: any, i: number) => (
                <div key={i} className="text-xs text-text-secondary py-1 px-2 bg-bg-tertiary rounded">
                  {typeof clip === 'string' ? clip : JSON.stringify(clip)}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function EditMode({ form, setForm, onSave, onCancel }: { form: any; setForm: (f: any) => void; onSave: () => void; onCancel: () => void }) {
  const sections = [
    { key: 'hook', label: 'Hook', color: 'border-accent-amber' },
    { key: 'artifact', label: 'Artifact', color: 'border-accent-gold' },
    { key: 'labyrinth', label: 'Labyrinth', color: 'border-accent-purple' },
    { key: 'twist', label: 'Twist', color: 'border-accent-red' },
    { key: 'echo', label: 'Echo', color: 'border-accent-blue' },
  ];

  return (
    <div className="space-y-4">
      {sections.map(sec => (
        <div key={sec.key}>
          <label className={`text-[11px] text-text-muted uppercase tracking-wider block mb-1`}>{sec.label}</label>
          <textarea value={form[sec.key]} onChange={e => setForm({ ...form, [sec.key]: e.target.value })} rows={4}
            className={`w-full bg-bg-primary border ${sec.color} rounded px-3 py-2 text-sm text-text-primary focus:outline-none resize-none`} />
        </div>
      ))}
      <div>
        <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Full Script</label>
        <textarea value={form.full_script} onChange={e => setForm({ ...form, full_script: e.target.value })} rows={8}
          className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none resize-none" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>Save Changes</Button>
      </div>
    </div>
  );
}
