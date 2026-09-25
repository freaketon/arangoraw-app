// ============================================================
// ArangoRAW - Brand Positioning & Content Pillars
// Source of truth: content-pillars.md and voice-profile.md
// ============================================================

export const BRAND_TAGLINE = 'Real stories. Wild comebacks. Your turn.';
export const BRAND_MISSION = 'Be the founder of your own life.';
export const BRAND_ROLES = 'Serial entrepreneur. Creative director. Storyteller.';
export const BRAND_LINE = `ArangoRAW, the media brand of Alejandro Arango (${BRAND_ROLES}). ${BRAND_TAGLINE} ${BRAND_MISSION}`;

export const PILLARS = [
  'Real Stories, Wild Comebacks',
  'Your Turn',
  'In Motion',
] as const;

export type Pillar = (typeof PILLARS)[number];

export const DEFAULT_PILLAR: Pillar = 'Real Stories, Wild Comebacks';

export const PILLAR_DESCRIPTIONS: Record<Pillar, string> = {
  'Real Stories, Wild Comebacks':
    "True stories told fast and visual like movie scenes. Alejandro's own life (book and story library) plus researched stories of role models and other people's comebacks, always paired with a moment from his life. Cold audience. Drives audience growth, book readers and keynote material.",
  'Your Turn':
    'Alejandro teaching the creative, unusual ways he rebuilds himself and his life, always grounded in something he actually did. Each piece hands the viewer one thing to try. Warm audience. Drives community members.',
  'In Motion':
    'Alejandro building right now, Casey Neistat style: talks, the book in progress, videos made alone with AI. Live proof, never self-labels. Drives speaking gigs and community trust.',
};

// Old pillars from the 2026 app and Reels Strategy, mapped to the new three.
const LEGACY_PILLAR_MAP: Record<string, Pillar> = {
  'psychology of chaos': 'Your Turn',
  'media intelligence': 'Your Turn',
  'identity shift': 'Your Turn',
  'physics of business': 'Your Turn',
  'the survivor': 'Real Stories, Wild Comebacks',
  'external mirrors': 'Real Stories, Wild Comebacks',
  'identity & reinvention': 'Your Turn',
  'story as power': 'Real Stories, Wild Comebacks',
  'operator leverage': 'Your Turn',
  'anti-generic growth': 'Your Turn',
};

/** Resolve any stored or AI-returned pillar string to one of the current pillars. */
export function normalizePillar(raw: string | null | undefined): Pillar {
  const key = (raw || '').trim().toLowerCase();
  const current = PILLARS.find(p => p.toLowerCase() === key);
  if (current) return current;
  return LEGACY_PILLAR_MAP[key] || DEFAULT_PILLAR;
}

export const VOICE_RULES = `VOICE (Alejandro Arango):
- Scene first. Open inside a moment: a person, a place, a plain detail that makes the viewer want to know what happens next. No setup paragraphs.
- Fast. One beat per idea, then move. Short hits between long spoken run-ons. High density.
- Fun and energetic, with dark, deadpan humor about wild or brutal events. Profanity is fine when the story has it.
- The lesson comes out of the story in one line at the end, or as a dry aside. Never a spelled-out moral.
- Never call Alejandro a force of nature, game changer or similar. Show it.
- Never introduce him by nationality or city.
- Never use em dashes, contrast framing ("It's not X. It's Y."), rule-of-three lists, rhetorical questions answered right away, or guru-coach bait ("100 ways to make a million").
- No corporate words: leverage, unlock, empower, journey, synergy, "excited to share".`;
