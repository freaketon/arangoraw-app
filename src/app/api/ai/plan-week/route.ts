import { NextRequest, NextResponse } from 'next/server';
import {
  generateWeeklyStrategy,
  generateScript,
  generateReelsScript,
} from '@/lib/ai';
import {
  createEpisode,
  createWeeklyCycle,
  addEpisodeToWeek,
  createScript,
  createShortsPack,
  listStories,
  listEpisodes,
  logExecution,
  transitionEpisode,
} from '@/lib/db';
import type { Pillar } from '@/lib/types';
import type { BiographyStory } from '@/lib/ai/biography';

const VALID_PILLARS: Pillar[] = [
  'Psychology of Chaos',
  'Media Intelligence',
  'Identity Shift',
  'Physics of Business',
  'The Survivor',
  'External Mirrors',
];

function toPillar(raw: string): Pillar {
  const match = VALID_PILLARS.find(p => p.toLowerCase() === raw.toLowerCase());
  return match || 'Psychology of Chaos';
}

/** Match a story to an episode by pillar keyword overlap */
function findStoryForPillar(
  pillar: string,
  stories: any[],
  usedIds: Set<string>,
): any | null {
  const pillarLower = pillar.toLowerCase();
  for (const s of stories) {
    if (usedIds.has(s.id)) continue;
    const sPillar = (s.pillar || '').toLowerCase();
    const sTags = (s.tags || []).join(' ').toLowerCase();
    const sTitle = (s.title || '').toLowerCase();
    if (
      sPillar === pillarLower ||
      sPillar.includes(pillarLower.split(' ')[0]) ||
      pillarLower.includes(sPillar.split(' ')[0]) ||
      sTitle.includes(pillarLower.split(' ')[0]) ||
      sTags.includes(pillarLower.split(' ')[0])
    ) {
      return s;
    }
  }
  return null;
}

/** Convert DB story to StoryRecord-like shape for generators */
function toStoryRecord(s: any): any {
  return {
    title: s.title,
    era: s.era,
    raw_event_summary: s.narrative || s.hook || '',
    sensory_details: '',
    emotional_truth: s.hook || '',
    philosophical_lesson: '',
    related_pillars: s.pillar ? [s.pillar] : [],
  };
}

/** Convert DB stories to biography context format */
function toBiographyStories(stories: any[]): BiographyStory[] {
  return stories.map(s => ({
    title: s.title,
    era: s.era,
    narrative: s.narrative || s.hook || '',
    hook: s.hook,
    pillar: s.pillar,
    tags: s.tags,
  }));
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        // Step 1: Generate weekly strategy
        send({ step: 'strategy', status: 'generating', message: 'Generating weekly strategy...' });

        const stories = listStories();
        const episodes = listEpisodes();
        const strategy = await generateWeeklyStrategy(stories, episodes);

        logExecution({
          agent_name: 'Strategy Director',
          prompt_version: 'v1',
          input_payload: { action: 'plan_week_strategy' },
          output_payload: strategy as unknown as Record<string, unknown>,
          status: 'Success',
          episode_id: null,
          retry_count: 0,
        });

        send({ step: 'strategy', status: 'done', data: strategy });

        // Step 2: Create episodes from recommendations
        send({ step: 'episodes', status: 'creating', message: 'Creating episodes...' });

        const createdEpisodes: Array<{ episode_id: string; working_title: string; pillar: Pillar }> = [];

        for (const rec of strategy.episode_recommendations) {
          const ep = createEpisode({
            working_title: rec.working_title,
            pillar: toPillar(rec.pillar),
            core_thesis: rec.core_thesis,
            mental_model: '',
          });
          createdEpisodes.push({
            episode_id: ep.episode_id,
            working_title: rec.working_title,
            pillar: toPillar(rec.pillar),
          });
        }

        send({ step: 'episodes', status: 'done', count: createdEpisodes.length });

        // Step 3: Create weekly cycle
        send({ step: 'week', status: 'creating', message: 'Creating weekly cycle...' });

        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const week = createWeeklyCycle({
          week_theme: strategy.week_theme,
          start_date: monday.toISOString().split('T')[0],
          end_date: sunday.toISOString().split('T')[0],
          story_theme_map: strategy.story_theme_map?.map((s, i) => ({
            episode_id: createdEpisodes[i]?.episode_id || '',
            theme: s.theme,
            pillar: createdEpisodes[i]?.pillar || 'Psychology of Chaos',
          })) || [],
          episode_ids: [],
          planning_state: 'Planning',
        });

        // Add episodes to week
        for (const ep of createdEpisodes) {
          addEpisodeToWeek(week.week_id, ep.episode_id);
        }

        send({ step: 'week', status: 'done', week_id: week.week_id });

        // Prepare story context for all generators
        const allBioStories = toBiographyStories(stories);
        const usedStoryIds = new Set<string>();

        // Step 4: Generate scripts + reels for each episode
        const scriptResults: Array<{ episode_id: string; title: string; status: string; reels_count: number }> = [];

        for (let i = 0; i < createdEpisodes.length; i++) {
          const ep = createdEpisodes[i];

          // Auto-match a story by pillar
          const matchedDbStory = findStoryForPillar(ep.pillar, stories, usedStoryIds);
          if (matchedDbStory) usedStoryIds.add(matchedDbStory.id);
          const matchedStoryRecord = matchedDbStory ? toStoryRecord(matchedDbStory) : null;

          send({
            step: 'script',
            status: 'generating',
            message: `Generating script ${i + 1}/${createdEpisodes.length}: ${ep.working_title}${matchedDbStory ? ` (story: "${matchedDbStory.title}")` : ' (no story matched)'}`,
            index: i,
          });

          try {
            const fullEpisode = {
              episode_id: ep.episode_id,
              working_title: ep.working_title,
              pillar: ep.pillar,
              core_thesis: '',
              mental_model: '',
              state: 'Idea' as const,
            } as any;

            // Generate YouTube script with story context + biography
            const generated = await generateScript(fullEpisode, matchedStoryRecord, null, allBioStories);

            const script = createScript({
              episode_id: ep.episode_id,
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

            // Walk the state machine
            try {
              transitionEpisode(ep.episode_id, 'Selected');
              transitionEpisode(ep.episode_id, 'Story Matched');
              transitionEpisode(ep.episode_id, 'Research Matched');
              transitionEpisode(ep.episode_id, 'Script Drafted');
            } catch {}

            logExecution({
              agent_name: 'Script Architect',
              prompt_version: 'v1',
              input_payload: { action: 'plan_week_script', episode_id: ep.episode_id },
              output_payload: { title_candidate: generated.title_candidate } as Record<string, unknown>,
              status: 'Success',
              episode_id: ep.episode_id,
              retry_count: 0,
            });

            send({ step: 'script', status: 'done', index: i, title: generated.title_candidate });

            // Generate Instagram Reels for this episode
            let reelsCount = 0;
            try {
              send({
                step: 'reels',
                status: 'generating',
                message: `Generating Reels for: ${generated.title_candidate}`,
                index: i,
              });

              const reelsPack = await generateReelsScript(fullEpisode, generated, matchedStoryRecord, allBioStories);
              reelsCount = reelsPack.reels?.length || 0;

              // Save reels as a shorts pack
              if (reelsCount > 0) {
                createShortsPack({
                  episode_id: ep.episode_id,
                  clips: reelsPack.reels.map((r, idx) => ({
                    clip_id: `reel-${idx + 1}`,
                    hook: r.hook,
                    script: r.script,
                    platform: 'Instagram' as const,
                  })),
                  captions: reelsPack.reels.map(r => r.caption),
                  platform_recommendations: [],
                  status: 'Draft',
                });
              }

              logExecution({
                agent_name: 'Reelsmith',
                prompt_version: 'v1',
                input_payload: { action: 'plan_week_reels', episode_id: ep.episode_id },
                output_payload: { reel_count: reelsCount } as Record<string, unknown>,
                status: 'Success',
                episode_id: ep.episode_id,
                retry_count: 0,
              });

              send({ step: 'reels', status: 'done', index: i, count: reelsCount });
            } catch (reelErr) {
              const msg = reelErr instanceof Error ? reelErr.message : 'Reels generation failed';
              send({ step: 'reels', status: 'failed', index: i, error: msg });
            }

            scriptResults.push({ episode_id: ep.episode_id, title: generated.title_candidate, status: 'done', reels_count: reelsCount });
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Script generation failed';
            scriptResults.push({ episode_id: ep.episode_id, title: ep.working_title, status: 'failed', reels_count: 0 });
            send({ step: 'script', status: 'failed', index: i, error: msg });
          }
        }

        // Final summary
        send({
          step: 'complete',
          status: 'done',
          summary: {
            week_id: week.week_id,
            week_theme: strategy.week_theme,
            episodes_created: createdEpisodes.length,
            scripts_generated: scriptResults.filter(s => s.status === 'done').length,
            scripts_failed: scriptResults.filter(s => s.status === 'failed').length,
            total_reels: scriptResults.reduce((sum, s) => sum + s.reels_count, 0),
            episodes: createdEpisodes.map((ep, i) => ({
              ...ep,
              script_status: scriptResults[i]?.status || 'pending',
              script_title: scriptResults[i]?.title || null,
              reels_count: scriptResults[i]?.reels_count || 0,
            })),
          },
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Plan week failed';
        send({ step: 'error', status: 'failed', error: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
