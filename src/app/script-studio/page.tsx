'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card, { CardBody } from '@/components/ui/Card';
import { ApprovalBadge } from '@/components/ui/Badge';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function ScriptStudioPage() {
  const [scripts, setScripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/scripts');
        const data = res.ok ? await res.json() : [];
        setScripts(Array.isArray(data) ? data : []);
      } catch { setScripts([]); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="text-text-muted text-sm text-center py-12">Loading scripts...</div>;

  if (scripts.length === 0) {
    return <EmptyState icon="â" title="No Scripts" description="Scripts are created from the Episode workspace when an episode reaches Scripting state." />;
  }

  // Group by episode
  const byEpisode: Record<string, any[]> = {};
  scripts.forEach(s => {
    const key = s.episode_id || 'unlinked';
    if (!byEpisode[key]) byEpisode[key] = [];
    byEpisode[key].push(s);
  });

  return (
    <div className="space-y-6">
      {Object.entries(byEpisode).map(([epId, epScripts]) => (
        <Card key={epId}>
          <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">Episode: {epId === 'unlinked' ? 'Unlinked' : epId.slice(0, 8)}</span>
            <Link href={`/script-studio/${epId}`}>
              <span className="text-xs text-accent-gold hover:underline">Open in Studio â</span>
            </Link>
          </div>
          <CardBody>
            <div className="space-y-2">
              {epScripts.sort((a, b) => (b.version || 0) - (a.version || 0)).map(s => (
                <div key={s.script_id} className="flex items-center justify-between py-2 px-3 rounded hover:bg-bg-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">v{s.version}</Badge>
                    <span className="text-xs text-text-secondary">{s.created_at ? new Date(s.created_at).toLocaleDateString() : 'â'}</span>
                  </div>
                  <ApprovalBadge state={s.approval_state || 'Pending Review'} />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
