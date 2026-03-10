import { NextRequest, NextResponse } from 'next/server';
import { getEpisode, updateEpisode, transitionEpisode, attachStory, attachReference } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const episode = getEpisode(id);
  if (!episode) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(episode);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  // Handle state transitions
  if (body.action === 'transition' && body.state) {
    const result = transitionEpisode(id, body.state);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result.episode);
  }

  // Handle story attachment
  if (body.action === 'attach_story' && body.story_id) {
    const updated = attachStory(id, body.story_id);
    if (!updated) return NextResponse.json({ error: 'Failed' }, { status: 400 });
    return NextResponse.json(updated);
  }

  // Handle reference attachment
  if (body.action === 'attach_reference' && body.reference_id) {
    const updated = attachReference(id, body.reference_id);
    if (!updated) return NextResponse.json({ error: 'Failed' }, { status: 400 });
    return NextResponse.json(updated);
  }

  // General update
  const updated = updateEpisode(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
