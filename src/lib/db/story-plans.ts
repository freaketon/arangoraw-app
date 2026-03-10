// ============================================================
// ArangoRAW â Story Plan Data Operations
// ============================================================

import { StoryPlan, StoryFrame } from '@/lib/types';
import { create, read, update, list, query, generateId, logEvent } from './store';

const COLLECTION = 'story_plans';

export function createStoryPlan(data: {
  date: string;
  objective: string;
  frames: StoryFrame[];
  linked_episode_id?: string | null;
  interactive_elements?: string[];
  status?: 'Draft' | 'Ready' | 'Published';
}): StoryPlan {
  const now = new Date().toISOString();
  const plan: StoryPlan = {
    story_plan_id: generateId(),
    date: data.date,
    objective: data.objective,
    frames: data.frames,
    linked_episode_id: data.linked_episode_id || null,
    interactive_elements: data.interactive_elements || [],
    status: data.status || 'Draft',
    created_at: now,
    updated_at: now,
  };
  create(COLLECTION, plan);
  logEvent('created', 'story_plan', plan.story_plan_id, { date: data.date });
  return plan;
}

export function getStoryPlan(id: string): StoryPlan | null {
  return read<StoryPlan>(COLLECTION, id);
}

export function getStoryPlansByDate(date: string): StoryPlan[] {
  return query<StoryPlan>(COLLECTION, p => p.date === date);
}

export function getStoryPlanByEpisode(episodeId: string): StoryPlan | null {
  const plans = query<StoryPlan>(COLLECTION, p => p.linked_episode_id === episodeId);
  return plans.length > 0 ? plans[0] : null;
}

export function updateStoryPlan(id: string, updates: Partial<StoryPlan>): StoryPlan | null {
  return update<StoryPlan>(COLLECTION, id, updates);
}

export function listStoryPlans(): StoryPlan[] {
  return list<StoryPlan>(COLLECTION);
}
