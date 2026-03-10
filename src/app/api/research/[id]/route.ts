import { NextRequest, NextResponse } from 'next/server';
import { getReference, updateReference, approveReference, markReferenceUsed } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ref = getReference(id);
  if (!ref) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(ref);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  if (body.action === 'approve') {
    const updated = approveReference(id);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  }

  if (body.action === 'mark_used') {
    const updated = markReferenceUsed(id);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  }

  const updated = updateReference(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
