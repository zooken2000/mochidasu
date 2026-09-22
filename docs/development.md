# 開発・デプロイ・トラブル対応

## 前提

| ツール | バージョン | 備考 |
|---|---|---|
| Node.js | 22 以上 | |
| pnpm | 10 | `npm i -g pnpm@10` または `brew install pnpm` |
| uv | 0.9 以上 | 0.8 系は Python 3.14 正式版を取得できない |
| Python | 3.14 **正式版** | `uv python install 3.14`。rc 版は pydantic がエラーになる |
| AWS CLI | 2 系 | Bedrock で Claude Sonnet 4.6 を使える認証情報 |

## セットアップ

```bash
pnpm install
uv sync --all-packages
```

初回は依存の取得に時間がかかる（回線によっては数十分）。2回目以降はキャッシュで速い。

## ローカルで動かす

```bash
export AWS_PROFILE=<プロファイル>
export AWS_REGION=<Claude Sonnet 4.6 を有効にしたリージョン>
pnpm nx dev @mochidasu/web
```

- 画面 http://localhost:4200 とエージェント http://localhost:8081 がまとめて起動する
- ログインなしで、画面は手元のエージェントを直接呼ぶ（署名なし）
- 課金は Bedrock の呼び出しだけ。写真や会話は保存しない
- エージェントの型を変えると、画面側のクライアント（`packages/web/src/generated/`）が自動で作り直される
- Nx の画面はキー入力待ちで残る。止めるときは `q`

エージェントだけを確かめる：

```bash
curl -N -X POST http://127.0.0.1:8081/invocations \
  -H 'Content-Type: application/json' \
  -d '{"texts":[{"text":"閉店作業、いつも最後まで付き合ってくれて助かりました","label":"テスト"}]}'
```

`{"type":"result", ...}` の行が最後に返れば成功。http://127.0.0.1:8081/docs でも試せる。

## テスト・ビルド

```bash
pnpm nx run-many -t lint typecheck test     # 速い確認
pnpm build                                  # 全部（バンドル・cdk synth・checkov を含む）
```

- エージェント：`packages/agent/tests/`（pytest）
- 画面：`packages/web/src/**/*.spec.ts`（vitest）
- checkov でのセキュリティ指摘を意図して抑止するときは、`suppressRules` で理由を書く

## デプロイ

```bash
aws sts get-caller-identity                 # 対象アカウントを確認
pnpm nx bootstrap @mochidasu/infra          # 初回のみ
pnpm nx deploy-sandbox @mochidasu/infra
```

デプロイ後、出力された CloudFront の URL を開く。手元の画面をデプロイ済みのエージェントにつなぐ場合：

```bash
pnpm nx load-runtime-config @mochidasu/web
pnpm nx serve @mochidasu/web
```

片付け（審査終了後）：

```bash
pnpm nx destroy-sandbox @mochidasu/infra
```

## コーディングエージェントを AWS につなぐ（提出要件）

Claude Code に AWS MCP Server（Agent Toolkit for AWS）を登録する。`env` を空にすると `default` の認証情報、`AWS_PROFILE` を渡すとそのプロファイルを使う。

```bash
claude mcp add-json aws-mcp '{"type":"stdio","command":"uvx","args":["mcp-proxy-for-aws-cli@latest","https://aws-mcp.us-east-1.api.aws/mcp","--metadata","AWS_REGION=us-east-1"],"env":{}}'
```

- Claude Code で `/mcp` を開き、`aws-mcp` が connected になっていることを確認する
- MCP はつないだ認証情報の権限で動く。専用のロールは作られない
- 提出用に、接続画面・アカウント確認・デプロイ確認のやり取りをスクリーンショットで残す

## 環境変数

| 変数 | 場所 | 用途 |
|---|---|---|
| `MOCHIDASU_MODEL_ID` | エージェント | モデルの切り替え（既定 `global.anthropic.claude-sonnet-4-6`） |
| `AWS_PROFILE` / `AWS_REGION` | ローカル | Bedrock の呼び出しに使う認証情報とリージョン |

## トラブル対応

| 症状 | 原因 | 対処 |
|---|---|---|
| 本番だけ「読み取りに失敗しました（…を読み込めませんでした）」 | 画面の Content-Security-Policy が `blob:` の画像を禁止している（ローカルの `pnpm nx dev` には CSP が付かないので起きない） | `packages/common/constructs/src/core/static-website.ts` の `img-src` に `blob:` があるか確認する（修正済み） |
| Chrome で HEIC を選ぶと30秒後に「変換できませんでした」 | 変換ライブラリが `unsafe-eval` を必要とし、CSP で許していない（意図どおり） | JPEG で保存し直す、または Safari を使う |
| 本番だけ `Unknown response status 403` | 標準フローのゲストの鍵に AWS のスコープダウンポリシーが付き、AgentCore を呼べない | Basic フローで鍵をもらう（`lib/guest-credentials.ts`、`GuestIdentity` の `allowClassicFlow`） |
| 本番で `424 Runtime initialization time exceeded` | エージェントの起動が30秒を超えた | CloudWatch の `/aws/bedrock-agentcore/runtimes/…` を見る。依存を減らしたあとは `dist/packages/agent` を消してから作り直す |
| 本番で `424 Runtime initialization time exceeded`、ログに `/var/task/bin/opentelemetry-instrument: … .venv/bin/python3: No such file or directory` | `uv pip install --target` が手元の Python のパスを起動スクリプトに書き込む（パスに空白があると `#!/bin/sh` 形式になる） | `bundle-arm` の最後で `scripts/fix_shebangs.py` が `#!/usr/bin/env python3` に書き換える |
| スタックが `UPDATE_FAILED`（`Replacement type updates not supported on stack with disable-rollback`） | `--express` で AppConfig の作り直しが必要な更新をした | 前回成功したテンプレートで EXPRESS のまま更新して `UPDATE_COMPLETE` に戻し、`--express` なしでデプロイし直す（`deploy-sandbox` は修正済み） |
| エージェントのログに `Unable to locate credentials` | そのターミナルに AWS の認証情報がない | `AWS_PROFILE` と `AWS_REGION` を設定してから起動し直す |
| `AccessDeniedException` | そのリージョンでモデルアクセスがない | Bedrock コンソールで Claude Sonnet 4.6 を有効にする |
| 共通点が出ない | 書き手が1人しかいない | 書き手の違う紙やメッセージを足す（2人以上が触れた特徴だけを出す仕様） |
| pydantic の `ForwardRef` エラー | Python 3.14 の rc 版を使っている | `uv python install 3.14` で正式版にし、`.venv` を作り直す |
| `aws login` でブラウザが真っ白 | サインイン画面の読み込み不良 | 別ブラウザ・シークレットウィンドウで URL を開く（`--remote`）。急ぐなら既存の認証情報を使う |
| 画面が古いまま | ファイル更新直後の古いタブ | `Cmd + Shift + R` で再読み込み |

## 書き換えてはいけないもの

- `packages/web/src/generated/`：OpenAPI からの自動生成物（git 管理外）
- `packages/web/src/routeTree.gen.ts`：TanStack Router の自動生成物
- `packages/common/agent_connection/`：Nx Plugin for AWS が生成したエージェント共通処理
