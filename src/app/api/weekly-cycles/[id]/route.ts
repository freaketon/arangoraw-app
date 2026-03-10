import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyCycle, updateWeeklyCycle, transitionWeeklyCycle, addEpisodeToWeek } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cycle = getWeeklyCycle(id);
  if (!cycle) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(cycle);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  if (body.action === 'transition') {
    const result = transitionWeeklyCycle(id, body.state);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (body.action === 'lock') {
    const result = transitionWeeklyCycle(id, 'Locked');
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (body.action === 'add_episode') return NextResponse.json(addEpisodeToWeek(id, body.episode_id));

  const updated = updateWeeklyCycle(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
