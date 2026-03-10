// ============================================================
// ArangoRAW â Research Library Data Operations
// ============================================================

import { ResearchReference, ReferenceType, SourceQuality, OveruseRisk } from '@/lib/types';
import { create, read, update, list, query, generateId, logEvent, search } from './store';

const COLLECTION = 'research';

export function createReference(data: {
  title: string;
  reference_type: ReferenceType;
  domain: string;
  core_summary: string;
  primary_lesson: string;
  why_it_fits: string;
  risk_note: string;
  source_quality: SourceQuality;
  overuse_risk: OveruseRisk;
  tags: string[];
}): ResearchReference {
  const now = new Date().toISOString();
  const ref: ResearchReference = {
    reference_id: generateId(),
    ...data,
    last_used_date: null,
    approved_status: false,
    created_at: now,
    updated_at: now,
  };
  create(COLLECTION, ref);
  return ref;
}

export function getReference(id: string): ResearchReference | null {
  return read<ResearchReference>(COLLECTION, id);
}

export function listReferences(): ResearchReference[] {
  return list<ResearchReference>(COLLECTION);
}

export function searchReferences(term: string): ResearchReference[] {
  return search<ResearchReference>(COLLECTION, [
    'title', 'core_summary', 'primary_lesson', 'why_it_fits', 'domain', 'tags',
  ], term);
}

export function filterReferences(filters: {
  reference_type?: ReferenceType;
  source_quality?: SourceQuality;
  max_overuse_risk?: OveruseRisk;
  tags?: string[];
  approved_only?: boolean;
  not_used_since?: string;
}): ResearchReference[] {
  const riskOrder: OveruseRisk[] = ['Low', 'Medium', 'High'];
  return query<ResearchReference>(COLLECTION, ref => {
    if (filters.reference_type && ref.reference_type !== filters.reference_type) return false;
    if (filters.source_quality && ref.source_quality !== filters.source_quality) return false;
    if (filters.max_overuse_risk) {
      const maxIdx = riskOrder.indexOf(filters.max_overuse_risk);
      const refIdx = riskOrder.indexOf(ref.overuse_risk);
      if (refIdx > maxIdx) return false;
    }
    if (filters.tags && !filters.tags.some(t => ref.tags.includes(t))) return false;
    if (filters.approved_only && !ref.approved_status) return false;
    if (filters.not_used_since && ref.last_used_date && ref.last_used_date > filters.not_used_since) return false;
    return true;
  });
}

export function markReferenceUsed(id: string): ResearchReference | null {
  return update<ResearchReference>(COLLECTION, id, { last_used_date: new Date().toISOString() } as Partial<ResearchReference>);
}

export function approveReference(id: string): ResearchReference | null {
  return update<ResearchReference>(COLLECTION, id, { approved_status: true } as Partial<ResearchReference>);
}

export function updateReference(id: string, updates: Partial<ResearchReference>): ResearchReference | null {
  return update<ResearchReference>(COLLECTION, id, updates);
}
