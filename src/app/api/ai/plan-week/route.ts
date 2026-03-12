import { NextRequest, NextResponse } from 'next/server';
import {
  generateWeeklyStrategy,
  generateScript,
} from '@/lib/ai';
import {
  createEpisode,
  createWeeklyCycle,
  addEpisodeToWeek,
  createScript,
  listStories,
  listEpisodes,
  logExecution,
  transitionEpisode,
} from '@/lib/db';
import type { Pillar } from '@/lib/types';

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

        // Step 4: Generate scripts for each episode
        const scripts: Array<{ episode_id: string; title: string; status: string }> = [];

        for (let i = 0; i < createdEpisodes.length; i++) {
          const ep = createdEpisodes[i];
          send({
            step: 'script',
            status: 'generating',
            message: `Generating script ${i + 1}/${createdEpisodes.length}: ${ep.working_title}`,
            index: i,
          });

          try {
            const fullEpisode = { episode_id: ep.episode_id, working_title: ep.working_title, pillar: ep.pillar, core_thesis: '', mental_model: '', state: 'Idea' as const } as any;
            const generated = await generateScript(fullEpisode, null, null);

            createScript({
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

            // Walk the state machine: Idea → Selected → Story Matched → Research Matched → Script Drafted
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

            scripts.push({ episode_id: ep.episode_id, title: generated.title_candidate, status: 'done' });
            send({ step: 'script', status: 'done', index: i, title: generated.title_candidate });
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Script generation failed';
            scripts.push({ episode_id: ep.episode_id, title: ep.working_title, status: 'failed' });
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
            scripts_generated: scripts.filter(s => s.status === 'done').length,
            scripts_failed: scripts.filter(s => s.status === 'failed').length,
            episodes: createdEpisodes.map((ep, i) => ({
              ...ep,
              script_status: scripts[i]?.status || 'pending',
              script_title: scripts[i]?.title || null,
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
