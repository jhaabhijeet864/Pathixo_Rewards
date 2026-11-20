## Summary of Changes
<!-- Provide a brief description of what this PR introduces, fixes, or enhances. -->

## Subsystem Affected
- [ ] Extension Client (WXT / Manifest V3)
- [ ] Site Adapters (ChatGPT / Claude / Gemini / Perplexity / DeepSeek)
- [ ] Ad Engine Backend / API routes
- [ ] Web Marketing / Landing UI
- [ ] Advertiser Portal (/advertise)
- [ ] User Dashboard (/dashboard)

## Chrome Web Store & Privacy Checklist
- [ ] **Zero Prompt Reading**: No prompt text or AI generation content is accessed or logged.
- [ ] **No `innerHTML` Sinks**: Injected DOM nodes are created strictly via `createElement` and `textContent`.
- [ ] **Shadow DOM Isolation**: All card styling is encapsulated inside open Shadow DOM roots.
- [ ] **No Remote Executable Code**: Code runs entirely from the bundled extension package.
- [ ] **Single Purpose Permissions**: Only `storage` and declared AI host permissions are used.

## Verification & Status Checks
- [ ] `pnpm -r typecheck` passes with 0 errors.
- [ ] `pnpm --filter @pathixo/extension build` generates valid `.output/chrome-mv3`.
- [ ] `pnpm --filter @pathixo/web build` compiles Next.js pages successfully.
