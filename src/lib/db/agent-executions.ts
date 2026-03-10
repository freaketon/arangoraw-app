// ============================================================
// ArangoRAW â Agent Execution Log Data Operations
// ============================================================

import { AgentExecution, AgentName } from '@/lib/types';
import { create, read, list, query, generateId } from './store';

const COLLECTION = 'agent_executions';

export function logExecution(data: {
  agent_name: AgentName;
  episode_id: string | null;
  week_id?: string | null;
  prompt_version: string;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown> | null;
  retry_count: number;
  critique_payload?: Record<string, unknown> | null;
  status: 'Running' | 'Success' | 'Failed' | 'Retrying';
  error_message?: string | null;
}): AgentExecution {
  const now = new Date().toISOString();
  const execution: AgentExecution = {
    execution_id: generateId(),
    agent_name: data.agent_name,
    episode_id: data.episode_id,
    week_id: data.week_id || null,
    prompt_version: data.prompt_version,
    input_payload: data.input_payload,
    output_payload: data.output_payload,
    critique_payload: data.critique_payload || null,
    retry_count: data.retry_count,
    status: data.status,
    error_message: data.error_message || null,
    started_at: now,
    completed_at: data.status === 'Running' ? null : now,
  };
  create(COLLECTION, execution);
  return execution;
}

export function getExecution(id: string): AgentExecution | null {
  return read<AgentExecution>(COLLECTION, id);
}

export function getExecutionsByEpisode(episodeId: string): AgentExecution[] {
  return query<AgentExecution>(COLLECTION, e => e.episode_id === episodeId)
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
}

export function getExecutionsByAgent(agentName: AgentName): AgentExecution[] {
  return query<AgentExecution>(COLLECTION, e => e.agent_name === agentName)
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
}

export function getFailedExecutions(): AgentExecution[] {
  return query<AgentExecution>(COLLECTION, e => e.status === 'Failed');
}

export function getAgentStats(agentName: AgentName): {
  total: number;
  successes: number;
  failures: number;
  avgRetries: number;
} {
  const executions = getExecutionsByAgent(agentName);
  const successes = executions.filter(e => e.status === 'Success').length;
  return {
    total: executions.length,
    successes,
    failures: executions.length - successes,
    avgRetries: executions.length > 0 ? executions.reduce((sum, e) => sum + e.retry_count, 0) / executions.length : 0,
  };
}

export function listExecutions(): AgentExecution[] {
  return list<AgentExecution>(COLLECTION);
}
