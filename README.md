# AI-Powered Alcohol Label Verification App

Prototype for TTB-style alcohol label review. Agents can verify a label against expected
application fields, run an image-only compliance audit, or process a batch of labels from a CSV.

## What It Does

- **Verify**: upload one label image and compare it with expected COLA fields.
- **Audit**: upload a label image only; AI extracts fields and deterministic checks flag missing or invalid items.
- **Batch**: upload a CSV plus many label images; results stream into a table and can be exported.
- **Government Warning check**: requires the statutory text and the all-caps `GOVERNMENT WARNING:` heading.
- **Agent nuance**: formatting-only differences, such as `STONE'S THROW` vs `Stone's Throw`, become warnings instead of hard failures.

## Tech Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- shadcn/ui primitives
- Vercel AI SDK v6 structured output via `generateText` + `Output.object`
- AI Gateway model routing with `AI_GATEWAY_MODEL` (defaults to `openai/gpt-5.5`)
- No database or persistence for the prototype

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

For AI Gateway authentication, either:

- run `vercel link` and `vercel env pull .env.local` to use Vercel-provisioned auth, or
- set `AI_GATEWAY_API_KEY` in `.env.local`.

Optional model override:

```bash
AI_GATEWAY_MODEL=openai/gpt-5.5
```

## Batch CSV Format

The batch page includes a downloadable template. The required column is `imageFile`; it must match
the uploaded image filename exactly. Supported expected-field columns:

```csv
rowId,imageFile,beverageType,brandName,classType,alcoholContent,netContents,producerNameAddress,countryOfOrigin,governmentWarning
```

## Sample Labels

Sample labels are in `public/samples/` (served at `/samples/...`). Use the PNG files in the app; the SVG files are included as
editable source artwork.

- `old-tom-clean.png`: clean spirits label that should mostly pass.
- `stones-throw-casing.png`: brand casing/punctuation scenario for warning-tier review.
- `bad-warning.png`: malformed warning heading and paraphrased statutory text.
- `angled-photo.png`: angled/glare-style label to exercise image-quality handling.

## Architecture

The AI model only extracts visible text into a typed schema. Verification and compliance decisions
are plain TypeScript:

- `src/lib/extract.ts`: one vision + structured-output model call.
- `src/lib/compare.ts`: deterministic expected-vs-actual comparison.
- `src/lib/compliance.ts`: TTB-inspired required-field and warning-statement checks.
- `src/app/api/batch/route.ts`: concurrency-limited NDJSON streaming for batch results.

This split keeps the app explainable, fast, and easier to audit than asking the model to make every
compliance decision.

## Deploy

```bash
pnpm build
vercel
```

Enable AI Gateway for the Vercel project and configure auth via OIDC (`vercel env pull`) or
`AI_GATEWAY_API_KEY`.

## Assumptions and Trade-Offs

- Prototype only: no auth, no persistence, no audit log, and no COLA integration.
- English statutory warning text only.
- Uploads are limited to PNG, JPEG, GIF, or WEBP because those are the image formats accepted by
  the model endpoint. Images are handled directly by the vision model; there is no custom OCR or
  preprocessing pipeline.
- Batch rows are matched by exact filename, which is simple and explicit for reviewers.
- The sub-5 second target depends on image size, model selection, and provider latency. The UI sends
  one extraction request per label and streams batch results to minimize perceived wait time.

## Live Demo

Deployed at https://new-atp.vercel.app. The home page links to all three workflows; each has a
**Load sample** button that prefills the included `old-tom-clean.png` test label for one-click review.
