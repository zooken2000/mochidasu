# mochidasu.agent

The `extractor` agent: a Strands agent (Python 3.14, FastAPI) that runs on Amazon Bedrock AgentCore Runtime and calls Claude Sonnet 4.6 on Amazon Bedrock.

## Request and response

`POST /invocations` with `images[]` (base64 JPEG/PNG/WebP/GIF, up to 6, plus `label` and `years_ago`) and/or `texts[]` (pasted messages). The response is a JSON Lines stream. The final line is `{"type":"result","result":{...}}` containing:

- `fragments[]`: every message, quoted verbatim, with `keep`, `reason`, `writer` and `confidence`
- `traits[]`: traits mentioned by two or more writers, with `fragment_indexes` and `questions`

## Key files

| File | Role |
|---|---|
| `mochidasu_agent/extractor/schema.py` | Input/output types (source of truth) |
| `mochidasu_agent/extractor/agent.py` | System prompt and model (`MOCHIDASU_MODEL_ID`) |
| `mochidasu_agent/extractor/main.py` | Builds the prompt from sources and streams the result |
| `mochidasu_agent/extractor/verify.py` | Drops quotes not found in pasted text, keeps only traits with 2+ writers |
| `mochidasu_agent/extractor/session.py` | No session storage (nothing is persisted) |

## Commands

```bash
pnpm nx run mochidasu.agent:extractor-dev   # http://localhost:8081 (docs at /docs)
pnpm nx test mochidasu.agent
```
