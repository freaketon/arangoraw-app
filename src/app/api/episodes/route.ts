import { NextRequest, NextResponse } from 'next/server';
import { createEpisode, listEpisodes, getEpisodesByState, searchEpisodes } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const q = searchParams.get('q');

  if (q) return NextResponse.json(searchEpisodes(q));
  if (state) return NextResponse.json(getEpisodesByState(state as never));
  return NextResponse.json(listEpisodes());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const episode = createEpisode(body);
  return NextResponse.json(episode, { status: 201 });
}
