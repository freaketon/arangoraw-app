import { generateJSON } from './client';
import { SYSTEM_PROMPTS, AgentName } from './prompts';
import type {
  Episode,
  StoryRecord,
  ResearchReference,
  Script,
  MetadataPack,
  ThumbnailPack,
  ShortsPack,
  StoryPlan,
  WeeklyCycle,
} from '@/lib/types';

// ─── Helpers ───

function agentPrompt(agent: AgentName, task: string) {
  return { systemPrompt: SYSTEM_PROMPTS[agent], taskPrompt: task };
}

// ─── Script Generation ───

export interface GeneratedScript {
  title_candidate: string;
  core_thesis: string;
  artifact: string;
  labyrinth: string;
  twist: string;
  echo: string;
  full_script: string;
  highlight_lines: string[];
}

export async function generateScript(
  episode: Episode,
  story?: StoryRecord | null,
  research?: ResearchReference | null,
): Promise<GeneratedScript> {
  const task = `Generate a full script for this episode using the Julian Loop structure.

EPISODE:
- Title: ${episode.working_title}
- Pillar: ${episode.pillar}
- Core Thesis: ${episode.core_thesis || 'Not yet defined — you define it'}
- Mental Model: ${episode.mental_model || 'None specified'}
- Angle: ${episode.angle || 'None specified'}

${story ? `PERSONAL STORY:
- Title: ${story.title}
- Era: ${story.era}
- Raw Event: ${story.raw_event_summary}
- Sensory Details: ${story.sensory_details}
- Emotional Truth: ${story.emotional_truth}
- Philosophical Lesson: ${story.philosophical_lesson}` : 'No story attached — create a compelling narrative arc using the thesis alone.'}

${research ? `RESEARCH REFERENCE:
- Title: ${research.title}
- Domain: ${research.domain}
- Core Summary: ${research.core_summary}
- Primary Lesson: ${research.primary_lesson}
- Why It Fits: ${research.why_it_fits}` : 'No research attached — draw from your knowledge to support the thesis.'}

Return JSON with: title_candidate, core_thesis, artifact, labyrinth, twist, echo, full_script (complete script combining all 4 parts with natural transitions), highlight_lines (array of 3-5 most powerful lines from the script).`;

  return generateJSON<GeneratedScript>({ ...agentPrompt('Script Architect', task), maxTokens: 8192 });
}

// ─── Metadata Generation ───

export interface GeneratedMetadata {
  title_options: string[];
  recommended_title: string;
  description: string;
  pinned_comment: string;
  yt_shorts_caption: string;
  ig_reel_caption: string;
  ig_story_copy_options: string[];
}

export async function generateMetadata(
  episode: Episode,
  script?: Script | null,
): Promise<GeneratedMetadata> {
  const task = `Generate full metadata for this episode.

EPISODE:
- Title: ${episode.working_title}
- Pillar: ${episode.pillar}
- Core Thesis: ${episode.core_thesis || 'See script'}

${script ? `SCRIPT:
- Title Candidate: ${script.title_candidate}
- Core Thesis: ${script.core_thesis}
- Highlight Lines: ${script.highlight_lines?.join(' | ') || 'None'}
- Full Script (first 500 chars): ${script.full_script?.slice(0, 500) || 'No script'}` : 'No script available — work from the episode info.'}

Return JSON with: title_options (3-5 YouTube-optimized titles), recommended_title, description (YouTube description with section markers), pinned_comment, yt_shorts_caption, ig_reel_caption, ig_story_copy_options (3 options).`;

  return generateJSON<GeneratedMetadata>(agentPrompt('Metadata Director', task));
}

// ─── Thumbnail Generation ───

export interface GeneratedThumbnail {
  concept_a: string;
  concept_b: string;
  text_options: string[];
  nano_banana_prompt_a: string;
  nano_banana_prompt_b: string;
}

export async function generateThumbnail(
  episode: Episode,
  script?: Script | null,
): Promise<GeneratedThumbnail> {
  const task = `Create 2 thumbnail concepts for this episode.

EPISODE:
- Title: ${episode.working_title}
- Pillar: ${episode.pillar}
- Core Thesis: ${episode.core_thesis || 'See script'}

${script ? `SCRIPT HIGHLIGHTS: ${script.highlight_lines?.join(' | ') || script.title_candidate}` : ''}

Return JSON with: concept_a (visual description), concept_b (visual description), text_options (array of 3-4 overlay text options, max 5 words each), nano_banana_prompt_a (AI image generation prompt for concept A), nano_banana_prompt_b (AI image generation prompt for concept B).`;

  return generateJSON<GeneratedThumbnail>(agentPrompt('Thumbnail Director', task));
}

// ─── Shorts/Reels Generation ───

export interface GeneratedShorts {
  clips: Array<{
    hook: string;
    script: string;
    platform: string;
    caption: string;
  }>;
}

export async function generateShorts(
  episode: Episode,
  script: Script,
): Promise<GeneratedShorts> {
  const task = `Extract 3-5 short-form clips from this script for YouTube Shorts and Instagram Reels.

EPISODE:
- Title: ${episode.working_title}
- Pillar: ${episode.pillar}

FULL SCRIPT:
${script.full_script}

For each clip return: hook (first 1-2 sentences that grab attention), script (the full clip script, 30-60 seconds of spoken content), platform (YouTube or Instagram), caption (platform-optimized caption).

Return JSON with: clips (array of clip objects).`;

  return generateJSON<GeneratedShorts>({ ...agentPrompt('Reelsmith', task), maxTokens: 6144 });
}

// ─── Story Extraction ───

export interface GeneratedStory {
  title: string;
  era: string;
  story_type: string;
  raw_event_summary: string;
  sensory_details: string;
  emotional_truth: string;
  philosophical_lesson: string;
  related_pillars: string[];
  confidence_level: number;
  tags: string[];
}

export async function extractStory(rawInput: string): Promise<GeneratedStory> {
  const task = `Extract a structured story from this raw input. The input is from Alejandro Arango — a founder who has been through extreme life experiences.

RAW INPUT:
${rawInput}

Return JSON with: title, era (one of: Childhood, Adolescence, Early Career, Business Building, Crisis, Reinvention, Present), story_type, raw_event_summary, sensory_details, emotional_truth, philosophical_lesson, related_pillars (array from: Psychology of Chaos, Media Intelligence, Identity Shift, Physics of Business, The Survivor, External Mirrors), confidence_level (1-5), tags (array of keywords).`;

  return generateJSON<GeneratedStory>(agentPrompt('Story Miner', task));
}

// ─── Research Suggestion ───

export interface GeneratedResearch {
  title: string;
  reference_type: string;
  domain: string;
  core_summary: string;
  primary_lesson: string;
  why_it_fits: string;
  risk_note: string;
  source_quality: string;
  overuse_risk: string;
  tags: string[];
}

export async function suggestResearch(
  episode: Episode,
  story?: StoryRecord | null,
): Promise<GeneratedResearch[]> {
  const task = `Suggest 2-3 research references that would strengthen this episode.

EPISODE:
- Title: ${episode.working_title}
- Pillar: ${episode.pillar}
- Core Thesis: ${episode.core_thesis || 'Not yet defined'}

${story ? `STORY: ${story.title} — ${story.philosophical_lesson}` : ''}

For each reference return: title, reference_type (one of: history, founder, company, philosophy, war, science, culture), domain, core_summary, primary_lesson, why_it_fits, risk_note, source_quality (Strong/Moderate/Weak/Unverified), overuse_risk (Low/Medium/High), tags (array).

Return JSON as an array of reference objects.`;

  return generateJSON<GeneratedResearch[]>(agentPrompt('Research Librarian', task));
}

// ─── Story Plan (Instagram Stories) ───

export interface GeneratedStoryPlan {
  objective: string;
  frames: Array<{
    order: number;
    type: string;
    content: string;
    visual_direction: string;
  }>;
  interactive_elements: string[];
}

export async function generateStoryPlan(
  episode: Episode,
  script?: Script | null,
): Promise<GeneratedStoryPlan> {
  const task = `Create an Instagram Story sequence to promote this episode.

EPISODE:
- Title: ${episode.working_title}
- Pillar: ${episode.pillar}

${script ? `KEY LINES: ${script.highlight_lines?.join(' | ') || script.title_candidate}` : ''}

Return JSON with: objective, frames (array of: order, type [text/image/video/poll/question/countdown/quiz], content, visual_direction), interactive_elements (array of engagement prompts).`;

  return generateJSON<GeneratedStoryPlan>(agentPrompt('Instagram Story Agent', task));
}

// ─── Weekly Strategy ───

export interface WeeklyStrategy {
  week_theme: string;
  episode_recommendations: Array<{
    working_title: string;
    pillar: string;
    core_thesis: string;
    day_suggestion: string;
    reasoning: string;
  }>;
  story_theme_map: Array<{
    day: string;
    theme: string;
  }>;
}

export async function generateWeeklyStrategy(
  existingStories: StoryRecord[],
  existingEpisodes: Episode[],
  recentPerformance?: string,
): Promise<WeeklyStrategy> {
  const storyList = existingStories.slice(0, 10).map(s => `- ${s.title} (${s.era}, ${s.related_pillars?.join(', ')})`).join('\n');
  const recentEps = existingEpisodes.slice(0, 5).map(e => `- ${e.working_title} (${e.pillar}, ${e.state})`).join('\n');

  const task = `Plan the next weekly content cycle for ArangoRAW.

AVAILABLE STORIES:
${storyList || 'No stories yet — suggest episode ideas from scratch.'}

RECENT EPISODES:
${recentEps || 'No episodes yet — this is the first week.'}

${recentPerformance ? `RECENT PERFORMANCE:\n${recentPerformance}` : ''}

Plan 3-5 episodes for the week. Balance pillars. Create a narrative arc across the week.

Return JSON with: week_theme, episode_recommendations (array of: working_title, pillar, core_thesis, day_suggestion, reasoning), story_theme_map (array of: day, theme — for daily Instagram story themes).`;

  return generateJSON<WeeklyStrategy>(agentPrompt('Strategy Director', task));
}

// ─── Studio Manager Assessment ───

export interface StudioAssessment {
  summary: string;
  blocked_items: Array<{ episode: string; issue: string; recommendation: string }>;
  next_actions: Array<{ priority: number; action: string; episode: string }>;
  weekly_health: string;
}

export async function assessStudio(
  episodes: Episode[],
  currentWeek?: WeeklyCycle | null,
): Promise<StudioAssessment> {
  const epList = episodes.map(e => `- ${e.working_title} | State: ${e.state} | Approval: ${e.approval_state}`).join('\n');

  const task = `Assess the current production pipeline and recommend next actions.

ACTIVE EPISODES:
${epList || 'No active episodes.'}

${currentWeek ? `CURRENT WEEK: ${currentWeek.week_theme} (${currentWeek.planning_state})` : 'No active week.'}

Return JSON with: summary (2-3 sentence overview), blocked_items (array of: episode, issue, recommendation), next_actions (array of: priority 1-5, action, episode), weekly_health (one of: On Track, At Risk, Behind, Critical).`;

  return generateJSON<StudioAssessment>(agentPrompt('Studio Manager', task));
}
