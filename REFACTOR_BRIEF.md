# Letterwise — simplicity refactoring brief

Prepared 5 September 2026. This file is a reusable implementation prompt; creating it did not refactor the application.

## Inspected starting point
Angular 21, NestJS, Nx, Supabase and shared progress libraries.

## Project-specific scope
Keep Angular, Nx and NestJS. This is not a Hono migration. Existing short modules and shared progress contracts may already be appropriate; do not merge them just to reduce file count. Focus on any duplicated state handling, unnecessary indirection, and unclear sync flow discovered through inspection.

## Critical verification
Preserve guest offline progress, signed-in merges, account changes, JWT verification and user-scoped access. Run relevant web/API/shared-library tests and builds. Do not remove domain boundaries that keep progress behavior testable.

## Task
Refactor this project into clear, straightforward code that a developer can understand and maintain. Preserve working behavior and useful modern technologies. Treat “human-written” as a readability goal, not an authorship claim. Do not hide AI use or manufacture experience for a resume.

## First inspect
Read applicable workspace/project instructions, current Git status, package manifests, source, tests and runtime config. Treat the observations below as a starting point, not proof of current behavior. Identify up to three concrete sources of complexity with file references. A long file is a clue, not an automatic defect. Make a short plan and then implement in small, reviewable steps when this brief is explicitly invoked for implementation.

## Style target
- Prefer direct control flow, clear names, ordinary functions, and a small number of cohesive modules.
- Keep a short helper inline when naming or reusing it adds no value. Extract a helper when it expresses a real domain rule, removes meaningful duplication, isolates effects, or makes testing clearer.
- Avoid one-method wrapper classes, pass-through services, speculative abstractions, generic factories, and layers with only one unnecessary implementation.
- Do not replace many small files with one giant file. No arbitrary file-count, function-count, or line-count targets.
- Keep framework conventions that help the reader. Keep types, boundary validation, error handling, access control, and meaningful tests.
- Remove dead code and dependencies only after checking callers, scripts, runtime use and tests. Do not suppress errors with any, empty catch blocks, disabled checks, or forced success responses.
- Use comments for business reasons and non-obvious constraints, not narration of obvious code.
- Retain the current frontend and database unless a separate change is explicitly approved. Do not upgrade everything simply because newer versions exist.

## Migration and behavior safeguards
For any Express migration, first inventory methods, paths, request bodies, headers, cookies, status codes, auth, uploads, streaming, and error shapes. Verify current official Express and Cloudflare documentation for the actual runtime. Existing Express examples in sibling projects are references, not proof of compatibility.

Prove one route through the supported Worker/Node adapter using the project's actual development/runtime tests. Keep bindings and request context isolated; do not put per-request identity or tenant state in mutable process globals. Preserve scheduled/queue handlers and asset behavior where present. Preserve body size limits and raw bodies where signature verification needs them. Remove Hono only when callers, tests, and runtime entry points no longer require it. Do not leave a permanent Hono-like abstraction over Express.

Use meaningful before/after tests for changed behavior. Preserve public contracts unless a change is specifically approved. Record existing failures separately from regressions. Do not run scripts that mutate shared databases merely because they are labelled local or test.

## Boundaries
This brief does not authorize production changes, paid requests, secret rotation, database migrations, deployment, commits or pushes. Keep changes local for review unless the user separately asks for those actions. Preserve unrelated work. Stop on a concrete access or compatibility blocker and explain it; do not silently switch hosting, database or product scope.

## Completion evidence
Deliver a short summary of what was simplified and why, the final request/data flow, tests and builds actually run, remaining limitations, and any runtime differences. Compare the changed behavior to the baseline, not just the amount of code removed. Do not claim zero bugs or improved performance without evidence.

Add a short developer learning note with one request traced end to end, the reason for each remaining module, and how to reproduce the tests. Explain what the owner should be able to discuss in an interview. Resume evidence may describe only completed, verified work and must distinguish AI-assisted implementation from independently demonstrated understanding. Do not edit a resume as part of this refactor.
