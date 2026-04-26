---
name: refactoring
description: Pick up an existing GitHub issue labeled "refactoring" and implement the fix; if none exist, audit the codebase for cleanliness/modularity/OO improvements and file new "refactoring" issues for what you find.
allowed-tools: [Bash, Read, Glob, Grep, Edit, Write]
---

# Refactoring Skill

Drives a single-pass refactoring workflow against the current GitHub repo. Either consume one open `refactoring` issue, or — if the queue is empty — generate the next batch.

Assume the `refactoring` label already exists on the repo. Do not try to create it.

## Step 1 — Look for existing work

Run:

```bash
gh issue list --label refactoring --state open --json number,title,body,url
```

- If **one or more** issues come back → go to Step 2.
- If the list is **empty** → go to Step 3.

## Step 2 — Implement one issue

1. Pick the issue — prefer the lowest-numbered open one unless the user named a specific issue in `$ARGUMENTS`.
2. Read the body in full. If it references files/lines, read those first with Read/Grep before editing.
3. Implement the change. Stay tightly scoped — do not bundle in unrelated cleanups.
4. After editing, run the project's verification commands (check `CLAUDE.md` for the right invocations — e.g. typecheck, build, tests). Fix anything you broke.
5. If `CLAUDE.md` says docs need updating after source changes (e.g. `docs/source-guide.md`), update them.
6. Report to the user: which issue, what changed, what you ran, and the result. **Do not commit, push, or close the issue** unless the user explicitly asks — leave that to them.

Stop after one issue. Do not chain into another.

## Step 3 — Audit the codebase and file issues

Only run this branch when Step 1 returned zero open `refactoring` issues.

1. Survey the source tree (Glob + Read). Focus on signals that produce real refactoring work:
   - Duplicated logic across files that should be a shared util/module
   - Long functions or classes doing more than one thing (SRP violations)
   - Leaky abstractions — types/state that cross boundaries they shouldn't
   - Weak OO design — missing polymorphism, type-switches that should be subclasses, public surface that should be private
   - Tight coupling that blocks testability (especially: pure logic tangled with framework/IO code — note any `CLAUDE.md` testability rules)
   - Dead code, stale TODOs, commented-out blocks
   - Inconsistent naming or module boundaries

2. For each genuinely worthwhile finding, file an issue:

   ```bash
   gh issue create --label refactoring --title "<concise title>" --body "$(cat <<'EOF'
   ## Problem
   <what's wrong, with file:line references>

   ## Proposed refactor
   <concrete change — name new modules/functions, describe the new shape>

   ## Why it matters
   <readability / testability / coupling / etc — one or two sentences>

   ## Scope
   <files touched, anything explicitly out of scope>
   EOF
   )"
   ```

3. Quality bar — be selective:
   - Skip nitpicks (formatting, single renames, style preferences without substance).
   - Skip speculative refactors driven by hypothetical future needs.
   - Skip anything that would require a feature decision rather than a structural cleanup.
   - Aim for **up to 5 issues** in one pass. If you can't find 5 that clear the bar, file fewer — zero is a valid answer.
   - One distinct concern per issue. Don't bundle.

4. Report to the user: a short list of issues filed (number + title + URL from `gh`'s output), or "no refactoring opportunities worth filing" if nothing cleared the bar.

## Notes

- `$ARGUMENTS` may contain a specific issue number to target — honor it instead of auto-picking in Step 2.
- If `gh` is not authenticated or the repo has no remote, surface that clearly and stop — don't fall back to local-only behavior.
- Never edit code in Step 3. That branch only files issues.
