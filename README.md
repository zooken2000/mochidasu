# mochidasu (もちだす)

> **The words that describe you have already been written by someone else.**

Yearbook messages, farewell boards and thank-you cards are full of things other people noticed about you. They usually end up in a box at your parents' house.

**mochidasu** reads photos of those papers and pulls out what you would never write about yourself: traits that **different people, years apart, kept pointing out**. Every line is quoted word for word. The AI never describes you in its own words.

Built for the AWS Builder Center **Zero to Shipped** hackathon.

日本語の説明は [README.ja.md](README.ja.md) にあります。

**Try it (no sign-in):** [Live demo](https://d1x77t2z0ibnhe.cloudfront.net/?lang=en) · [Sample result](https://d1x77t2z0ibnhe.cloudfront.net/sample?lang=en) · [How it works](https://d1x77t2z0ibnhe.cloudfront.net/how?lang=en)

![Entry page](docs/screenshots/entry.png)

The UI is available in English and Japanese (switch at the top right, or add `?lang=en` / `?lang=ja` to the URL). Quotes always stay in the language they were written in.

---

## What it does

![Upload page](docs/screenshots/upload.png)

1. **Read.** Upload photos of message boards or cards (JPEG or PNG, up to 6; iPhone HEIC photos work in Safari). For each one, enter what it is and how many years ago you got it. You can also paste recent messages, such as peer-bonus notes or Slack thanks.
2. **Filter.** Claude on Amazon Bedrock splits the messages by person and keeps only the specific ones. Greetings, set phrases and inside jokes are dropped.
3. **Connect.** Traits mentioned by **two or more different writers** become *"things you take for granted"*. Each one shows the original quotes in time order, plus a few questions that help you recall a recent example of your own. The trait labels and questions are written in the UI language; the quotes are never translated.
4. **Copy.** One click copies the kept quotes, with when and where each came from, as plain text.

Example from the built-in sample: in the notes to a fictional person, a middle-school classmate (8 years ago), a club friend (4 years ago), a coworker's thank-you card (3 years ago) and a farewell board (this year) all describe the same trait in different words: *"stays until the job is done."*

![Traits with the original quotes, in time order, and questions to ask yourself](docs/screenshots/result-traits.png)

![The kept messages, quoted word for word](docs/screenshots/result-messages.png)

## What it deliberately does not do

- **It does not rewrite or summarise the messages.** Lines taken from pasted text are checked against the original in code, and any that don't match are dropped.
- **It does not suggest a trait that only one person mentioned.** This is enforced in code, not left to the model.
- **It does not store photos or text.** There are no accounts and no database, and the agent keeps no session history. Results live only in your browser tab.
- **It does not write your self-PR for you.** It gives you the evidence and the questions. You find your own words.

## Architecture

![Architecture](docs/architecture/architecture.en.png)

| Layer | Service / library | Notes |
|---|---|---|
| Web | React + Vite, TanStack Router, Tailwind, shadcn/ui | Served from **Amazon CloudFront + S3** (private bucket, OAC, strict Content-Security-Policy). English and Japanese UI |
| Access | **Amazon Cognito identity pool** (guest identities, basic flow) + AWS STS | No sign-in. Guests get short-lived credentials that can **only** invoke the agent, and every request is SigV4-signed |
| Agent | **Strands Agents** (Python 3.14, FastAPI) on **Amazon Bedrock AgentCore Runtime** | IAM auth, HTTP streaming, structured output, in-memory only |
| Model | **Claude Sonnet 4.6 on Amazon Bedrock** | Reads handwriting and returns typed JSON (`fragments`, `traits`) |
| Config | AWS AppConfig | Runtime configuration for the agent |
| IaC | **AWS CDK** via **Nx Plugin for AWS** | One stack. The web client is generated from the agent's OpenAPI schema |

To keep hackathon costs low, the stack has no WAF, no user pool and no database.

## Built with coding agents

- **Claude (Cowork):** product design, UI implementation from the design mock, the English/Japanese UI, the agent and its verification logic, tests, and debugging in the developer's own browser. For example, it found that:
  - HEIC photos from an iPhone could not be read in Chrome;
  - guest credentials from the identity pool's default (enhanced) flow come with a scope-down policy that does not allow `bedrock-agentcore:InvokeAgentRuntime` (the fix was the basic flow plus STS);
  - the site's Content-Security-Policy blocked `blob:` images, so photos could not be resized in production.
- **Claude Code + AWS MCP Server (Agent Toolkit for AWS):** deployment and operations against the AWS account. It read the AgentCore Runtime logs in CloudWatch and found that the packaged start-up script pointed at the developer's local Python (fixed at build time by `scripts/fix_shebangs.py`). It also recovered a CloudFormation stack stuck in `UPDATE_FAILED` after an express-mode deploy.
- **Nx Plugin for AWS MCP server:** scaffolding and generators for the monorepo.

## Getting started

Requirements: Node.js 22+, pnpm 10, [uv](https://docs.astral.sh/uv/) 0.9+, Python 3.14 (stable release), and AWS credentials with access to Claude Sonnet 4.6 on Bedrock.

```bash
pnpm install
uv sync --all-packages

# Run everything locally. No deploy and no sign-in needed; only Bedrock is called
export AWS_PROFILE=<profile> AWS_REGION=<region with Claude enabled>
pnpm nx dev @mochidasu/web          # web on :4200, agent on :8081

# Build, test and deploy
pnpm build                          # lint, typecheck, test, bundle, cdk synth, checkov
pnpm nx bootstrap @mochidasu/infra  # first time only
pnpm nx deploy-sandbox @mochidasu/infra
```

See [docs/development.md](docs/development.md) for details and troubleshooting.

## Repository layout

```
packages/
  web/                 React app (routes: / entry, /upload, /result, /sample, /how)
  agent/               Strands agent "extractor" (schema.py, verify.py, agent.py, main.py)
  infra/               CDK app (ApplicationStack)
  common/constructs/   Shared CDK constructs (GuestIdentity, Extractor, Web)
  common/shadcn/       Shared UI components
  common/agent_connection/  Agent runtime helpers (generated)
docs/
  concept.md           Product concept and extraction rules (Japanese)
  decisions.md         Design decisions and why (Japanese)
  development.md       Local dev, deploy, troubleshooting (Japanese)
  architecture/        Architecture diagrams
  screenshots/         Screenshots of the app (fictional sample data)
```

## Roadmap

- Reuse the agent session within a browser tab, so only the first request waits for a cold start.
- Convert HEIC photos in Chrome as well (today the converter needs `unsafe-eval`, which the Content-Security-Policy does not allow).
- Show the actual handwriting: crop each message from the photo so it can be read in the writer's own hand.
- Connect to peer-bonus and thanks tools at work, so the words keep building up week after week instead of arriving once at graduation or a job change.
