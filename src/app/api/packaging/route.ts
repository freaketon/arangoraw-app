import { NextRequest, NextResponse } from 'next/server';
import {
  createPublishingPacket, listPublishingPackets, getPacketByEpisode,
  approvePublishingPacket, updatePublishingPacket,
} from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const episodeId = searchParams.get('episode_id');
  if (episodeId) {
    const packet = getPacketByEpisode(episodeId);
    return NextResponse.json(packet || { error: 'Not found' });
  }
  return NextResponse.json(listPublishingPackets());
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === 'approve' && body.id) {
    return NextResponse.json(approvePublishingPacket(body.id));
  }
  if (body.action === 'publish' && body.id) {
    const updated = updatePublishingPacket(body.id, { ready_for_publish: true });
    return NextResponse.json(updated);
  }

  const packet = createPublishingPacket(body);
  return NextResponse.json(packet, { status: 201 });
}
