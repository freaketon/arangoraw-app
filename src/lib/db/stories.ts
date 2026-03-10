// ============================================================
// ArangoRAW - Stories Database Module
// ============================================================

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { initializeDataStore } from './store';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORIES_FILE = path.join(DATA_DIR, 'stories.json');

export interface Story {
  id: string;
  title: string;
  hook: string;
  narrative: string;
  pillar: string;
  era: string;
  state: 'intake' | 'developing' | 'ready' | 'used' | 'archived';
  publishable: boolean;
  episode_id?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

function readStories(): Story[] {
  initializeDataStore();
  if (!fs.existsSync(STORIES_FILE)) {
    fs.writeFileSync(STORIES_FILE, JSON.stringify([], null, 2));
    return [];
  }
  return JSON.parse(fs.readFileSync(STORIES_FILE, 'utf-8'));
}

function writeStories(stories: Story[]): void {
  initializeDataStore();
  fs.writeFileSync(STORIES_FILE, JSON.stringify(stories, null, 2));
}

export function createStory(data: Partial<Story>): Story {
  const stories = readStories();
  const story: Story = {
    id: uuidv4(),
    title: data.title || '',
    hook: data.hook || '',
    narrative: data.narrative || '',
    pillar: data.pillar || '',
    era: data.era || '',
    state: 'intake',
    publishable: false,
    tags: data.tags || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...data,
  } as Story;
  stories.push(story);
  writeStories(stories);
  return story;
}

export function listStories(): Story[] {
  return readStories();
}

export function getStory(id: string): Story | undefined {
  return readStories().find(s => s.id === id);
}

export function updateStory(id: string, data: Partial<Story>): Story | undefined {
  const stories = readStories();
  const idx = stories.findIndex(s => s.id === id);
  if (idx === -1) return undefined;
  stories[idx] = { ...stories[idx], ...data, updated_at: new Date().toISOString() };
  writeStories(stories);
  return stories[idx];
}

export function searchStories(query: string): Story[] {
  const q = query.toLowerCase();
  return readStories().filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.hook.toLowerCase().includes(q) ||
    s.narrative.toLowerCase().includes(q)
  );
}

export function filterStories(filters: { era?: string; pillar?: string }): Story[] {
  let stories = readStories();
  if (filters.era) stories = stories.filter(s => s.era === filters.era);
  if (filters.pillar) stories = stories.filter(s => s.pillar === filters.pillar);
  return stories;
}

export function getPublishableStories(): Story[] {
  return readStories().filter(s => s.publishable && s.state === 'ready');
}

export function transitionIntake(id: string, newState: string): { success: boolean; error?: string } {
  const stories = readStories();
  const idx = stories.findIndex(s => s.id === id);
  if (idx === -1) return { success: false, error: 'Story not found' };
  stories[idx].state = newState as Story['state'];
  stories[idx].updated_at = new Date().toISOString();
  writeStories(stories);
  return { success: true };
}

export function markStoryUsed(id: string): Story | undefined {
  return updateStory(id, { state: 'used' });
}

export function attachStory(episodeId: string, storyId: string): Story | undefined {
  return updateStory(storyId, { episode_id: episodeId });
}
