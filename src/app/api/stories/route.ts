import { NextRequest, NextResponse } from 'next/server';
import { createStory, listStories, searchStories, filterStories, getPublishableStories } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const publishable = searchParams.get('publishable');
  const era = searchParams.get('era');
  const pillar = searchParams.get('pillar');

  if (q) return NextResponse.json(searchStories(q));
  if (publishable === 'true') return NextResponse.json(getPublishableStories());
  if (era || pillar) {
    return NextResponse.json(filterStories({
      era: era as never,
      pillar: pillar as never,
    }));
  }
  return NextResponse.json(listStories());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const story = createStory(body);
  return NextResponse.json(story, { status: 201 });
}
