// ============================================================
// ArangoRAW â Prompt Template Data Operations
// ============================================================

import { PromptTemplate, AgentName } from '@/lib/types';
import { create, read, update, list, query, generateId } from './store';

const COLLECTION = 'prompt_templates';

export function createPromptTemplate(data: {
  agent_name: AgentName;
  version: string;
  system_prompt: string;
  task_prompt: string;
  output_schema: Record<string, unknown>;
  retry_prompt: string;
  critique_prompt: string;
}): PromptTemplate {
  const now = new Date().toISOString();
  const template: PromptTemplate = {
    template_id: generateId(),
    agent_name: data.agent_name,
    version: data.version,
    system_prompt: data.system_prompt,
    task_prompt: data.task_prompt,
    output_schema: data.output_schema,
    retry_prompt: data.retry_prompt,
    critique_prompt: data.critique_prompt,
    created_at: now,
  };
  create(COLLECTION, template);
  return template;
}

export function getPromptTemplate(id: string): PromptTemplate | null {
  return read<PromptTemplate>(COLLECTION, id);
}

export function getLatestTemplate(agentName: AgentName): PromptTemplate | null {
  const templates = query<PromptTemplate>(COLLECTION, t => t.agent_name === agentName)
    .sort((a, b) => b.version.localeCompare(a.version));
  return templates.length > 0 ? templates[0] : null;
}

export function getTemplatesByAgent(agentName: AgentName): PromptTemplate[] {
  return query<PromptTemplate>(COLLECTION, t => t.agent_name === agentName)
    .sort((a, b) => b.version.localeCompare(a.version));
}

export function updatePromptTemplate(id: string, updates: Partial<PromptTemplate>): PromptTemplate | null {
  return update<PromptTemplate>(COLLECTION, id, updates);
}

export function listPromptTemplates(): PromptTemplate[] {
  return list<PromptTemplate>(COLLECTION);
}
