import { NextRequest, NextResponse } from 'next/server';
import { getScript, updateScript, approveScript, rejectScript, transitionEpisode } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const script = getScript(id);
  if (!script) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(script);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  if (body.action === 'approve') {
    const script = approveScript(id);
    if (script) {
      try { transitionEpisode(script.episode_id, 'Script Reviewed'); } catch {}
      try { transitionEpisode(script.episode_id, 'Script Approved'); } catch {}
    }
    return NextResponse.json(script);
  }
  if (body.action === 'reject') return NextResponse.json(rejectScript(id));

  const updated = updateScript(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
