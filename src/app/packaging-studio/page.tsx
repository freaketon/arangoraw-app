'use client';

import { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import { ApprovalBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';

export default function PackagingStudioPage() {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/episodes');
        const data = res.ok ? await res.json() : [];
        const eps = (Array.isArray(data) ? data : []).filter(
          (e: any) => ['Packaging', 'Packaging Review', 'Final Review', 'Approved Script', 'Scheduled', 'Published'].includes(e.state)
        );
        setEpisodes(eps);
      } catch { setEpisodes([]); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="text-text-muted text-sm text-center py-12">Loading packaging...</div>;

  if (episodes.length === 0) {
    return <EmptyState icon="â«" title="No Packaging Tasks" description="Episodes will appear here once they reach the packaging stage." />;
  }

  return (
    <div className="space-y-4">
      {episodes.map(ep => (
        <Link key={ep.episode_id} href={`/packaging-studio/${ep.episode_id}`} className="block">
          <Card hover>
            <CardBody className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm text-text-primary font-medium">{ep.title || 'Untitled Episode'}</div>
                <div className="text-xs text-text-muted mt-0.5">Ep {ep.episode_number || 'â'} Â· {ep.state}</div>
              </div>
              <Button variant="ghost" size="sm">Open â</Button>
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  );
}
