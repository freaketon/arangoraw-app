// ============================================================
// ArangoRAW â Publishing Packet Data Operations
// ============================================================

import { PublishingPacket, ApprovalState } from '@/lib/types';
import { create, read, update, list, query, generateId, logEvent } from './store';

const COLLECTION = 'publishing_packets';

export function createPublishingPacket(data: {
  episode_id: string;
  final_title: string;
  final_script: string;
  description: string;
  pinned_comment: string;
  thumbnail_selection: string;
  shorts_assets: string[];
  story_assets: string[];
  publishing_notes?: string;
}): PublishingPacket {
  const now = new Date().toISOString();
  const packet: PublishingPacket = {
    publishing_packet_id: generateId(),
    episode_id: data.episode_id,
    final_title: data.final_title,
    final_script: data.final_script,
    description: data.description,
    pinned_comment: data.pinned_comment,
    thumbnail_selection: data.thumbnail_selection,
    shorts_assets: data.shorts_assets,
    story_assets: data.story_assets,
    approval_state: 'Pending Review' as ApprovalState,
    ready_for_publish: false,
    publishing_notes: data.publishing_notes || '',
    created_at: now,
    updated_at: now,
  };
  create(COLLECTION, packet);
  logEvent('created', 'publishing_packet', packet.publishing_packet_id, { episode_id: data.episode_id });
  return packet;
}

export function getPublishingPacket(id: string): PublishingPacket | null {
  return read<PublishingPacket>(COLLECTION, id);
}

export function getPacketByEpisode(episodeId: string): PublishingPacket | null {
  const packets = query<PublishingPacket>(COLLECTION, p => p.episode_id === episodeId);
  return packets.length > 0 ? packets[0] : null;
}

export function approvePublishingPacket(id: string): PublishingPacket | null {
  const updated = update<PublishingPacket>(COLLECTION, id, {
    approval_state: 'Approved' as ApprovalState,
    ready_for_publish: true,
  } as Partial<PublishingPacket>);
  if (updated) logEvent('approval', 'publishing_packet', id, { state: 'Approved' });
  return updated;
}

export function updatePublishingPacket(id: string, updates: Partial<PublishingPacket>): PublishingPacket | null {
  return update<PublishingPacket>(COLLECTION, id, updates);
}

export function listPublishingPackets(): PublishingPacket[] {
  return list<PublishingPacket>(COLLECTION);
}
