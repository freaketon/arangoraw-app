// ============================================================
// ArangoRAW â Script Data Operations
// ============================================================

import { Script, ApprovalState, AgentName } from '@/lib/types';
import { create, read, update, list, query, generateId, logEvent } from './store';

const COLLECTION = 'scripts';

export function createScript(data: {
  episode_id: string;
  title_candidate: string;
  core_thesis: string;
  artifact: string;
  labyrinth: string;
  twist: string;
  echo: string;
  full_script: string;
  highlight_lines: string[];
  created_by_agent: AgentName | 'Human';
}): Script {
  // Get the next version number for this episode
  const existing = getScriptsByEpisode(data.episode_id);
  const nextVersion = existing.length > 0 ? Math.max(...existing.map(s => s.version)) + 1 : 1;

  const now = new Date().toISOString();
  const script: Script = {
    script_id: generateId(),
    ...data,
    version: nextVersion,
    approval_state: 'Pending',
    created_at: now,
    revised_at: null,
  };
  create(COLLECTION, script);
  logEvent('state_change', 'script', script.script_id, {
    episode_id: data.episode_id,
    version: nextVersion,
    agent: data.created_by_agent,
  });
  return script;
}

export function getScript(id: string): Script | null {
  return read<Script>(COLLECTION, id);
}

export function getScriptsByEpisode(episodeId: string): Script[] {
  return query<Script>(COLLECTION, s => s.episode_id === episodeId)
    .sort((a, b) => b.version - a.version);
}

export function getLatestScript(episodeId: string): Script | null {
  const scripts = getScriptsByEpisode(episodeId);
  return scripts.length > 0 ? scripts[0] : null;
}

export function approveScript(id: string): Script | null {
  const updated = update<Script>(COLLECTION, id, { approval_state: 'Approved' as ApprovalState } as Partial<Script>);
  if (updated) {
    logEvent('approval', 'script', id, { episode_id: updated.episode_id, state: 'Approved' });
  }
  return updated;
}

export function rejectScript(id: string): Script | null {
  return update<Script>(COLLECTION, id, { approval_state: 'Rejected' as ApprovalState } as Partial<Script>);
}

export function updateScript(id: string, updates: Partial<Script>): Script | null {
  return update<Script>(COLLECTION, id, { ...updates, revised_at: new Date().toISOString() });
}

export function listScripts(): Script[] {
  return list<Script>(COLLECTION);
}
