import { NextRequest, NextResponse } from 'next/server';
import { createWeeklyCycle, listWeeklyCycles, getCurrentWeek } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('current') === 'true') {
    const current = getCurrentWeek();
    return NextResponse.json(current || { error: 'No current week' });
  }
  return NextResponse.json(listWeeklyCycles());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const cycle = createWeeklyCycle(body);
  return NextResponse.json(cycle, { status: 201 });
}
