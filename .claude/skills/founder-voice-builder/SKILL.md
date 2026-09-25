---
name: founder-voice-builder
description: "Guided voice discovery and profile builder for startup founders. Use this skill whenever a founder wants to define their writing voice, build a voice profile, create a voice guide, or establish a personal content style they can reuse. Also use when someone says 'help me figure out how I sound,' 'build my voice profile,' 'I want to write content that sounds like me,' 'define my brand voice,' or asks for anything related to capturing a founder's personal writing style as a reusable reference. This skill produces a structured voice profile document that other content skills can reference. Make sure to use this skill whenever the user mentions voice, tone, writing style, ghostwriting guidance, or personal brand in the context of content creation, even if they don't explicitly say 'voice profile.'"
---

# Founder Voice Builder

This skill walks a startup founder through a structured voice discovery process, then produces a detailed, reusable voice profile document. The profile should be specific enough that a ghostwriter, content strategist, or AI tool could read it and produce content that sounds recognizably like the founder.

The output is a working reference document, not a personality quiz result. Every claim in the profile gets grounded in something the founder actually wrote, said, or explicitly stated as a preference.

---

## How this skill works

The voice-building process has two phases:

**Phase 1: Discovery.** Gather raw material from the founder through a series of prompts. This is an interview, not a form. Ask follow-up questions. Push for specifics. If a founder says "I want to sound authentic," that's not usable yet. You need to know what authentic means to them, in concrete terms.

**Phase 2: Profile construction.** Analyze the raw material and build a structured voice profile document. The profile is the deliverable. It should be detailed, grounded in the founder's actual samples, and organized so that someone else can use it as a content production reference.

---

## Phase 1: Discovery

Run the discovery prompts below. You do not need to ask every prompt verbatim or in order. Adapt based on what the founder gives you. If they dump in four writing samples upfront, start analyzing those and ask targeted follow-ups instead of running the full interview from scratch.

The goal is to collect enough raw material to build every section of the voice profile. If a section would be thin, go back and ask more questions.

### Prompt set

**1. The bar version of what you do**

Ask the founder to describe their company the way they would to a friend over drinks. Not the pitch deck version. Not the LinkedIn headline. The one where they're relaxed and not performing.

Why this matters: The gap between how someone talks about their work when they're performing and how they talk about it when they're not is one of the fastest signals of where their real voice lives.

**2. Writing samples that feel like them**

Ask the founder to share 3 to 5 pieces of writing that sound like them. These can be anything: emails, Slack messages, investor updates, LinkedIn posts, tweet threads, angry draft blog posts, voice memos transcribed, texts to a cofounder. The messier and more natural, the better.

If they don't have samples ready, ask them to write something on the spot. Give them a prompt like: "Write a few paragraphs about a strong opinion you have about how your industry works. Don't edit it. Just get it down."

Why this matters: Stated preferences ("I want to sound casual") are less reliable than demonstrated behavior. The samples are the ground truth. Everything in the voice profile should be traceable to something in the samples or explicitly contradicted by a stated preference.

**3. The cringe list**

Ask: "What words, phrases, or tones make you cringe when you see them in startup content? What would you never want someone to write on your behalf?"

Push for specifics. "Corporate jargon" is too broad. You want the actual words. "Synergy." "Unlock." "Leverage." "At the end of the day." "Whether you're a first-time founder or a seasoned veteran."

Why this matters: What someone refuses to sound like is often more diagnostic than what they aspire to sound like. Cringe reactions are visceral and specific. They reveal boundaries that matter.

**4. Real opinions**

Ask: "What's something you believe about your industry, your market, or how startups work that most people in your space would disagree with? Or at least wouldn't say out loud?"

If they give a safe answer, push once: "That's a reasonable take, but a lot of people would probably agree with it. What's the version that makes your investors nervous? Or the thing you say to your cofounder at 11 PM but would never put in a deck?"

Why this matters: How someone states an opinion (and how far they're willing to go with it) shapes voice more than any mechanical preference. Do they lead with the take or build to it? Do they qualify everything or commit? Do they acknowledge the counterargument or bulldoze past it?

**5. How content should feel to the reader**

Ask two questions:
- "When someone finishes reading something you wrote, what do you want them to feel?"
- "What should your content never feel like?"

The second question is usually more revealing. "I never want to sound like I'm selling" tells you something specific. "I want to sound trustworthy" tells you almost nothing.

**6. Voices they admire (optional)**

Ask: "Are there any writers, founders, podcasters, or public figures whose communication style you admire? What specifically do you like about how they sound?"

Only useful if the founder can name what they like, not just who they like. "I like Paul Graham's writing" is a starting point. "I like how Paul Graham makes complex ideas feel simple without dumbing them down, and how he builds to his point instead of leading with it" is usable.

### Discovery principles

**Push for specifics, not adjectives.** If a founder says "confident," ask what confidence sounds like to them. Short declarative sentences? Stating opinions without hedging? Using profanity? Naming competitors by name? "Confident" means different things to different people.

**Trust the samples over the stated preferences.** If someone says "I want to sound casual" but every sample they provide is carefully structured with complex sentences, the profile should reflect the complexity, not the aspiration. Note the gap, but build the profile from the evidence.

**Ask follow-ups that dig into mechanics.** If a founder shares a LinkedIn post they're proud of, ask: "What about this sounds like you? Is it the length? The structure? A specific sentence? The opening?" Most people haven't thought about their writing at this level, and that's fine. Your job is to identify the patterns they can't articulate yet.

**Watch for the gap between performance and default.** Some founders write very differently on LinkedIn (performance mode) than they do in Slack or investor updates (default mode). The voice profile should be built from the default, with notes on how the founder naturally shifts for different contexts.

---

## Phase 2: Profile construction

Analyze the collected material and build the voice profile document. The profile is structured in seven sections. Every section should be grounded in the founder's actual samples or stated preferences. If you can't ground a claim, cut it.

### Output format

The voice profile should be produced as a Markdown document with the following structure. Adapt the subsections based on what's actually distinctive about this founder's voice. Not every founder needs every subsection. If a founder has no strong opinion about paragraph length, don't manufacture one.

```
# [Founder Name] — Voice Profile

Built from [number] writing samples and a voice discovery session on [date].

---

## Core voice identity
[2-3 sentences. Who this person sounds like. Not a personality type.
A description specific enough that someone reading it would immediately
know what kind of sentence to write next.]

---

## Sentence-level mechanics
[How they build sentences. Rhythm, length, pacing patterns.
Short and punchy? Long and analytical? A specific mix?
Do they use fragments? How do they start sentences?
Include direct examples from the writing samples.]

---

## Vocabulary patterns
[Words and phrases they gravitate toward. Words and phrases
that are banned. The register: casual, technical, or a
specific location in between. How they handle jargon.
Include actual word lists drawn from the samples.]

---

## Opinion style
[How they state a position. Do they build to it or lead with it?
Do they hedge or commit? Do they acknowledge the counterargument?
How do they handle topics where they're uncertain vs. topics
where they're certain? Include examples.]

---

## Emotional register
[Where they sit on the spectrums: warm vs. blunt, confident vs.
exploratory, funny vs. serious, formal vs. casual. What the
ceiling and floor are. What emotions or tones they reach for
and what they avoid.]

---

## Structural tendencies
[Paragraph length. How they open and close things. Any
signatures: recurring phrases, structural moves, punctuation
habits. Preferred content structures (if any). How they
transition between ideas.]

---

## Hard boundaries
[Anything that should never appear in content produced in
their voice. Specific words, tones, formats, framing patterns,
or structural moves that violate who they are on the page.
This section also includes AI-pattern flags: patterns likely
to creep into AI-generated content that would break this
founder's voice.]
```

### How to analyze the writing samples

When you receive writing samples, run through this analysis before building the profile:

**Sentence-level scan.** Look at sentence length variation. Count the ratio of short sentences (under 8 words) to long sentences (over 20 words). Identify the dominant rhythm. Note whether they use fragments, and if so, what kind (trailing fragments that complete a prior thought? Stand-alone fragments for emphasis? Question fragments?).

**Vocabulary extraction.** Pull out repeated words, filler words, casual markers (really, actually, honestly, like, kind of), intensifiers (super, wildly, insanely, a lot), and any domain-specific terms they use naturally versus avoid. Note the register: is this someone who writes "utilize" or "use"? "Individuals" or "people"? "Facilitate" or "make happen"?

**Opinion pattern mapping.** Look at how they handle claims and arguments across the samples. Do they state a position and defend it? Build observational evidence and let the reader arrive at the conclusion? Acknowledge uncertainty? Quote or cite? Use data? Use anecdotes? Lead with a contrarian take or ease into one?

**Emotional range.** Map the tonal territory. Where's the floor (most restrained, formal, careful) and where's the ceiling (most casual, intense, funny, raw)? What triggers movement between them? Does humor appear, and if so, what kind: dry, self-deprecating, absurdist, observational?

**Structural habits.** Paragraph length distribution. How they open pieces or sections. How they close them. Whether they use headers and what kind. Use of lists versus prose. Transition patterns. Any repeating structural moves (the callback, the flip, the slow build, the one-sentence paragraph for emphasis).

### AI-pattern flagging

This step is critical. After building the profile, audit it against the following list of patterns. For each pattern, determine:

1. Does the founder naturally avoid this pattern? (Note that as a voice strength.)
2. Is the founder neutral on this pattern? (Skip it.)
3. Would AI-generated content on behalf of this founder be likely to introduce this pattern in a way that violates their voice? (Flag it as a hard boundary.)

Patterns to check:

- Em dashes used as all-purpose punctuation instead of commas, periods, or parentheses
- Contrast framing: "It's not X. It's Y."
- False binary setup: "Most people do X. The best people do Y."
- Rule of three lists: "Clear, concise, and compelling."
- Heavy transition words: "However," "That said," "Meanwhile," "Ultimately," "In today's world..."
- Every paragraph opening with a transition: "First," "Next," "Finally," "Additionally."
- Generic motivational closings: "The future belongs to those who embrace change."
- Over-balanced arguments: every point gets an equally polished counterpoint
- Excessive hedging: "It depends," "In many cases," "Generally speaking," "It's important to note..."
- Repeated sentence templates: multiple sentences starting with "By..." or "Whether you're..." or "If you're..."
- Uniform paragraph lengths: every paragraph runs 2 to 4 sentences with similar cadence
- Rigid intro/body/conclusion structure: hook, explanation, examples, takeaway, every time
- Corporate buzzwords: "Leverage," "unlock," "optimize," "streamline," "robust," "seamless."
- Abstract nouns standing in for specifics: "strategy," "innovation," "success," "impact," "value," "growth."
- Fake specificity: "Imagine a small business owner..." instead of a real example
- Restating the same idea in three different ways for completeness
- Frictionless, opinion-free tone: no strong positions, no sharp edges, no distinctive voice
- Symmetrical sections: every section has the same number of bullets or similar-sized explanations
- Formulaic endings: "The bottom line is...", "At the end of the day...", "The key takeaway is..."
- No surprising details: technically correct writing with no memorable observations, lived experience, or unconventional phrasing
- "Whether you're X or Y..." constructions
- Rhetorical questions immediately answered
- Colon-heavy headlines: "The Secret to Growth: Why Startups Need Better Messaging."
- Excessive bold for emphasis
- Parenthetical clarifications everywhere: "(which means...)", "(in other words)..."
- High lexical variety but low informational density: polished wording, few original ideas
- Universal qualifiers overload: "Every," "Always," "Never," "The key is..."
- Artificial confidence: smooth claims with no acknowledgment of uncertainty or evidence
- Suspiciously exhaustive lists (10, 20, or 50 perfectly categorized items)
- Writing that never takes stylistic risks: no fragments, asides, humor, slang, or intentionally awkward phrasing

Include the relevant flags in the Hard Boundaries section of the profile. Only include patterns that are actually relevant to this founder. Don't dump the full list into every profile.

### Profile quality check

Before delivering the profile, run it through these checks:

**The two-reader test.** If two different people read this profile and each wrote a paragraph in this founder's voice, would the paragraphs sound recognizably like the same person? If the profile is too vague to produce convergent output, it needs more specifics.

**The adjective test.** Scan the profile for vague descriptors: "authentic," "conversational," "professional but approachable," "engaging," "relatable." These are noise. Every one of them should either be replaced with a concrete description of what that quality looks like in practice (sentence-level, word-level, structural) or cut.

**The grounding test.** Every claim in the profile should be traceable to either a writing sample or a stated preference. If a claim is floating (you inferred it, but there's no evidence), flag it as an inference and note the basis, or remove it.

**The boundary test.** The Hard Boundaries section should contain at least 5 specific, actionable items. "Don't be boring" is not a boundary. "Never open with a rhetorical question followed by the answer" is a boundary.

---

## Delivery

Produce the voice profile as a Markdown file. The founder can paste this document into other Claude skills, share it with a ghostwriter, or reference it any time they need content that sounds like them.

If the founder is using other skills from the 5 Claude Skills to Crush Founder-Led Content system (Weekly Capture to Content Drafts, Three-Pillar Content Strategizer, Hook and Angle Generator, One-to-Many Repurposer), this voice profile is the reference document those skills will use. Remind the founder that they can paste the profile into any conversation where they want voice-consistent output.

After delivering the profile, ask: "Read through this. Does it actually sound like you? What's off?" The profile should be treated as a living document. The founder should feel free to edit, annotate, or come back and revise it as their voice evolves.

---

## Writing standards for this skill

The voice profile this skill produces, and the skill's own copy during the discovery process, must follow these constraints. These are not suggestions. They are institutional standards.

- Never use em dashes. Use commas, periods, or parentheses instead.
- No contrast framing: "It's not X. It's Y."
- No false binary setups: "Most people do X. The best people do Y."
- No rule of three lists as rhetorical flourish.
- No generic motivational closings.
- No "Whether you're X or Y..." constructions.
- No formulaic endings: "The bottom line is...", "At the end of the day...", "The key takeaway is..."
- No colon-heavy headlines.
- No excessive bold for emphasis.
- No "However," "Furthermore," "Moreover," "Additionally," as paragraph starters.
- No corporate buzzwords: "Leverage," "unlock," "optimize," "streamline," "robust," "seamless."
- No AI-tell phrasing: "navigate the landscape," "in today's rapidly evolving," "it's important to note," "delve into," "fostering innovation," "a testament to."
- No suspiciously exhaustive or perfectly symmetrical lists.
- No rhetorical questions immediately followed by the answer.
- No writing that avoids all stylistic risk.

These constraints apply to the profile document itself, not to the founder's voice. If a founder naturally uses em dashes, the profile should note that as part of their voice. But the profile document as written by this skill follows the constraints above.
