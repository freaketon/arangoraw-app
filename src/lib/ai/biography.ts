// ─── Biography Context for ArangoRAW ───
// Prevents AI fabrication by providing real biographical facts
// and listing all available stories from the database.

export const BIOGRAPHY_CONTEXT = `
ALEJANDRO ARANGO — BIOGRAPHICAL CONTEXT
========================================

KNOWN FACTS:
- Colombian founder and entrepreneur
- At 19: quit a corporate internship with only $200 to start a company — everyone called him crazy
- 2008: Met Laura (major life milestone)
- Has daughters
- Went through "contento years" (media/content company era)
- Entered the startup tech world
- Experience with AI and blockchain
- Survived near-death experiences
- Navigated business crises and reinvention
- Philosophical thinker sharing hard-won wisdom with founders
- Brand: ArangoRAW — philosophical media for founders

ERAS THAT NEED MORE STORIES FROM ALEJANDRO:
(These are gaps — do NOT fill them with invented stories)
- Details of the $200 company journey beyond the initial decision
- The "contento years" — specific projects, lessons, transitions
- Blockchain and AI moments — specific incidents, learnings
- Near-death experiences — nature, circumstances
- Major business crises and how they were resolved
- Family milestones beyond meeting Laura
- Current chapter and recent wisdom

CRITICAL INSTRUCTIONS:
=====================
DO NOT invent personal stories or anecdotes about Alejandro.
DO NOT create "realistic-sounding" details that aren't confirmed.
DO NOT fill gaps with plausible fiction.
ONLY reference stories listed in the AVAILABLE STORIES section below.
If no story fits, build around thesis, research, and universal truths.
`;

export interface BiographyStory {
  title: string;
  era?: string;
  narrative?: string;
  hook?: string;
  pillar?: string;
  tags?: string[];
}

export function buildStoryContext(stories: BiographyStory[]): string {
  if (!stories || stories.length === 0) {
    return `\nAVAILABLE STORIES: None in database.\n-> Build scripts around thesis, research, and universal principles.\n-> Do NOT invent personal anecdotes about Alejandro.\n`;
  }

  const list = stories
    .map((s, i) => `${i + 1}. "${s.title}"${s.era ? ` (${s.era})` : ''}${s.pillar ? ` [${s.pillar}]` : ''}\n   ${s.narrative || s.hook || '(no details)'}`)
    .join('\n');

  return `\nAVAILABLE STORIES (${stories.length} total):\n${list}\n\nUSAGE RULES:\n- Only reference stories listed above\n- Use details faithfully — don't embellish with made-up context\n- If no story matches the episode theme, build around thesis and research\n- Never invent new stories or add fictional details\n`;
}

export function getFullContext(stories: BiographyStory[]): string {
  return BIOGRAPHY_CONTEXT + buildStoryContext(stories);
}
