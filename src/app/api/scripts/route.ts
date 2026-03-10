import { NextRequest, NextResponse } from 'next/server';
import { createScript, listScripts, getScriptsByEpisode } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const episodeId = searchParams.get('episode_id');
  if (episodeId) return NextResponse.json(getScriptsByEpisode(episodeId));
  return NextResponse.json(listScripts());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const script = createScript(body);
  return NextResponse.json(script, { status: 201 });
}
