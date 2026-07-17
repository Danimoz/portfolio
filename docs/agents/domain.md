# Domain docs

This is a single-context repository. Domain terminology belongs in `CONTEXT.md` at the repository root, and durable architectural decisions belong in `docs/adr/`.

## Before exploring

- Read `CONTEXT.md` when it exists.
- Read ADRs under `docs/adr/` that relate to the work being considered.
- If either location does not exist, proceed silently. Domain-modeling workflows create these artifacts lazily when terminology or durable decisions are resolved.

## Vocabulary

Use the canonical terms from `CONTEXT.md` in issue titles, specifications, hypotheses, tests, and implementation notes. Do not drift to synonyms that the glossary explicitly avoids.

If a necessary concept is missing, reconsider whether the new language is useful. Record genuine gaps through the domain-modeling workflow.

## Architectural decisions

Surface any conflict with an existing ADR explicitly rather than silently overriding the recorded decision.
