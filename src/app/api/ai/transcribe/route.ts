import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert to buffer for the Anthropic-compatible approach:
    // Since we don't have a dedicated STT API, we use a simple approach:
    // Send audio to a free Whisper-compatible endpoint or fall back to
    // a text placeholder if no STT service is configured.

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      // Use OpenAI Whisper API for transcription
      const whisperForm = new FormData();
      whisperForm.append('file', audioFile, 'recording.webm');
      whisperForm.append('model', 'whisper-1');
      whisperForm.append('language', 'en');

      const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: whisperForm,
      });

      if (whisperRes.ok) {
        const data = await whisperRes.json();
        return NextResponse.json({ text: data.text });
      }

      const errData = await whisperRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Transcription failed', details: errData },
        { status: 500 }
      );
    }

    // Fallback: no STT API key configured
    // Return guidance to the user
    return NextResponse.json(
      {
        error: 'No transcription API configured. Add OPENAI_API_KEY to your environment for Whisper transcription.',
        text: '',
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Transcription error' }, { status: 500 });
  }
}
