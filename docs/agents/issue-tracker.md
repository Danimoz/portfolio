# Issue tracker: GitHub

Issues and planning artifacts for this repository live as GitHub issues. Use the `gh` CLI for all operations and infer the repository from `git remote -v`.

## Conventions

- Create issues with `gh issue create`.
- Read issues and their comments with `gh issue view <number> --comments`.
- Query issues with `gh issue list` and appropriate label and state filters.
- Comment with `gh issue comment <number>`.
- Apply or remove labels with `gh issue edit <number>`.
- Close resolved issues with `gh issue close <number>`.

## Pull requests as a triage surface

External pull requests are not a request or triage surface. Pull requests remain implementation artifacts and do not enter the issue workflow automatically.

## Skill publishing conventions

When a skill says to publish work to the issue tracker, create a GitHub issue. When a skill asks for a ticket, read the corresponding GitHub issue and its comments.

## Wayfinding operations

The canonical Wayfinder map is a GitHub issue labelled `wayfinder:map`. Its child tickets use one of `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task`.

- Link tickets to the map with GitHub sub-issues. If sub-issues are unavailable, add each child to a task list in the map and put `Part of #<map>` at the top of its body.
- Represent blocking with GitHub's native issue dependencies. If dependencies are unavailable, put `Blocked by: #<number>` at the top of the blocked ticket.
- The frontier is the map's ordered set of open, unblocked, and unassigned child tickets.
- Claim a ticket by assigning it to the driving developer before doing any work.
- Resolve a ticket by posting its answer as a comment, closing it, and appending a linked one-line gist to the map's `Decisions so far` section.
