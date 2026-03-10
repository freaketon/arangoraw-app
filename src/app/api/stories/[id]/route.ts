import { NextRequest, NextResponse } from 'next/server';
import { getStory, updateStory, transitionIntake, markStoryUsed } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = getStory(id);
  if (!story) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(story);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  if (body.action === 'transition' && body.state) {
    const result = transitionIntake(id, body.state);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (body.action === 'mark_used') {
    const updated = markStoryUsed(id);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  }

  const updated = updateStory(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
