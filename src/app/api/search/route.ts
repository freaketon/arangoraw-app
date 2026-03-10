import { NextRequest, NextResponse } from 'next/server';
import { searchEpisodes, searchStories, searchReferences } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  if (!q) return NextResponse.json({ error: 'Missing search query' }, { status: 400 });

  const results = {
    episodes: searchEpisodes(q),
    stories: searchStories(q),
    research: searchReferences(q),
  };
  return NextResponse.json(results);
}
