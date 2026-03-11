'use client';

import { useState } from 'react';

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

export function useAIGenerate() {
  const [generating, setGenerating] = useState<GenerateAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate(action: GenerateAction, payload: Record<string, any> = {}) {
    setGenerating(action);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setGenerating(null);
    }
  }

  return { generate, generating, error };
}
