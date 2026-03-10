import { NextRequest, NextResponse } from 'next/server';
import { createSnapshot, listSnapshots, getSnapshotsByEpisode, getTopPerformers } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const episodeId = searchParams.get('episode_id');
  const top = searchParams.get('top');
  const metric = searchParams.get('metric') as 'views' | 'ctr' | 'watch_time';

  if (episodeId) return NextResponse.json(getSnapshotsByEpisode(episodeId));
  if (top && metric) return NextResponse.json(getTopPerformers(metric, parseInt(top)));
  return NextResponse.json(listSnapshots());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const snapshot = createSnapshot(body);
  return NextResponse.json(snapshot, { status: 201 });
}
