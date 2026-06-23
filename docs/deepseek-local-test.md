# DeepSeek Local Test

This document is for a small local verification of the real DeepSeek path. Do not commit API keys, PDF files, prompts, or extracted full paper text.

## Default Mock Mode

Run the app without a local environment file:

```bash
npm run dev
```

With the default configuration, Paper Detective uses the mock analysis path. `/cases`, `/case`, `/verdict`, and `/corrections` must not call DeepSeek.

## Real DeepSeek Test

Create `.env.local` manually on your machine. Do not commit it.

```bash
PAPER_DETECTIVE_AI_MODE=real
PAPER_DETECTIVE_AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_own_key_here
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_INPUT_CHARS=20000
DEEPSEEK_TIMEOUT_MS=45000
```

Restart the dev server after changing environment variables:

```bash
npm run dev
```

## Test A: Upload A Small PDF

Use a small text-layer PDF first, ideally 1-10 pages. Avoid long reviews for the first test.

1. Open `http://localhost:3000/`.
2. Select or drag a PDF.
3. Click the upload/continue button.
4. Open `http://localhost:3000/cases?paperId=paper_001`.

Upload is the only normal product path that should trigger DeepSeek. Refreshing `/cases`, `/case`, or `/verdict` should reuse cached analysis and must not call the model again.

## Test B: Demo Text Analysis Endpoint

If you want a no-PDF smoke test, use the explicit demo-text endpoint:

```text
http://localhost:3000/api/papers/paper_001/analysis?useDemoText=1
```

This route is for local diagnostics. It returns safe metadata and structured cases/evidence, but it must not expose prompts, API keys, full extracted paper text, or raw model responses.

## What To Observe

On `/cases?paperId=paper_001`, check the analysis diagnostics:

- `mode`: `real`, `fallback`, or `mock`
- `provider`: `deepseek` or `mock`
- `input`: current input character count and limit
- `fallback_reason`: shown only when the real path falls back

If `mode=real`:

- AI cases should use ids like `ai_case_001`.
- Evidence should use ids like `ai_evidence_001`.
- Evidence should prefer `source_type: "text"`.
- `text_anchor` should be an original sentence or short original passage.

If `mode=fallback`:

- The page should still render.
- `fallback_reason` should explain the failure category.
- No page should crash.

## End-To-End Check

1. Open `http://localhost:3000/cases?paperId=paper_001`.
2. Open an AI case such as `http://localhost:3000/case/ai_case_001?paperId=paper_001`.
3. Confirm RealPaperViewer appears.
4. Click sentences that match evidence anchors.
5. Confirm AI evidence progress increases.
6. After collecting all evidence, open the AI verdict page.

## Terminal Logs

Allowed diagnostic logs:

- `DeepSeek analysis started`
- mode, provider, model
- `input_char_count`
- `input_char_limit`
- sanitized fallback reason

Do not log:

- `DEEPSEEK_API_KEY`
- full extracted PDF text
- full prompt
- full raw DeepSeek response

## Cost Guardrails

- Start with `DEEPSEEK_MAX_INPUT_CHARS=20000`.
- Use a short PDF first.
- One upload should trigger at most one analysis call.
- Do not repeatedly upload the same file while testing.
- `/cases`, `/case`, `/verdict`, and `/corrections` should not trigger new model calls.

## Deployment Notes

Do not enable real DeepSeek mode in Vercel production yet. After local testing is stable, test in a Vercel preview environment first.

API keys must be configured only through Vercel Environment Variables. Never write keys into source files, `.env.example`, GitHub, logs, or screenshots.
