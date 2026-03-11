import { NextRequest, NextResponse } from 'next/server';
import {
  generateScript,
  generateMetadata,
  generateThumbnail,
  generateShorts,
  extractStory,
  suggestResearch,
  generateStoryPlan,
  generateWeeklyStrategy,
  assessStudio,
} from '@/lib/ai';
import {
  getEpisode,
  getStory,
  getReference,
  getLatestScript,
  listEpisodes,
  listStories,
  getCurrentWeek,
  createScript,
  createMetadataPack,
  createThumbnailPack,
  createShortsPack,
  createStoryPlan,
  createStory,
  createReference,
  logExecution,
  transitionEpisode,
} from '@/lib/db';
import type { AgentName } from '@/lib/ai';

type GenerateAction =
  | 'generate_script'
  | 'generate_metadata'
  | 'generate_thumbnail'
  | 'generate_shorts'
  | 'extract_story'
  | 'suggest_research'
  | 'generate_story_plan'
  | 'generate_weekly_strategy'
  | 'assess_studio';

const ACTION_AGENT_MAP: Record<GenerateAction, AgentName> = {
  generate_script: 'Script Architect',
  generate_metadata: 'Metadata Director',
  generate_thumbnail: 'Thumbnail Director',
  generate_shorts: 'Reelsmith',
  extract_story: 'Story Miner',
  suggest_research: 'Research Librarian',
  generate_story_plan: 'Instagram Story Agent',
  generate_weekly_strategy: 'Strategy Director',
  assess_studio: 'Studio Manager',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, episode_id, raw_input } = body as {
      action: GenerateAction;
      episode_id?: string;
      raw_input?: string;
    };

    if (!action || !ACTION_AGENT_MAP[action]) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const agentName = ACTION_AGENT_MAP[action];
    const executionStart = new Date().toISOString();

    // Log execution start
    const execution = logExecution({
      agent_name: agentName,
      prompt_version: 'v1',
      input_payload: body,
      output_payload: {},
      status: 'Running',
      episode_id: episode_id || undefined,
      started_at: executionStart,
    });

    try {
      let result: unknown;

      switch (action) {
        case 'generate_script': {
          if (!episode_id) return NextResponse.json({ error: 'episode_id required' }, { status: 400 });
          const episode = getEpisode(episode_id);
          if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
          const story = episode.primary_story_id ? getStory(episode.primary_story_id) : null;
          const research = episode.primary_reference_id ? getReference(episode.primary_reference_id) : null;
          const generated = await generateScript(episode, story, research);

          // Save script to DB
          const script = createScript({
            episode_id,
            version: 1,
            title_candidate: generated.title_candidate,
            core_thesis: generated.core_thesis,
            artifact: generated.artifact,
            labyrinth: generated.labyrinth,
            twist: generated.twist,
            echo: generated.echo,
            full_script: generated.full_script,
            highlight_lines: generated.highlight_lines,
            approval_state: 'Pending',
            created_by_agent: 'Script Architect',
          });

          // Auto-transition episode to Script Drafted if possible
          try { transitionEpisode(episode_id, 'Script Drafted'); } catch {}

          result = { script, generated };
          break;
        }

        case 'generate_metadata': {
          if (!episode_id) return NextResponse.json({ error: 'episode_id required' }, { status: 400 });
          const episode = getEpisode(episode_id);
          if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
          const script = getLatestScript(episode_id);
          const generated = await generateMetadata(episode, script);

          const pack = createMetadataPack({
            episode_id,
            title_options: generated.title_options,
            recommended_title: generated.recommended_title,
            description: generated.description,
            pinned_comment: generated.pinned_comment,
            yt_shorts_caption: generated.yt_shorts_caption,
            ig_reel_caption: generated.ig_reel_caption,
            ig_story_copy_options: generated.ig_story_copy_options,
          });

          result = { pack, generated };
          break;
        }

        case 'generate_thumbnail': {
          if (!episode_id) return NextResponse.json({ error: 'episode_id required' }, { status: 400 });
          const episode = getEpisode(episode_id);
          if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
          const script = getLatestScript(episode_id);
          const generated = await generateThumbnail(episode, script);

          const pack = createThumbnailPack({
            episode_id,
            concept_a: generated.concept_a,
            concept_b: generated.concept_b,
            text_options: generated.text_options,
            nano_banana_prompt_a: generated.nano_banana_prompt_a,
            nano_banana_prompt_b: generated.nano_banana_prompt_b,
          });

          result = { pack, generated };
          break;
        }

        case 'generate_shorts': {
          if (!episode_id) return NextResponse.json({ error: 'episode_id required' }, { status: 400 });
          const episode = getEpisode(episode_id);
          if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
          const script = getLatestScript(episode_id);
          if (!script) return NextResponse.json({ error: 'No script found — generate a script first' }, { status: 400 });
          const generated = await generateShorts(episode, script);

          const pack = createShortsPack({
            episode_id,
            clips: generated.clips.map((c, i) => ({
              clip_id: `clip-${i + 1}`,
              hook: c.hook,
              script: c.script,
              platform: c.platform as 'YouTube' | 'Instagram',
            })),
            status: 'Draft',
          });

          result = { pack, generated };
          break;
        }

        case 'extract_story': {
          if (!raw_input) return NextResponse.json({ error: 'raw_input required' }, { status: 400 });
          const generated = await extractStory(raw_input);

          const story = createStory({
            title: generated.title,
            era: generated.era as any,
            story_type: generated.story_type,
            raw_event_summary: generated.raw_event_summary,
            sensory_details: generated.sensory_details,
            emotional_truth: generated.emotional_truth,
            philosophical_lesson: generated.philosophical_lesson,
            related_pillars: generated.related_pillars as any[],
            confidence_level: generated.confidence_level as any,
            tags: generated.tags,
            intake_state: 'Extracted',
            permission_level: 'Internal Only',
            source: 'AI Extraction',
          });

          result = { story, generated };
          break;
        }

        case 'suggest_research': {
          if (!episode_id) return NextResponse.json({ error: 'episode_id required' }, { status: 400 });
          const episode = getEpisode(episode_id);
          if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
          const story = episode.primary_story_id ? getStory(episode.primary_story_id) : null;
          const suggestions = await suggestResearch(episode, story);

          // Save each suggestion as a reference
          const references = suggestions.map(s =>
            createReference({
              title: s.title,
              reference_type: s.reference_type as any,
              domain: s.domain,
              core_summary: s.core_summary,
              primary_lesson: s.primary_lesson,
              why_it_fits: s.why_it_fits,
              risk_note: s.risk_note,
              source_quality: s.source_quality as any,
              overuse_risk: s.overuse_risk as any,
              tags: s.tags,
              approved_status: false,
            })
          );

          result = { references, suggestions };
          break;
        }

        case 'generate_story_plan': {
          if (!episode_id) return NextResponse.json({ error: 'episode_id required' }, { status: 400 });
          const episode = getEpisode(episode_id);
          if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
          const script = getLatestScript(episode_id);
          const generated = await generateStoryPlan(episode, script);

          const plan = createStoryPlan({
            date: new Date().toISOString().split('T')[0],
            objective: generated.objective,
            frames: generated.frames.map(f => ({
              frame_id: `frame-${f.order}`,
              ...f,
            })),
            linked_episode_id: episode_id,
            interactive_elements: generated.interactive_elements,
            status: 'Draft',
          });

          result = { plan, generated };
          break;
        }

        case 'generate_weekly_strategy': {
          const stories = listStories();
          const episodes = listEpisodes();
          const generated = await generateWeeklyStrategy(stories, episodes);
          result = { generated };
          break;
        }

        case 'assess_studio': {
          const episodes = listEpisodes();
          const week = getCurrentWeek();
          const generated = await assessStudio(episodes, week);
          result = { generated };
          break;
        }
      }

      // Update execution as success
      logExecution({
        ...execution,
        output_payload: result,
        status: 'Success',
        completed_at: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, agent: agentName, result });
    } catch (aiError: any) {
      // Update execution as failed
      logExecution({
        ...execution,
        status: 'Failed',
        error_message: aiError.message,
        completed_at: new Date().toISOString(),
      });
      throw aiError;
    }
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 },
    );
  }
}
