import { NextRequest, NextResponse } from 'next/server';
import { logExecution, listExecutions, getExecutionsByAgent, getAgentStats, getFailedExecutions } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agent = searchParams.get('agent');
  const stats = searchParams.get('stats');
  const failed = searchParams.get('failed');

  if (failed === 'true') return NextResponse.json(getFailedExecutions());
  if (agent && stats === 'true') return NextResponse.json(getAgentStats(agent as never));
  if (agent) return NextResponse.json(getExecutionsByAgent(agent as never));
  return NextResponse.json(listExecutions());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const execution = logExecution(body);
  return NextResponse.json(execution, { status: 201 });
}
