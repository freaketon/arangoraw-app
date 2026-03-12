'use client';

import { useEffect, useState, useCallback } from 'react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import { StateBadge } from '@/components/ui/Badge';
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

interface ScriptData {
  script_id: string;
  episode_id: string;
  title_candidate: string;
  core_thesis: string;
  artifact: string;
  labyrinth: string;
  twist: string;
  echo: string;
  full_script: string;
  highlight_lines: string[];
  version: number;
  approval_state: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SECTION_SUBTITLES: Record<string, string> = {
  artifact: 'The hook — what grabs attention',
  labyrinth: 'The tension — the challenge or conflict',
  twist: 'The shift — the unexpected insight',
  echo: 'The resonance — what stays with them',
};

const STATE_BORDER_COLORS: Record<string, string> = {
  Draft: 'border-l-zinc-600',
  'In Progress': 'border-l-blue-500',
  Approved: 'border-l-[#c9a84c]',
  Published: 'border-l-green-500',
  Archived: 'border-l-zinc-700',
};

export default function ThisWeekPage() {
  const [week, setWeek] = useState<any | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [scripts, setScripts] = useState<Record<string, ScriptData>>({});
  const [loading, setLoading] = useState(true);
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<{ episodeId: string; section: string } | null>(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // AI Plan state
  const [planning, setPlanning] = useState(false);
  const [planProgress, setPlanProgress] = useState<PlanProgress[]>([]);
  const [planComplete, setPlanComplete] = useState(false);

  // Regenerate script state
  const [regenerating, setRegenerating] = useState<string | null>(null);

  // Confirm dialog
  const [showPlanConfirm, setShowPlanConfirm] = useState(false);

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
      const curr = allWeeks.find((w: any) => w.planning_state !== 'Archived' && w.planning_state !== 'Complete') || allWeeks[0] || null;
      setWeek(curr);

      const allEpisodes = Array.isArray(epData) ? epData : [];
      const weekEps = curr?.episode_ids
        ? allEpisodes.filter((e: any) => curr.episode_ids.includes(e.episode_id))
        : [];
      setEpisodes(weekEps);

      // Load scripts for each episode
      const scriptMap: Record<string, ScriptData> = {};
      await Promise.all(
        weekEps.map(async (ep: any) => {
          try {
            const sRes = await fetch(`/api/scripts?episode_id=${ep.episode_id}`);
            if (sRes.ok) {
              const sData = await sRes.json();
              const arr = Array.isArray(sData) ? sData : [];
              if (arr.length > 0) scriptMap[ep.episode_id] = arr[0];
            }
          } catch {}
        })
      );
      setScripts(scriptMap);
    } catch {
      setWeek(null);
      setEpisodes([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-dismiss AI planning card after 3 seconds on completion
  useEffect(() => {
    if (planComplete && !planning) {
      const timer = setTimeout(() => {
        setPlanProgress([]);
        setPlanComplete(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [planComplete, planning]);

  // ── Plan Week with AI ──
  async function planWeekWithAI() {
    setShowPlanConfirm(false);
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

  function handlePlanClick() {
    if (episodes.length > 0) {
      setShowPlanConfirm(true);
    } else {
      planWeekWithAI();
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

  // ── Save section edit ──
  async function saveSection() {
    if (!editingSection) return;
    setSavingEdit(true);
    const script = scripts[editingSection.episodeId];
    if (script) {
      await fetch(`/api/scripts/${script.script_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [editingSection.section]: editText }),
      });
    }
    setEditingSection(null);
    setEditText('');
    setSavingEdit(false);
    load();
  }

  function startEdit(episodeId: string, section: string, currentText: string) {
    setEditingSection({ episodeId, section });
    setEditText(currentText);
  }

  // ── AI rewrite section ──
  const [rewriting, setRewriting] = useState<{ episodeId: string; section: string } | null>(null);

  async function rewriteSection(episodeId: string, section: string) {
    setRewriting({ episodeId, section });
    try {
      const script = scripts[episodeId];
      if (!script) return;
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_script',
          episode_id: episodeId,
          rewrite_section: section,
        }),
      });
      if (res.ok) load();
    } catch {}
    setRewriting(null);
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 w-48 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-3 w-32 bg-bg-tertiary rounded animate-pulse mt-2" />
          </div>
          <div className="h-9 w-36 bg-bg-tertiary rounded animate-pulse" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-bg-secondary border border-border rounded-lg p-4 space-y-2">
            <div className="h-4 w-64 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-3 w-40 bg-bg-tertiary rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Map episodes to days (distribute evenly)
  const dayMap: Record<string, any[]> = {};
  DAYS.forEach(d => (dayMap[d] = []));
  episodes.forEach((ep, i) => {
    const day = DAYS[i % DAYS.length];
    dayMap[day].push({ ...ep, _day: day });
  });

  // Flatten to a single ordered list with day labels inline
  const flatEpisodes = DAYS.flatMap(day => dayMap[day]);

  return (
    <div className="space-y-6">
      {/* Confirm Dialog */}
      {showPlanConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowPlanConfirm(false)}>
          <div className="bg-bg-secondary border border-border rounded-lg p-5 max-w-sm mx-4 space-y-3" onClick={e => e.stopPropagation()}>
            <p className="text-sm text-text-primary">This will replace the current week's episodes and scripts. Continue?</p>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setShowPlanConfirm(false)}>Cancel</Button>
              <Button size="sm" onClick={planWeekWithAI}>Yes, Plan New Week</Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Progress */}
      {(planning || planProgress.length > 0) && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">AI Planning</span>
          </CardHeader>
          <CardBody>
            <div className="space-y-1 max-h-[180px] overflow-y-auto">
              {planProgress.map((p, i) => (
                <div key={i} className={`text-xs flex items-center gap-2 ${
                  p.status === 'failed' ? 'text-red-400' : p.status === 'done' ? 'text-green-400' : 'text-text-muted'
                }`}>
                  <span>{p.status === 'generating' || p.status === 'creating' ? '...' : p.status === 'done' ? '✓' : '✗'}</span>
                  <span>{p.message || p.title || p.error || `${p.step}: ${p.status}`}</span>
                </div>
              ))}
              {planning && <div className="text-xs text-accent-gold-dim animate-pulse">Working...</div>}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-text-primary">
            {week?.week_theme || week?.week_label || 'No Week Planned'}
          </h2>
          {week && (
            <div className="text-xs text-text-muted mt-1">
              {week.start_date && new Date(week.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {week.end_date && ` — ${new Date(week.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              {' · '}{episodes.length} episode{episodes.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <Button onClick={handlePlanClick} disabled={planning}>
          {planning ? 'Planning...' : 'Plan Week with AI'}
        </Button>
      </div>

      {!week && episodes.length === 0 ? (
        <EmptyState
          icon={<svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>}
          title="No content yet"
          description="Hit 'Plan Week with AI' to generate your first week of episodes and scripts."
          action={
            <Button onClick={handlePlanClick} disabled={planning}>
              {planning ? 'Planning...' : 'Plan Week with AI'}
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {flatEpisodes.map(ep => {
            const script = scripts[ep.episode_id];
            const isExpanded = expandedEpisode === ep.episode_id;
            const borderColor = STATE_BORDER_COLORS[ep.state] || 'border-l-zinc-600';
            return (
              <Card key={ep.episode_id} className={`border-l-2 ${borderColor}`}>
                <div
                  className="px-4 py-3 cursor-pointer hover:bg-bg-hover transition-colors"
                  onClick={() => setExpandedEpisode(isExpanded ? null : ep.episode_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-text-primary">
                        {ep.working_title || ep.title}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                        <span className="text-text-muted/60">{ep._day}</span>
                        <span>·</span>
                        <span>{ep.pillar}</span>
                        {ep.core_thesis && (
                          <span className="truncate max-w-[300px]">
                            · {ep.core_thesis}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StateBadge state={ep.state} />
                      {script && (
                        <span className="text-[10px] text-text-muted">v{script.version}</span>
                      )}
                      <span className="text-text-muted text-xs">{isExpanded ? '▾' : '▸'}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded: Script sections */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 space-y-4">
                    {!script ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">No script yet</span>
                        <Button
                          size="sm"
                          onClick={() => regenerateScript(ep.episode_id)}
                          disabled={regenerating === ep.episode_id}
                        >
                          {regenerating === ep.episode_id ? 'Generating...' : 'Generate Script'}
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Script title */}
                        <div className="text-sm font-medium text-accent-gold">
                          {script.title_candidate}
                        </div>

                        {/* Julian Loop sections */}
                        {(['artifact', 'labyrinth', 'twist', 'echo'] as const).map(section => {
                          const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);
                          const text = script[section] || '';
                          const isEditingThis = editingSection?.episodeId === ep.episode_id && editingSection?.section === section;
                          const isRewritingThis = rewriting?.episodeId === ep.episode_id && rewriting?.section === section;

                          return (
                            <div key={section}>
                              <div className="flex items-center justify-between mb-1">
                                <div>
                                  <span className="text-[10px] text-text-muted uppercase tracking-wider">
                                    {sectionLabel}
                                  </span>
                                  <span className="text-[10px] text-text-muted/50 ml-2 normal-case tracking-normal">
                                    {SECTION_SUBTITLES[section]}
                                  </span>
                                </div>
                                {!isEditingThis && (
                                  <div className="flex gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => startEdit(ep.episode_id, section, text)}
                                      className="text-[10px] text-text-muted hover:text-text-primary px-1.5 py-0.5 rounded bg-bg-tertiary"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => rewriteSection(ep.episode_id, section)}
                                      disabled={isRewritingThis}
                                      className="text-[10px] text-accent-gold-dim hover:text-accent-gold px-1.5 py-0.5 rounded bg-bg-tertiary disabled:opacity-50"
                                    >
                                      {isRewritingThis ? '...' : 'AI Rewrite'}
                                    </button>
                                  </div>
                                )}
                              </div>
                              {isEditingThis ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editText}
                                    onChange={e => setEditText(e.target.value)}
                                    rows={4}
                                    className="w-full bg-bg-primary border border-accent-gold-dim rounded px-3 py-2 text-xs text-text-secondary focus:outline-none resize-none"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => { setEditingSection(null); setEditText(''); }}
                                      className="text-[10px] text-text-muted hover:text-text-primary px-2 py-1 rounded bg-bg-tertiary"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={saveSection}
                                      disabled={savingEdit}
                                      className="text-[10px] text-bg-primary bg-accent-gold hover:bg-accent-gold/90 px-2 py-1 rounded disabled:opacity-50"
                                    >
                                      {savingEdit ? 'Saving...' : 'Save'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                                  {text || <span className="text-text-muted italic">Empty</span>}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Action bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                          <div className="flex gap-2">
                            <StateBadge state={script.approval_state} />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => regenerateScript(ep.episode_id)}
                              disabled={regenerating === ep.episode_id}
                            >
                              {regenerating === ep.episode_id ? 'Generating...' : 'Regenerate'}
                            </Button>
                            {script.approval_state !== 'Approved' && (
                              <Button
                                size="sm"
                                onClick={async () => {
                                  await fetch(`/api/scripts/${script.script_id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ action: 'approve' }),
                                  });
                                  load();
                                }}
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
