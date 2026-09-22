# もちだす — コーディングエージェント向けの指示

## 最初に読むもの

1. `README.ja.md`：全体像・構成・使用技術
2. `docs/concept.md`：コンセプトと抽出ルール
3. `docs/decisions.md`：決めたことと理由（見送った案を蒸し返さない）
4. `docs/development.md`：動かし方・デプロイ・トラブル対応
5. `../design/README.md`：UI デザインの控え（git の外。画面を変えるときは必ず見る）

## 進め方

- 会話は日本語
- **変更の前に方針を短く提案し、了承を得てから実装する。** 一度に大きく進めない
- デプロイ・削除・AWS リソースの変更は、実行前に必ず確認を取る

## 守ること

- **引用は原文のまま。** AI に言い換えさせない。貼り付け文章の照合（`verify.py`）を外さない
- **強みの候補は2人以上の書き手から。** この条件をプログラムから外さない
- **写真・文章を保存しない。** DB・S3・ローカルのファイルに残す処理を足さない
- **ログインを必須にしない。** 審査員が公開 URL からそのまま試せること
- **実在の人物の寄せ書きをリポジトリに入れない。** 見本は `packages/web/src/demo/sample.ts` の架空データだけ。実物は `../materials/`（git の外）
- 画面の配色・書体は `packages/web/src/styles.css` の `@theme` を使う（朱 `shu`、生成り `kinari` など）

## よく使うコマンド

```bash
pnpm nx dev @mochidasu/web                  # ローカル（画面 :4200 + エージェント :8081）
pnpm nx run-many -t lint typecheck test     # 速い確認
pnpm build                                  # 全部
```

## 触らないもの

- `packages/web/src/generated/`、`packages/web/src/routeTree.gen.ts`（自動生成）
- `packages/common/agent_connection/`（生成物）

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->
