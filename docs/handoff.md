# 引き継ぎメモ（Cowork → Claude Code, 2026-09-21）

## 現状
- Nx Plugin for AWS で生成した雛形に、画像入力・構造化抽出（agent）、アップロード→結果表示（web）、ApplicationStack（infra）を実装済み
- クラウド環境では `pnpm build`（lint / test / typecheck / cdk synth / checkov）通過済み
- Mac ではまだ依存関係を入れていない。`git init` と `git add -A` のみ済み（未コミット）
- 仕様は `docs/concept.md`、残タスクは `docs/todo.md`

## この Mac でやること（順番に）
1. ツール確認・導入: Node.js 22+、pnpm 10（`npm i -g pnpm@10` または `brew install pnpm`）、uv 0.9+（`brew install uv` / `brew upgrade uv`）
2. `uv python install 3.14`（**3.14 正式版**。rc 版は pydantic の ForwardRef で落ちる）
3. `pnpm install && uv sync --all-packages`
4. `pnpm build` が通ることを確認（checkov のガイドライン取得エラーは警告のみで無視してよい）
5. ユーザーの確認後に初回コミット（ユーザー本人の git ユーザー名で）
6. デプロイはユーザーの確認後に: `pnpm nx bootstrap @mochidasu/infra` → `pnpm nx deploy-sandbox @mochidasu/infra`
   - 事前に `aws sts get-caller-identity` で対象アカウントを確認し、Bedrock で Claude Sonnet 4.6 のモデルアクセスがあるか確認

## 注意
- `../materials/` は実物の寄せ書き写真（個人情報）。git に入れない・外部に出さない
- Web の API クライアント（`packages/web/src/generated/`）は自動生成物。直接編集しない
- エージェントの入出力スキーマの正は `packages/agent/mochidasu_agent/extractor/schema.py`
