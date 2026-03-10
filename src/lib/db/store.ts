// ============================================================
// ArangoRAW â JSON File Store
// Single-user file-based storage for v1
// Designed for clean migration to PostgreSQL + pgvector
// ============================================================

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getCollectionPath(collection: string): string {
  const dir = path.join(DATA_DIR, collection);
  ensureDir(dir);
  return dir;
}

function getFilePath(collection: string, id: string): string {
  return path.join(getCollectionPath(collection), `${id}.json`);
}

// === GENERIC CRUD ===

export function generateId(): string {
  return uuidv4();
}

export function create<T extends Record<string, any>>(collection: string, data: T): T {
  const filePath = getFilePath(collection, data[getIdField(collection)] as string);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

export function read<T>(collection: string, id: string): T | null {
  const filePath = getFilePath(collection, id);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function update<T extends Record<string, any>>(collection: string, id: string, updates: Partial<T>): T | null {
  const existing = read<T>(collection, id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
  const filePath = getFilePath(collection, id);
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  return updated as T;
}

export function remove(collection: string, id: string): boolean {
  const filePath = getFilePath(collection, id);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

export function list<T>(collection: string): T[] {
  const dir = getCollectionPath(collection);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
    return JSON.parse(raw) as T;
  });
}

export function query<T>(collection: string, predicate: (item: T) => boolean): T[] {
  return list<T>(collection).filter(predicate);
}

export function search<T>(collection: string, fields: string[], searchTerm: string): T[] {
  const term = searchTerm.toLowerCase();
  return list<T>(collection).filter(item => {
    const record = item as Record<string, unknown>;
    return fields.some(field => {
      const value = record[field];
      if (typeof value === 'string') return value.toLowerCase().includes(term);
      if (Array.isArray(value)) return value.some(v => typeof v === 'string' && v.toLowerCase().includes(term));
      return false;
    });
  });
}

// === COLLECTION NAMES â ID FIELD MAPPING ===

function getIdField(collection: string): string {
  const map: Record<string, string> = {
    episodes: 'episode_id',
    stories: 'story_id',
    research: 'reference_id',
    scripts: 'script_id',
    metadata_packs: 'metadata_pack_id',
    thumbnail_packs: 'thumbnail_pack_id',
    shorts_packs: 'shorts_pack_id',
    story_plans: 'story_plan_id',
    publishing_packets: 'publishing_packet_id',
    analytics_snapshots: 'analytics_snapshot_id',
    weekly_cycles: 'week_id',
    agent_executions: 'execution_id',
    prompt_templates: 'template_id',
    system_logs: 'log_id',
    recommendations: 'recommendation_id',
  };
  return map[collection] || 'id';
}

// === SYSTEM LOG HELPER ===

export function logEvent(
  event_type: string,
  entity_type: string,
  entity_id: string,
  details: Record<string, unknown> = {}
) {
  const log = {
    log_id: generateId(),
    event_type,
    entity_type,
    entity_id,
    details,
    timestamp: new Date().toISOString(),
  };
  create('system_logs', log);
  return log;
}

// === INITIALIZATION ===

export function initializeDataStore() {
  const collections = [
    'episodes', 'stories', 'research', 'scripts',
    'metadata_packs', 'thumbnail_packs', 'shorts_packs',
    'story_plans', 'publishing_packets', 'analytics_snapshots',
    'weekly_cycles', 'agent_executions', 'prompt_templates',
    'system_logs', 'recommendations',
  ];
  collections.forEach(c => ensureDir(path.join(DATA_DIR, c)));
}
