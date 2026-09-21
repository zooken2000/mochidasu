# mochidasu (もちだす)

> The words that describe you have already been written by someone else. mochidasu lets you carry them with you.

Thank-you cards, farewell boards, and yearbook messages are full of what other people noticed about you — but they sit in a box at your parents' house. **mochidasu** reads photos of those papers, keeps only the lines that actually describe *you* (dropping boilerplate like "good luck!" and inside jokes), and turns them into text you can take anywhere: a résumé, a self-introduction, or a note on your phone.

Built for the AWS Builder Center **Zero to Shipped** hackathon (#personal-expression / #community).

## How it works

1. Sign in (Amazon Cognito) and upload up to 6 photos of cards or message boards.
2. The browser resizes each photo and sends it to a Strands agent on **Amazon Bedrock AgentCore Runtime**.
3. Claude (via Amazon Bedrock) reads the handwriting and returns structured output:
   - `phrases` — lines quoted verbatim, tagged by theme (strengths, work style, personality, …) and writer
   - `keywords` — traits that recur across different writers
   - counts of excluded greetings and unreadable parts
4. One click copies everything as plain text.

The app UI is in Japanese.

## Architecture

| Package | What it is |
|---|---|
| `packages/web` | React (Vite) + shadcn/ui + Tailwind + TanStack Router, hosted on CloudFront + S3, Cognito sign-in |
| `packages/agent` | Python Strands agent `extractor` → Bedrock AgentCore Runtime (Cognito JWT auth, HTTP streaming, S3 session store) |
| `packages/infra` | AWS CDK app (`ApplicationStack`: UserIdentity / Extractor / Web) |
| `packages/common/*` | Shared CDK constructs, shadcn components, agent runtime helpers |

Scaffolded with [Nx Plugin for AWS](https://awslabs.github.io/nx-plugin-for-aws). The web client for the agent is generated from the agent's OpenAPI schema, so request/response types stay in sync.

## Getting started

Prerequisites: Node.js 22+, pnpm 10, [uv](https://docs.astral.sh/uv/), Python 3.14 (stable, not an rc), AWS credentials with Bedrock model access.

```bash
pnpm install
uv sync --all-packages

pnpm build                                   # lint, test, typecheck, bundle, cdk synth, checkov
pnpm nx bootstrap @mochidasu/infra           # first time only
pnpm nx deploy-sandbox @mochidasu/infra      # deploy your sandbox stack

# local web against the deployed backend
pnpm nx load-runtime-config @mochidasu/web
pnpm nx dev @mochidasu/web
```

The model can be changed with the `MOCHIDASU_MODEL_ID` environment variable on the agent runtime (default: `global.anthropic.claude-sonnet-4-6`).

## Privacy

Photos are sent only to your own AWS account. The session bucket is removed together with the stack (`RemovalPolicy.DESTROY`).
