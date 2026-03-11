// ============================================================
// ArangoRAW - Shared Type Definitions
// ============================================================

// --- Enums / Union Types ---

export type Pillar =
  | 'Psychology of Chaos'
  | 'Media Intelligence'
  | 'Identity Shift'
  | 'Physics of Business'
  | 'The Survivor'
  | 'External Mirrors';

export type EpisodeState =
  | 'Idea'
  | 'Selected'
  | 'Story Matched'
  | 'Research Matched'
  | 'Script Drafted'
  | 'Script Reviewed'
  | 'Script Approved'
  | 'Packaging'
  | 'Package Review'
  | 'Final Review'
  | 'Scheduled'
  | 'Published'
  | 'Archived';

export type ApprovalState =
  | 'Pending'
  | 'Pending Review'
  | 'Approved'
  | 'Rejected'
  | 'Revision Requested';

export type AgentName =
  | 'Strategy Director'
  | 'Story Miner'
  | 'Research Librarian'
  | 'Script Architect'
  | 'Metadata Director'
  | 'Thumbnail Director'
  | 'Reelsmith'
  | 'Instagram Story Agent'
  | 'Studio Manager'
  | 'Performance Analyst';

export type ReferenceType =
  | 'Book'
  | 'Article'
  | 'Documentary'
  | 'Podcast'
  | 'Case Study'
  | 'Academic Paper'
  | 'Interview'
  | 'Other';

export type SourceQuality = 'Primary' | 'Secondary' | 'Tertiary';

export type OveruseRisk = 'Low' | 'Medium' | 'High';

export type WeeklyCycleState =
  | 'Planning'
  | 'In Progress'
  | 'Review'
  | 'Complete'
  | 'Archived';

export type Platform = 'YouTube' | 'Instagram' | 'TikTok' | 'X' | 'LinkedIn';

// --- Interfaces ---

export interface Episode {
  episode_id: string;
  working_title: string;
  final_title: string | null;
  pillar: Pillar;
  core_thesis: string;
  mental_model: string;
  week_id: string | null;
  state: EpisodeState;
  primary_story_id: string | null;
  primary_reference_id: string | null;
  script_id: string | null;
  metadata_pack_id: string | null;
  thumbnail_pack_id: string | null;
  shorts_pack_id: string | null;
  publishing_packet_id: string | null;
  analytics_snapshot_ids: string[];
  approval_state: ApprovalState;
  created_at: string;
  updated_at: string;
}

export interface Script {
  script_id: string;
  episode_id: string;
  title_candidate: string;
  core_thesis: string;
  artifact: string;
  labyrinth: string;
  twist: string;
  echo: string;
  full_script: string;
  highlight_lines: string[];
  version: number;
  approval_state: ApprovalState;
  created_by_agent: AgentName | 'Human';
  created_at: string;
  revised_at: string | null;
}

export interface ResearchReference {
  reference_id: string;
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
  last_used_date: string | null;
  approved_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklyStoryTheme {
  episode_id: string;
  theme: string;
  pillar: Pillar;
}

export interface WeeklyCycle {
  week_id: string;
  week_theme: string;
  start_date: string;
  end_date: string;
  episode_ids: string[];
  story_theme_map: WeeklyStoryTheme[];
  planning_state: WeeklyCycleState;
  created_at: string;
  updated_at: string;
}

export interface MetadataPack {
  metadata_pack_id: string;
  episode_id: string;
  title_options: string[];
  recommended_title: string;
  description: string;
  pinned_comment: string;
  yt_shorts_caption: string;
  ig_reel_caption: string;
  ig_story_copy_options: string[];
  created_at: string;
  updated_at: string;
}

export interface ThumbnailPack {
  thumbnail_pack_id: string;
  episode_id: string;
  concept_a: string;
  concept_b: string;
  text_options: string[];
  nano_banana_prompt_a: string;
  nano_banana_prompt_b: string;
  created_at: string;
  updated_at: string;
}

export interface ShortClip {
  clip_id: string;
  hook: string;
  script: string;
  platform: 'YouTube' | 'Instagram';
}

export interface PlatformRecommendation {
  platform: Platform;
  recommended_length: string;
  aspect_ratio: string;
  notes: string;
}

export interface ShortsPack {
  shorts_pack_id: string;
  episode_id: string;
  clips: ShortClip[];
  captions: string[];
  platform_recommendations: PlatformRecommendation[];
  status: 'Draft' | 'Ready' | 'Published';
  created_at: string;
  updated_at: string;
}

export interface StoryFrame {
  frame_id: string;
  order: number;
  visual: string;
  copy: string;
  cta: string;
}

export interface StoryPlan {
  story_plan_id: string;
  date: string;
  objective: string;
  frames: StoryFrame[];
  linked_episode_id: string | null;
  interactive_elements: string[];
  status: 'Draft' | 'Ready' | 'Published';
  created_at: string;
  updated_at: string;
}

export interface PublishingPacket {
  publishing_packet_id: string;
  episode_id: string;
  final_title: string;
  final_script: string;
  description: string;
  pinned_comment: string;
  thumbnail_selection: string;
  shorts_assets: string[];
  story_assets: string[];
  approval_state: ApprovalState;
  ready_for_publish: boolean;
  publishing_notes: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSnapshot {
  analytics_snapshot_id: string;
  platform: Platform;
  content_id: string;
  episode_id: string | null;
  date_captured: string;
  snapshot_window: '1h' | '24h' | '72h' | '7d' | '30d';
  views: number;
  ctr: number;
  watch_time: number;
  avg_view_duration: number;
  subscribers_gained: number;
  saves: number;
  shares: number;
  profile_visits: number;
  story_completion: number | null;
  qualitative_notes: string;
  created_at: string;
}

export interface AgentExecution {
  execution_id: string;
  agent_name: AgentName;
  episode_id: string | null;
  week_id: string | null;
  prompt_version: string;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown> | null;
  critique_payload: Record<string, unknown> | null;
  retry_count: number;
  status: 'Running' | 'Success' | 'Failed' | 'Retrying';
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface PromptTemplate {
  template_id: string;
  agent_name: AgentName;
  version: string;
  system_prompt: string;
  task_prompt: string;
  output_schema: Record<string, unknown>;
  retry_prompt: string;
  critique_prompt: string;
  created_at: string;
}

export interface Recommendation {
  recommendation_id: string;
  week_id: string | null;
  episode_id: string | null;
  category: 'topic' | 'story' | 'reference' | 'hook' | 'thumbnail' | 'title' | 'pacing' | 'story_cadence';
  recommendation: string;
  evidence_source: string;
  confidence: number;
  created_at: string;
}
