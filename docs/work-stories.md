# Work Story authoring guide

This document is the handoff for anyone writing or editing a Work Story. It defines what belongs on the page, what evidence to collect, and how the Studio Console stores the finished story.

## Publishing rule

- `story: false` keeps a software project card linked directly to its external project URL.
- `story: true` links the card to `/projects/[slug]` and requires a rich Work Story document.
- A slug is lowercase, hyphenated, stable after publication, and unique. Example: `solfa-streams`.
- Do not turn the flag on for a placeholder. A published story should contain real context, decisions, evidence, and a useful next action.

## The chapter structure

Use H2 headings for the chapters below. The wording can change to suit the project, but the narrative job of each chapter should remain.

### 1. Premise

Open with one short paragraph that explains what the product is, who it serves, and why the work mattered. A reader should understand the project without knowing its internal vocabulary.

Collect: the one-sentence product description, target audience, project status, and the most representative product image.

### 2. Context and problem

Describe the situation before the work began. Name the friction or opportunity and explain why the obvious solution was insufficient. Separate observed facts from assumptions.

Collect: user complaints, old workflows, screenshots, support requests, research notes, or a concrete example of the problem.

### 3. Role, scope, and constraints

State Daniel's responsibilities, collaborators, timeframe, and boundaries. Include the technical, business, accessibility, data, or delivery constraints that shaped the solution.

Collect: team composition, dates, explicit responsibilities, non-goals, and constraints that affected decisions.

### 4. Product experience

Walk through the product from the user's point of view. Focus on the important journey rather than listing every feature. Use H3 sections for distinct moments in the flow.

Collect: a short flow, annotated interface images, before-and-after states, and the reason each moment exists.

### 5. Decisions and tradeoffs

Explain two to four decisions that reveal judgment. For each one, name the alternatives, the chosen direction, why it won, and what was knowingly traded away.

Collect: rejected options, sketches, prototypes, constraints, and the evidence used to make the call.

### 6. Architecture and implementation

Show the system beneath the experience at the level a technically curious reader needs. Prefer one clear diagram or code excerpt over a catalogue of frameworks. Explain how the architecture supports the user outcome.

Collect: system boundaries, data flow, relevant integrations, unusual implementation details, and one representative code or architecture artifact.

### 7. Evidence and outcome

Report what changed. Use verified numbers when available; otherwise use qualitative evidence and label it honestly. Never invent metrics to make a project sound complete.

Collect: adoption, speed, reliability, accessibility results, feedback, launch state, or a specific observed improvement. Record the source and date for every metric.

### 8. Lessons and next chapter

Reflect on what the work changed in your thinking, what you would do differently, and what remains unresolved. This is where an unfinished or evolving project can be candid without feeling incomplete.

Collect: retrospectives, known limitations, future work, and decisions that would change with more time or evidence.

### 9. Continue the conversation

End with the best next action: visit the product, inspect the source, read related work, or start a conversation. Include only links that are current and useful.

## Media and formatting

The Studio Console stores stories as Tiptap JSON, not HTML. The allowed vocabulary is intentionally small: paragraphs, H2/H3 headings, bold, italic, bullet and numbered lists, blockquotes, code, dividers, links, and images.

- Give every image an alt description that communicates what a non-visual reader needs from it.
- Use an image when it proves or clarifies a point, not as decoration between every paragraph.
- Introduce screenshots in the surrounding copy. Do not publish an unexplained screenshot dump.
- Use blockquotes for a decisive observation or verified testimonial, not ordinary emphasis.
- Use code only when the implementation itself is part of the story.
- Uploaded story images live in the portfolio's Cloudinary folder and are referenced by URL in the JSON document.

Legacy stories written with `##` headings remain readable. Opening and saving one in the Studio Console converts it to the rich document format; the public page retains the legacy renderer until all existing stories have migrated.

## Solfa Streams starting brief

Do not draft from the product name alone. Before writing, answer and source these prompts:

1. What does Solfa Streams enable, and for whom?
2. What did the previous learning or rehearsal workflow make difficult?
3. What part did Daniel own across product, software, and music?
4. What is the shortest complete user journey worth showing?
5. Which two technical or product decisions best reveal the difficulty of the work?
6. What evidence shows the product works or is useful today?
7. What is still experimental, unavailable, or planned?
8. Where should an interested reader go next?

When those answers and supporting media exist, draft the nine chapters above. If evidence for a chapter is missing, leave an editorial note in the draft rather than filling the gap with a claim.

## Composition score availability

Composition records support zero or more external purchase destinations while scores are published by third parties. In the Studio Console, enter one destination per line:

```text
Publisher name | https://publisher.example/title
Digital edition | https://store.example/title
```

The public composition page shows a “Purchase the score” section only when at least one valid HTTP or HTTPS destination exists. Labels should identify the publisher or edition, not repeat a generic “Buy now.” When self-publishing begins, add the portfolio storefront as another destination first; remove old publisher links only when their editions are genuinely unavailable.

## Pickup checklist

Before another contributor continues a story, they should be able to find:

- The project record and intended slug.
- The story flag's current state.
- Answers and sources for the chapter prompts.
- Original images or diagrams and approved alt descriptions.
- Verified metrics with dates and provenance.
- Current product, repository, publisher, and contact links.
- A note identifying incomplete claims, missing media, and the next editorial decision.

Before publishing, preview the page at desktop and mobile widths, check heading order and keyboard focus, open every link, confirm every image has useful alt text, and verify that the story does not disclose private client or user information.
