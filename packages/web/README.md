# @mochidasu/web

The mochidasu web app: React + Vite, TanStack Router, Tailwind CSS and shadcn/ui. The UI is in Japanese and English (`?lang=ja|en`, defaulting to the browser language).

| Route | Screen |
|---|---|
| `/` | Entry page (no sign-in). Links to the built-in sample |
| `/upload` | Add photos (with "what it is" and "years ago") and/or paste recent messages, then call the agent |
| `/result` | Your own result: "Things you take for granted" (traits with quotes and questions) and the kept/dropped messages. Kept only in the tab |
| `/sample` | The built-in sample (fictional), always available |
| `/how` | How it works, photo tips, and what the app does not do |

## Key files

- `src/lib/reading.ts`: the data shape shared by real results and the sample (`fromExtraction` converts the agent's output)
- `src/lib/format.ts`: counts, trait evidence (sorted by year), plain-text export
- `src/lib/image.ts`: resizes photos to a 2000px JPEG before upload
- `src/lib/i18n.ts`, `src/hooks/useLang.ts`: Japanese and English text, language from `?lang`
- `src/hooks/useSigV4.tsx`: signs agent requests with guest credentials from the Cognito identity pool (skipped in local dev)
- `src/demo/sample.ts`: the fictional sample data
- `src/generated/`: typed agent client generated from the agent's OpenAPI schema (do not edit, git-ignored)

## Commands

```bash
pnpm nx dev @mochidasu/web      # web + local agent, no sign-in
pnpm nx test @mochidasu/web
pnpm nx build @mochidasu/web
```
