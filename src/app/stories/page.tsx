'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Card, { CardBody } from '@/components/ui/Card';
import { PillarBadge, StateBadge } from '@/components/ui/Badge';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useAIGenerate } from '@/hooks/useAIGenerate';

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Recording state
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Text input state
  const [rawInput, setRawInput] = useState('');
  const { generate, generating } = useAIGenerate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stories');
      const data = res.ok ? await res.json() : [];
      setStories(Array.isArray(data) ? data : []);
    } catch { setStories([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Audio Recording ──
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(blob);
      };

      mediaRecorder.start(1000); // collect in 1s chunks
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  async function transcribeAudio(blob: Blob) {
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      const res = await fetch('/api/ai/transcribe', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setTranscribedText(data.text || '');
        setRawInput(data.text || '');
      }
    } catch (err) {
      console.error('Transcription failed:', err);
    }
    setTranscribing(false);
  }

  // ── Save story via AI extract ──
  async function extractAndSave() {
    const text = rawInput.trim();
    if (!text) return;
    const result = await generate('extract_story' as any, { raw_input: text });
    if (result) {
      setRawInput('');
      setTranscribedText('');
      load();
    }
  }

  // ── Quick manual save ──
  async function quickSave() {
    const text = rawInput.trim();
    if (!text) return;
    await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: text.slice(0, 60), raw_memory: text }),
    });
    setRawInput('');
    setTranscribedText('');
    load();
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  if (loading) return <div className="text-text-muted text-sm text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Record / Input area */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Mic button */}
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={transcribing}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                recording
                  ? 'bg-red-500/20 text-red-400 animate-pulse border-2 border-red-400'
                  : 'bg-bg-tertiary text-text-muted hover:text-accent-gold hover:bg-bg-hover border border-border'
              } disabled:opacity-50`}
            >
              {recording ? '■' : '\uD83C\uDFA4'}
            </button>

            {recording ? (
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm text-red-400 font-medium">{formatTime(recordingTime)}</span>
                <div className="flex-1 h-1 bg-bg-tertiary rounded overflow-hidden">
                  <div className="h-full bg-red-400 animate-pulse" style={{ width: '100%' }} />
                </div>
                <Button size="sm" onClick={stopRecording}>Stop</Button>
              </div>
            ) : transcribing ? (
              <div className="text-sm text-accent-gold-dim animate-pulse">Transcribing audio...</div>
            ) : (
              <textarea
                value={rawInput}
                onChange={e => setRawInput(e.target.value)}
                rows={2}
                placeholder="Record a memory or type it here..."
                className="flex-1 bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim resize-none"
              />
            )}
          </div>

          {transcribedText && !recording && !transcribing && (
            <div className="text-[10px] text-text-muted">Transcribed from audio — edit above if needed</div>
          )}

          {rawInput.trim() && !recording && !transcribing && (
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={quickSave}>
                Save Raw
              </Button>
              <Button
                size="sm"
                onClick={extractAndSave}
                disabled={generating === 'extract_story'}
              >
                {generating === 'extract_story' ? 'Extracting...' : 'AI Extract & Save'}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Story List */}
      {stories.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No stories yet"
          description="Record a memory or type one above. AI will extract themes, emotions, and classify it."
        />
      ) : (
        <div className="space-y-2">
          {stories.map(story => {
            const isExpanded = expanded === story.story_id;
            return (
              <Card key={story.story_id}>
                <div
                  className="px-4 py-3 cursor-pointer hover:bg-bg-hover transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : story.story_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-text-primary">{story.title}</div>
                      <div className="text-xs text-text-muted mt-0.5 line-clamp-1">
                        {story.raw_memory}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {story.pillar && <PillarBadge pillar={story.pillar} />}
                      {story.intake_state && <StateBadge state={story.intake_state} />}
                      <span className="text-text-muted text-xs">{isExpanded ? '▾' : '▸'}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 space-y-3">
                    {story.raw_memory && (
                      <Section label="Raw Memory" text={story.raw_memory} />
                    )}
                    {story.refined_narrative && (
                      <Section label="Refined Narrative" text={story.refined_narrative} />
                    )}
                    {story.emotional_truth && (
                      <Section label="Emotional Truth" text={story.emotional_truth} />
                    )}
                    {story.philosophical_lesson && (
                      <Section label="Philosophical Lesson" text={story.philosophical_lesson} />
                    )}
                    {story.sensory_details && story.sensory_details.length > 0 && (
                      <div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Sensory Details</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {story.sensory_details.map((d: string, i: number) => (
                            <Badge key={i} variant="default">{d}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {story.themes && story.themes.length > 0 && (
                      <div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Themes</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {story.themes.map((t: string) => <Badge key={t} variant="default">{t}</Badge>)}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-text-muted pt-1">
                      {story.era && <span>Era: {story.era}</span>}
                      {story.confidence_score && <span>Confidence: {story.confidence_score}</span>}
                      {story.times_used !== undefined && <span>Used: {story.times_used}x</span>}
                      {story.created_at && <span>{new Date(story.created_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">{text}</div>
    </div>
  );
}
