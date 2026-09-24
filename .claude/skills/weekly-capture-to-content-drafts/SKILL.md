---
name: weekly-capture-to-content-drafts
description: "Turn a founder's raw weekly notes into 2-3 structured, channel-appropriate content drafts. Use this skill whenever a founder pastes messy notes, bullet points, voice memo transcripts, brain dumps, or stream-of-consciousness capture from their week and wants content pulled from it. Also use when someone says 'here are my notes from this week,' 'turn this into posts,' 'what content is hiding in here,' 'help me write from my week,' 'I captured some stuff, now what,' or any variation of dumping raw material and expecting structured drafts back. This skill handles genuinely messy input (fragments, half-sentences, Slack pastes, random bullets) and produces drafts ready for light editing across LinkedIn, newsletter, X/Twitter, community, or podcast formats. Make sure to use this skill whenever raw notes or weekly capture is involved in content creation, even if the user doesn't explicitly say 'weekly capture' or 'content drafts.'"
---

# Weekly Capture to Content Drafts

This skill takes a founder's raw, messy notes from their week and turns them into 2-3 structured content drafts mapped to their target channel(s). The founder's week is already full of content. This skill does the translation.

This is the weekly workhorse in the *5 Claude Skills to Crush Founder-Led Content* system, produced by HubSpot for Startups. It sits between the Founder Voice Builder (Skill 1, which defines the founder's voice) and the refinement tools (Hook and Angle Generator, One-to-Many Repurposer). The drafts it produces should be good enough to publish with 10-15 minutes of editing.

---

## What the founder provides

**1. Raw notes from their week (required).** This is the core input. It will be messy. Bullet points, half-sentences, voice memo transcripts, Slack messages to themselves, sentence fragments, stream of consciousness, random observations, meeting notes, complaints, wins, losses, half-formed ideas. Accept all of it. Never ask the founder to clean up or organize their notes first. The messier the input, the more likely it contains something real.

**2. Voice profile (optional but recommended).** A voice profile produced by the Founder Voice Builder skill, or a rough description of how the founder wants to sound. If provided, apply it to every draft. If not provided, default to: direct, specific, slightly informal, sounds like a human with opinions. Not polished. Not corporate. Not AI content.

**3. Target channel(s) (optional but helpful).** LinkedIn, newsletter, X/Twitter, community (Slack/Discord/Reddit), podcast talking points, or a mix. If the founder specifies channels, spread drafts across them. If they don't specify, choose channels based on which moments are the strongest fit. Default to LinkedIn only if nothing in the notes points toward a better channel.

**4. Content pillars (optional).** Three content pillars produced by the Three-Pillar Content Strategizer skill. If provided, tag each draft with the pillar it maps to. If not provided, skip pillar mapping and just produce the drafts.

---

## How to process the notes

### Step 1: Read the full dump without filtering

Read everything the founder pasted. Do not skim. Do not skip the parts that look unfinished or confusing. The best content moments are often buried inside the messiest fragments. A sentence like "almost lost the deal then realized we were solving the wrong problem" contains a full story. Treat compressed fragments as signals, not noise.

### Step 2: Extract the moments

A "moment" is a specific decision, conversation, realization, surprise, mistake, or outcome from the founder's week that would be interesting to their target audience. Scan the notes for these.

What counts as a moment:

- A decision the founder made and why they made it (pricing change, hire, pivot, fired a vendor, killed a feature)
- A conversation that shifted their thinking (investor call, customer feedback, argument with a cofounder)
- Something that surprised them or went against their expectations
- A mistake they made and what they learned from it after the fact
- A specific result or outcome with enough context to be useful to someone else
- A tension between two reasonable positions where the founder had to pick a side
- An observation about their market, their customers, or their own behavior that others in their space would recognize

What does not count as a moment:

- Generic statements ("had a productive week")
- Industry news the founder is merely commenting on without a personal angle
- Ideas that are purely abstract with no grounding in something that actually happened
- Things that happened but have no insight, tension, or takeaway attached

Be selective. Two or three strong moments are better than five weak ones. If the notes only contain one genuinely strong moment, produce one excellent draft and tell the founder why the others didn't make the cut. Do not manufacture volume.

If a paragraph in the notes contains multiple moments tangled together, pull them apart. "Changed pricing, lost two customers, but pipeline actually improved" is at least two distinct moments. Separate them.

### Step 3: Rank the moments

Before drafting, rank the extracted moments by strength. The strongest moments are the ones where:

- The founder has a specific, defensible point of view (not just a thing that happened, but a thing that happened and what it means)
- The story has enough detail to reconstruct (who, what, when, why, what changed)
- The audience would recognize the situation or learn something from it
- The moment connects to a recurring theme or tension in the founder's space

Select the top 2-3 moments for drafting. If the founder provided content pillars, factor pillar coverage into the selection (don't put all drafts under one pillar if the moments support spread).

### Step 4: Reconstruct the stories

Raw notes are compressed. "Changed pricing, team pushed back, turned out to be right" is a full narrative squeezed into a fragment. Before drafting, expand each selected moment back into its story arc:

- What was the situation before? (Setup)
- What happened? (The moment itself)
- What was the tension or the decision? (The turn)
- What was the result or the realization? (The landing)
- What can the reader take from this? (The so-what, but not stated as a lesson, woven into the story)

**Critical rule: do not invent details.** If the notes say "had a great call with a prospect," the reconstruction should not fabricate what the prospect said. Work with the general framing, or flag the gap. You can say: "This draft would hit harder with a specific detail from the call. What did they actually say that stuck with you?" But do not fill in the blank yourself.

If a moment's notes are too thin to reconstruct even a skeletal story, flag it. Tell the founder what's missing and what one or two details would unlock the draft. Then move to the next moment.

### Step 5: Draft for the channel

Build each draft for its target channel. Channel shapes structure, length, tone, and entry point.

**LinkedIn**

- Hook in the first line. Under 220 characters before the fold. The hook should make someone stop scrolling. It can be a surprising claim, a specific detail, a question that isn't rhetorical, or a compressed version of the moment.
- Short paragraphs. One to three sentences each. White space matters on LinkedIn because the reading environment is noisy.
- Conversational. Written like the founder is talking to one person, not broadcasting to a feed.
- Ends with something that invites response or reflection. Not "What do you think?" Not "Drop a comment if you agree." Something specific to the moment. "Has anyone else run this play and watched it backfire?" "Curious if B2B founders are seeing this too or if it's just us."
- No hashtags unless the founder's voice profile specifically includes them.

**Newsletter**

- Can go longer. 400-800 words is a comfortable range for a single section.
- Needs a subject line that earns the open. Not clickbait. Not a summary. A subject line that creates enough tension or curiosity that the reader clicks.
- Opening paragraph earns the full read. Drop the reader into the middle of the story or name the tension immediately. No throat-clearing.
- More room for narrative, layered arguments, and asides. Newsletters are where founders can be most themselves.
- Can include a brief sign-off or bridge to the next section if this is part of a larger newsletter.

**X/Twitter**

- Compressed. One strong take per post. If the moment warrants a thread, suggest thread structure, but default to single posts.
- Lead with the sharpest version of the insight. X rewards density.
- 280 characters is the constraint. Write to it. Don't pad and don't truncate awkwardly.
- If suggesting a thread: first post is the hook (standalone value), subsequent posts add context or story, final post lands the insight or asks a question.

**Community (Slack/Discord/Reddit)**

- Written like a peer sharing something useful, not a founder broadcasting.
- More casual than LinkedIn. Can open with "So this happened this week" or "Running into something and curious if others have dealt with it."
- Specific to a problem the community cares about. The moment needs to be framed around a shared challenge, not a personal win.
- Shorter than newsletter, longer than X. 150-300 words.
- Ends with a genuine question, not a rhetorical one. The goal is conversation.

**Podcast talking points**

- Not a script. Bullet-point structure is appropriate here (this is the one format where bullets serve the purpose).
- Core story: what happened, compressed into 3-4 sentences the founder can riff on.
- The insight: the one thing this moment reveals, stated plainly so the founder can say it out loud.
- 2-3 follow-up angles: questions a host might ask, or directions the conversation could go. Each one is a sentence, not a paragraph.
- A "quotable moment" note: one sentence from the story that would make a good pull quote or audiogram clip.

### Step 6: Apply the voice

If a voice profile was provided, apply it to every draft. This means:

- Match the founder's sentence rhythm (short/long patterns, fragment usage, paragraph length)
- Use their vocabulary, not yours (check their word list if the profile has one)
- Follow their punctuation rules (if they avoid em dashes, never use them; if they use parenthetical asides, include them)
- Match their opinion style (do they state positions bluntly or build to them? do they hedge or commit?)
- Match their emotional register (warm, dry, intense, self-deprecating, whatever the profile says)
- Respect their hard boundaries (every voice profile should have a list of things to never do)

If no voice profile was provided, write in a default voice: direct, specific, slightly informal, grounded in the actual story. Sounds like someone who runs a company and has opinions about it. Does not sound like a content marketing team.

### Step 7: Quality checks

Run these checks on every draft before outputting.

**The specificity test.** If you swapped out the company name and industry, would this draft still sound like it could be about anyone? If yes, the draft has failed. Go back and ground it in the specific details from the founder's notes. The moments, opinions, and details should be particular enough that this draft could only have been written by this founder about this week.

**The read-aloud test.** Read the draft out loud (mentally). Does it sound like a human with a point of view talking, or does it sound like content? If it sounds like content, rewrite it. Content has a sheen to it. Human writing has edges, opinions, and moments where the phrasing is slightly unexpected.

**The constraint audit.** Scan the draft against the banned patterns list (see Writing Constraints below). If any violation is present, fix it before outputting.

**The invention check.** Scan the draft for any detail, quote, anecdote, or data point that did not come from the founder's notes. If you find one, remove it or flag it as something the founder needs to confirm.

---

## Output format

For each draft, output:

**Source moment:** A one-sentence description of which moment from the notes this draft is built from. Use the founder's language so they can trace it back.

**Channel:** Which channel this draft is written for.

**Pillar:** Which content pillar it maps to (only if pillars were provided, otherwise omit this line).

**The draft itself.** Structured for the target channel, following all channel and voice specifications.

**Edit note:** One to two sentences on what's working in the draft and what the founder might want to sharpen, add, or reconsider before publishing. Be specific. "Consider adding the actual numbers from the pricing change" is useful. "Polish the ending" is not.

---

## Structural variety across drafts

Do not write all drafts using the same structure. If draft one opens with a hook and tells a linear story, draft two should use a different entry point. Options:

- Open with the insight and work backward to the story
- Open with a question the founder wrestled with that week
- Open with a specific detail or image from the moment (a line someone said, a number that surprised them, a thing they saw)
- Open with the outcome and then explain what led to it
- Open with the tension between two positions before revealing which side the founder landed on

The set of drafts should feel like range, not repetition.

---

## What this skill does not do

- **Does not invent.** No fabricated quotes, anecdotes, data points, or details. If it's not in the notes, it's not in the draft. Flag gaps instead of filling them.
- **Does not pad.** Two strong drafts beat five mediocre ones. If the notes only support one good draft, say so.
- **Does not default to LinkedIn.** If the founder specified multiple channels, use them. If a moment fits newsletter better than LinkedIn, put it there.
- **Does not repeat structure.** Every draft in the set uses a different entry point and structural approach.
- **Does not add engagement bait.** No "What do you think?" No "Drop a comment." No motivational closings. No generic CTAs. Unless the founder's voice profile specifically calls for a signature sign-off or engagement style, end the draft with the story's natural landing point.
- **Does not overexplain.** The draft should trust the reader. If the moment is clear, the meaning will follow. Do not add a paragraph at the end that restates the point in case someone missed it.

---

## Writing constraints

These patterns are banned in every draft this skill produces. They are institutional HubSpot for Startups writing standards. Enforce them regardless of whether the founder's voice profile addresses them. If the founder's voice profile reinforces any of these (e.g., they also avoid em dashes), treat that as double confirmation. If their profile conflicts (e.g., they naturally use rule-of-three lists), follow the founder's voice for their content, but still avoid the patterns in your own framing text (edit notes, moment descriptions, flagged gaps).

Banned patterns:

- Em dashes used as all-purpose punctuation instead of commas, periods, or parentheses
- Contrast framing: "It's not X. It's Y."
- False binary setup: "Most people do X. The best people do Y."
- Rule of three lists used as rhetorical flourish: "Clear, concise, and compelling."
- Transition word overload: "However," "That said," "Meanwhile," "Ultimately," "In today's world..."
- Every paragraph opening with a transition: "First," "Next," "Finally," "Additionally."
- Generic motivational conclusions: "The future belongs to those who embrace change."
- Over-balanced arguments where every point gets an equally polished counterpoint
- Excessive hedging: "It depends," "In many cases," "Generally speaking," "It's important to note..."
- Repeated sentence templates: multiple sentences beginning with "By..." or "Whether you're..." or "If you're..."
- Perfectly uniform paragraph lengths: every paragraph 2-4 sentences with similar cadence
- Predictable intro/body/conclusion structure used identically across drafts
- Corporate buzzwords: "Leverage," "unlock," "optimize," "streamline," "robust," "seamless."
- Abstract nouns standing in for specifics: "strategy," "innovation," "success," "impact," "value," "growth" used without grounding
- Fake specificity: "Imagine a small business owner..." instead of something real
- Restating the same idea multiple ways for completeness
- Over-polite, frictionless, opinion-free tone
- Tidy symmetry: every section has the same number of bullets or equally sized explanations
- Formulaic endings: "The bottom line is...", "At the end of the day...", "The key takeaway is..."
- No surprising details: technically correct writing with no memorable observations or unconventional phrasing
- "Whether you're X or Y..." constructions
- Rhetorical questions followed immediately by the answer
- Colon-heavy headlines: "The Secret to Growth: Why Startups Need Better Messaging."
- Excessive bold for emphasis
- Parenthetical clarifications everywhere: "(which means...)", "(in other words)..."
- High lexical variety with low informational density: polished wording, few original ideas
- Universal qualifier overload: "Every," "Always," "Never," "The key is..."
- Artificial confidence: smooth claims with no acknowledgment of uncertainty or evidence
- Suspiciously exhaustive lists (10, 20, or 50 perfectly categorized items)
- Writing that never takes a stylistic risk: no fragments, asides, humor, slang, or intentionally unexpected phrasing
- AI-tell phrasing: "navigate the landscape," "in today's rapidly evolving," "delve into," "fostering innovation," "a testament to," "at the intersection of"

---

## When the notes are thin

Sometimes a founder will paste notes that are genuinely too sparse to produce strong drafts. A few vague bullets with no specifics, no tension, no decision points.

In this case, do not force drafts from nothing. Instead:

1. Tell the founder what you found (and what you didn't). Be direct. "These notes mention a pricing conversation and a product decision, but there's not enough detail to build a draft that sounds like it came from your week specifically."
2. Ask targeted questions to unlock the drafts. Not open-ended. Specific. "What did the customer actually say when you told them the price was going up?" "What was the argument for keeping the feature vs. killing it?" "What surprised you about how the team reacted?"
3. If even one moment has enough material, draft that one and explain why the others need more.

The goal is to never produce a draft where the founder reads it and thinks, "This could be about literally anyone." Thin notes that get forced into drafts produce exactly that outcome.

---

## Interaction with other skills in the system

This skill is designed to work with the other four skills in *5 Claude Skills to Crush Founder-Led Content*:

- **Founder Voice Builder (Skill 1):** Produces the voice profile this skill consumes. If the founder has run that skill, they'll paste the profile alongside their notes.
- **Three-Pillar Content Strategizer (Skill 3):** Produces the content pillars this skill can tag drafts against. If pillars are provided, use them. If not, skip it.
- **Hook and Angle Generator (Skill 4):** The founder can take a draft from this skill and run it through the Hook and Angle Generator to explore alternate openings, angles, or frames.
- **One-to-Many Repurposer (Skill 5):** The founder can take a strong draft from this skill and repurpose it across additional channels using the Repurposer.

Reference these connections when relevant (e.g., "If you want to explore different hooks for Draft 2, you can run it through the Hook and Angle Generator"). But don't over-reference. The drafts should stand on their own.

---

## Writing standards for this skill's own copy

Everything this skill produces (edit notes, moment descriptions, gap flags, questions back to the founder) follows the same banned patterns list above. The skill's voice when talking to the founder should be: direct, clear, no filler, no corporate tone, no over-qualification. Talk to the founder like a sharp collaborator, not a tool giving output.
