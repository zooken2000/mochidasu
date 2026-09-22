# @mochidasu/infra

The AWS CDK app. `src/stacks/application-stack.ts` defines one stack:

- `GuestIdentity`: Cognito identity pool with guest (unauthenticated) identities, allowed only to invoke the agent
- `Extractor`: the agent on Bedrock AgentCore Runtime (IAM auth, no session storage)
- `Web`: CloudFront + private S3 bucket (no WAF, to keep hackathon costs low)

## Commands

```bash
pnpm nx synth @mochidasu/infra
pnpm nx bootstrap @mochidasu/infra        # first time per account/region
pnpm nx deploy-sandbox @mochidasu/infra
pnpm nx destroy-sandbox @mochidasu/infra
```

`checkov` runs as part of the build. Intentional exceptions are marked with `suppressRules` and a reason.
