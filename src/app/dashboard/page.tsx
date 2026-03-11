'use client';

import { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import { StateBadge, PillarBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useAIGenerate } from '@/hooks/useAIGenerate';

interface DashboardData {
  episodes: any[];
  currentWeek: any;
  recentStories: any[];
  pendingApprovals: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState<any>(null);
  const { generate, generating, error: aiError } = useAIGenerate();

  async function load() {
    try {
      const [epRes, weekRes, storyRes] = await Promise.all([
        fetch('/api/episodes?limit=10'),
        fetch('/api/weekly-cycles?current=true'),
        fetch('/api/stories?limit=5'),
      ]);
      const episodes = epRes.ok ? await epRes.json() : [];
      const weekData = weekRes.ok ? await weekRes.json() : null;
      const stories = storyRes.ok ? await storyRes.json() : [];

      const pending = (Array.isArray(episodes) ? episodes : []).filter(
        (e: any) => ['Script Review', 'Packaging Review', 'Final Review'].includes(e.state)
      );

      setData({
        episodes: Array.isArray(episodes) ? episodes.slice(0, 6) : [],
        currentWeek: weekData,
        recentStories: Array.isArray(stories) ? stories.slice(0, 5) : [],
        pendingApprovals: pending,
      });
    } catch {
      setData({ episodes: [], currentWeek: null, recentStories: [], pendingApprovals: [] });
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAssessStudio() {
    const result = await generate('assess_studio');
    if (result) { setAiResult(result); load(); }
  }

  async function handlePlanWeek() {
    const result = await generate('generate_weekly_strategy');
    if (result) { setAiResult(result); load(); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-muted text-sm">Loading command center...</div>
      </div>
    );
  }

  const stats = [
    { label: 'Active Episodes', value: data?.episodes.filter(e => !['Published', 'Archived'].includes(e.state)).length || 0, color: 'text-accent-gold' },
    { label: 'Pending Approvals', value: data?.pendingApprovals.length || 0, color: 'text-accent-amber' },
    { label: 'Stories Available', value: data?.recentStories.length || 0, color: 'text-accent-blue' },
    { label: 'Week Status', value: data?.currentWeek?.state || 'No Week', color: 'text-accent-green' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardBody>
              <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1">{stat.label}</div>
              <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* AI Command Bar */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted uppercase tracking-wider">AI</span>
            <button
              onClick={handleAssessStudio}
              disabled={generating !== null}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                generating === 'assess_studio'
                  ? 'border-accent-gold/40 bg-accent-gold/10 text-accent-gold'
                  : generating ? 'border-border-primary/30 text-text-muted cursor-not-allowed'
                  : 'border-border-primary bg-bg-secondary hover:border-accent-gold/30 text-text-secondary'
              }`}
            >
              {generating === 'assess_studio' ? '⏳ Assessing...' : '🏭 Assess Studio'}
            </button>
            <button
              onClick={handlePlanWeek}
              disabled={generating !== null}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                generating === 'generate_weekly_strategy'
                  ? 'border-accent-gold/40 bg-accent-gold/10 text-accent-gold'
                  : generating ? 'border-border-primary/30 text-text-muted cursor-not-allowed'
                  : 'border-border-primary bg-bg-secondary hover:border-accent-gold/30 text-text-secondary'
              }`}
            >
              {generating === 'generate_weekly_strategy' ? '⏳ Planning...' : '📅 Plan Week'}
            </button>
            {aiError && <span className="text-xs text-red-400">Error: {aiError}</span>}
            {aiResult && <span className="text-xs text-accent-gold">✓ {aiResult.agent} done</span>}
          </div>
        </CardBody>
      </Card>

      {/* AI Assessment Result */}
      {aiResult?.result?.generated?.summary && (
        <Card>
          <CardHeader><span className="text-sm font-medium">Studio Assessment</span></CardHeader>
          <CardBody>
            <p className="text-sm text-text-secondary mb-3">{aiResult.result.generated.summary}</p>
            {aiResult.result.generated.weekly_health && (
              <span className={`text-xs px-2 py-1 rounded ${
                aiResult.result.generated.weekly_health === 'On Track' ? 'bg-green-500/10 text-green-400' :
                aiResult.result.generated.weekly_health === 'At Risk' ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-red-500/10 text-red-400'
              }`}>{aiResult.result.generated.weekly_health}</span>
            )}
            {aiResult.result.generated.next_actions?.length > 0 && (
              <div className="mt-3 space-y-1">
                {aiResult.result.generated.next_actions.map((a: any, i: number) => (
                  <div key={i} className="text-xs text-text-muted">P{a.priority}: {a.action} — <span className="text-text-secondary">{a.episode}</span></div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Active Episodes */}
        <div className="col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">Active Episodes</span>
              <Link href="/episodes">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardBody className="space-y-3">
              {data?.episodes.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-sm">
                  No episodes yet. Create your first one.
                </div>
              ) : (
                data?.episodes.map(ep => (
                  <Link key={ep.episode_id} href={`/episodes/${ep.episode_id}`} className="block">
                    <div className="flex items-center justify-between py-2 px-3 rounded hover:bg-bg-hover transition-colors">
                      <div>
                        <div className="text-sm text-text-primary">{ep.title || 'Untitled Episode'}</div>
                        <div className="text-xs text-text-muted mt-0.5">Ep {ep.episode_number || '—'}</div>
                      </div>
                      <StateBadge state={ep.state} />
                    </div>
                  </Link>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar Panels */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <span className="text-sm font-medium text-text-primary">Pending Approvals</span>
            </CardHeader>
            <CardBody>
              {data?.pendingApprovals.length === 0 ? (
                <div className="text-xs text-text-muted">Nothing needs approval right now.</div>
              ) : (
                <div className="space-y-2">
                  {data?.pendingApprovals.map(ep => (
                    <Link key={ep.episode_id} href={`/episodes/${ep.episode_id}`} className="block">
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-xs text-text-secondary truncate">{ep.title}</span>
                        <StateBadge state={ep.state} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Stories */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">Recent Stories</span>
              <Link href="/story-library">
                <Button variant="ghost" size="sm">Library</Button>
              </Link>
            </CardHeader>
            <CardBody>
              {data?.recentStories.length === 0 ? (
                <div className="text-xs text-text-muted">No stories in the library yet.</div>
              ) : (
                <div className="space-y-2">
                  {data?.recentStories.map(s => (
                    <div key={s.story_id} className="py-1.5">
                      <div className="text-xs text-text-secondary">{s.title}</div>
                      <div className="flex gap-1 mt-1">
                        {s.pillar && <PillarBadge pillar={s.pillar} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
