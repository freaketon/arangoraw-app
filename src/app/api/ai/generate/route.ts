import { NextRequest, NextResponse } from 'next/server';
import {
  generateScript,
  rewriteScriptSection,
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
  getScript,
  getLatestScript,
  listEpisodes,
  listStories,
  getCurrentWeek,
  createScript,
  updateScript,
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
    const { action, episode_id, raw_input, rewrite_section, script_id } = body as {
      action: GenerateAction;
      episode_id?: string;
      raw_input?: string;
      rewrite_section?: 'artifact' | 'labyrinth' | 'twist' | 'echo';
      script_id?: string;
    };

    if (!action || !ACTION_AGENT_MAP[action]) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const agentName = ACTION_AGENT_MAP[action];

    try {
      let result: unknown;

      switch (action) {
        case 'generate_script': {
          if (!episode_id) return NextResponse.json({ error: 'episode_id required' }, { status: 400 });
          const episode = getEpisode(episode_id);
          if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
          const story = episode.primary_story_id ? getStory(episode.primary_story_id) : null;
          const research = episode.primary_reference_id ? getReference(episode.primary_reference_id) : null;

          // Targeted section rewrite (Observation 1 fix)
          if (rewrite_section && script_id) {
            const existing = getScript(script_id);
            if (!existing) return NextResponse.json({ error: 'Script not found' }, { status: 404 });

            const newText = await rewriteScriptSection(
              rewrite_section,
              {
                artifact: existing.artifact,
                labyrinth: existing.labyrinth,
                twist: existing.twist,
                echo: existing.echo,
                title_candidate: existing.title_candidate,
                core_thesis: existing.core_thesis,
              },
              episode,
              story,
              research,
            );

            // Rebuild full_script with the rewritten section
            const sections = { ...existing, [rewrite_section]: newText };
            const fullScript = [sections.artifact, sections.labyrinth, sections.twist, sections.echo]
              .filter(Boolean)
              .join('\n\n');

            const updated = updateScript(script_id, {
              [rewrite_section]: newText,
              full_script: fullScript,
            });

            result = { script: updated, rewritten_section: rewrite_section };
            break;
          }

          // Full script generation (original behavior)
          const generated = await generateScript(episode, story, research);

          // Save script to DB (version and approval_state are auto-set internally)
          const script = createScript({
            episode_id,
            title_candidate: generated.title_candidate,
            core_thesis: generated.core_thesis,
            artifact: generated.artifact,
            labyrinth: generated.labyrinth,
            twist: generated.twist,
            echo: generated.echo,
            full_script: generated.full_script,
            highlight_lines: generated.highlight_lines,
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
            clips: generated.clips.map((c: { hook: string; script: string; platform: string }, i: number) => ({
              clip_id: `clip-${i + 1}`,
              hook: c.hook,
              script: c.script,
              platform: c.platform as 'YouTube' | 'Instagram',
            })),
            captions: generated.captions || [],
            platform_recommendations: generated.platform_recommendations || [],
            status: 'Draft',
          });

          result = { pack, generated };
          break;
        }

        case 'extract_story': {
          if (!raw_input) return NextResponse.json({ error: 'raw_input required' }, { status: 400 });
          const generated = await extractStory(raw_input);

          // Map AI output to Story interface fields
          const story = createStory({
            title: generated.title,
            hook: generated.emotional_truth || generated.raw_event_summary || '',
            narrative: generated.raw_event_summary || '',
            pillar: generated.related_pillars?.[0] || 'Psychology of Chaos',
            era: generated.era || '',
            tags: generated.tags || [],
            state: 'intake',
            publishable: false,
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

          // Save each suggestion (approved_status is set internally to false)
          const references = suggestions.map((s: Record<string, unknown>) =>
            createReference({
              title: s.title as string,
              reference_type: s.reference_type as string as any,
              domain: s.domain as string,
              core_summary: s.core_summary as string,
              primary_lesson: s.primary_lesson as string,
              why_it_fits: s.why_it_fits as string,
              risk_note: s.risk_note as string,
              source_quality: s.source_quality as string as any,
              overuse_risk: s.overuse_risk as string as any,
              tags: s.tags as string[],
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
            frames: generated.frames.map((f: Record<string, unknown>) => ({
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

      // Log execution as success (single log, no spread)
      logExecution({
        agent_name: agentName,
        prompt_version: 'v1',
        input_payload: body,
        output_payload: (result as Record<string, unknown>) || null,
        status: 'Success',
        episode_id: episode_id || null,
        retry_count: 0,
      });

      return NextResponse.json({ success: true, agent: agentName, result });
    } catch (aiError: unknown) {
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown error';

      // Log execution as failed (single log, no spread)
      logExecution({
        agent_name: agentName,
        prompt_version: 'v1',
        input_payload: body,
        output_payload: null,
        status: 'Failed',
        episode_id: episode_id || null,
        retry_count: 0,
        error_message: errorMessage,
      });
      throw aiError;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Generation failed';
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
