# AI-Powered Alcohol Label Verification App

Prototype for TTB-style alcohol label review. Agents can verify a label against expected
application fields, run a compliance-only audit, or process a batch of labels from a CSV.

## What It Does

- **Verify**: upload one label image and optionally compare it with expected COLA fields.
- **Compliance-only mode**: skip expected fields; AI extracts visible fields and deterministic checks flag missing or invalid items.
- **Batch**: upload many label images with an optional CSV; results stream into a table and can be exported.
- **Government Warning check**: requires the statutory text and the all-caps `GOVERNMENT WARNING:` heading.
- **Agent nuance**: formatting-only differences, such as `STONE'S THROW` vs `Stone's Throw`, become warnings instead of hard failures.

## Tech Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- shadcn/ui primitives
- Vercel AI SDK v6 structured output via `generateText` + `Output.object`
- AI Gateway model routing with `AI_GATEWAY_MODEL` (defaults to `openai/gpt-5.5`)
- GitHub Actions CI/CD with lint, unit tests, production build, dependency audit, and Vercel prebuilt deployments
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
the uploaded image filename exactly. Filenames must be unique within a batch. Supported expected-field columns:

```csv
rowId,imageFile,beverageType,brandName,classType,alcoholContent,netContents,producerNameAddress,countryOfOrigin,governmentWarning
```

Prototype limits are enforced server-side: up to 50 images per batch, 4 MB per image, 80 MB total
image bytes, 512 KB CSV files, 300 CSV rows, and 2,000 characters per CSV cell.

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

## Security and Privacy Notes

- Uploaded labels and CSV rows are processed in memory and are not stored by this app after the request completes.
- AI Gateway credentials are used only on the server. No `NEXT_PUBLIC_` secret is required.
- Label images may contain business-sensitive names, addresses, or artwork. In this prototype, those images are sent to the configured AI provider through AI Gateway for extraction; a production deployment would need a reviewed data-retention agreement and logging policy.
- Public AI-powered endpoints can be abused for cost or quota exhaustion. This prototype adds upload and batch limits plus sanitized error messages, but production should add authentication, rate limiting, audit logs, and per-user usage budgets.
- File MIME types from browsers are not a complete security boundary. Production should validate image signatures and dimensions with a safe decoder before model submission.
- Batch CSV exports escape spreadsheet formula prefixes such as `=`, `+`, `-`, and `@` to reduce CSV injection risk when reports are opened in Excel or similar tools.
- See `SECURITY.md` for the prototype security policy and production gaps.

## Performance Notes

Sarah's 5-second usability target informed the design:

- The model call is limited to extraction and uses low-detail image input.
- Compliance decisions are deterministic TypeScript checks rather than a second model call.
- Batch review runs up to five labels concurrently and streams NDJSON rows as each label finishes, so agents can start reviewing partial results.

## Deploy

```bash
pnpm build
vercel
```

Enable AI Gateway for the Vercel project and configure auth via OIDC (`vercel env pull`) or
`AI_GATEWAY_API_KEY`.

## CI/CD

The repository includes GitHub Actions workflows for a professional review and release path:

- `.github/workflows/ci.yml` runs `pnpm lint`, `pnpm test`, `pnpm build`, and a high-severity production dependency audit on pull requests and pushes to `main`.
- `.github/workflows/deploy.yml` runs the same local quality gate, builds with the Vercel CLI, and deploys prebuilt artifacts. Pull requests get preview deployments and a PR comment with the preview URL. Pushes to `main` deploy production.
- `.github/workflows/codeql.yml` runs GitHub CodeQL analysis on pull requests, pushes to `main`, and weekly scheduled scans.
- `.github/dependabot.yml` keeps npm and GitHub Actions dependencies current with weekly update PRs.
- `.github/pull_request_template.md` and `.github/CODEOWNERS` add review hygiene for security-sensitive changes.

Required repository secrets for deployment:

```bash
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

The Vercel project also needs AI Gateway auth configured for preview and production, either with
Vercel-provisioned credentials or `AI_GATEWAY_API_KEY`.

Recommended GitHub repository settings:

- Require the `CI / Lint, Test, Build`, `CI / Dependency Audit`, and `CodeQL` checks before merging to `main`.
- Require pull request review from CODEOWNERS.
- Configure `preview` and `production` GitHub environments. Add approval protection to `production` if this is used beyond the take-home demo.
- Enable Dependabot security updates and secret scanning.

## Assumptions and Trade-Offs

- Prototype only: no auth, no persistence, no audit log, no rate limiter, and no COLA integration.
- English statutory warning text only.
- Uploads are limited to PNG, JPEG, GIF, or WEBP because those are the image formats accepted by
  the model endpoint. Images are handled directly by the vision model; there is no custom OCR or
  preprocessing pipeline.
- Batch rows are matched by exact filename, which is simple and explicit for reviewers.
- The sub-5 second target depends on image size, model selection, provider latency, and deployment
  region. The UI sends one extraction request per label and streams batch results to minimize
  perceived wait time.

## Verification

```bash
pnpm lint
pnpm test
pnpm build
pnpm check
```

If AI Gateway credentials are available, also run one sample through `/verify` and one multi-image
batch from `/batch`.

## Live Demo

Deployed at https://new-atp.vercel.app. The home page links to the single-label and batch workflows;
the single-label page has a **Load sample** button that prefills the included `old-tom-clean.png`
test label for one-click review.
