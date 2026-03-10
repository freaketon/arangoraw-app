import { NextRequest, NextResponse } from 'next/server';
import { createReference, listReferences, searchReferences, filterReferences } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const type = searchParams.get('type');
  const quality = searchParams.get('quality');
  const approved = searchParams.get('approved');

  if (q) return NextResponse.json(searchReferences(q));
  if (type || quality || approved) {
    return NextResponse.json(filterReferences({
      reference_type: type as never,
      source_quality: quality as never,
      approved_only: approved === 'true',
    }));
  }
  return NextResponse.json(listReferences());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ref = createReference(body);
  return NextResponse.json(ref, { status: 201 });
}
