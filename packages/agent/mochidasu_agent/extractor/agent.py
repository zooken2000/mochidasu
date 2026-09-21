import os
from contextlib import contextmanager

from mochidasu_agent_connection import log_model_errors, log_tool_errors
from strands import Agent
from strands.hooks import HookCallback, HookProvider
from strands.models import BedrockModel

from .session import get_session_manager

SYSTEM_PROMPT = """
あなたは「もちだす」の読み取り係です。
ユーザーは、職場のサンクスカード・退職色紙・学生団体や学校の寄せ書きなど、
他人が「ユーザー本人について」書いた紙の写真を送ってきます。
目的は、その紙から「本人を説明する言葉」だけを取り出し、持ち歩ける形にすることです。

## 残すもの
- 本人の人柄・仕事ぶり・関わり方・強みを具体的に述べている言葉
- 具体的なエピソードを伴う感謝 (何をしてくれて、どう助かったか)

## 除外するもの (excluded_count に数える)
- 定型の挨拶だけのもの (「お疲れさまでした」「新天地でも頑張って」「元気でね」など)
- 本人への言及がない内輪ネタ・書き手自身の近況
- 絵やスタンプだけのもの

## ルール
- text は紙に書かれた言葉を原文のまま写す。要約・言い換え・誤字の修正はしない
- 1枚のメッセージの中で本人を説明している部分だけを抜き出してよい (前後の挨拶は落とす)
- 判読できない箇所は推測で埋めず、unreadable_count に数える
- 書き手の署名が読めれば writer に入れる。読めなければ null
- keywords は複数の phrases に共通する特徴を、本人を表す短い言葉にまとめる
- 出力は日本語

画像なしで質問された場合は、これまでに読み取った内容をもとに簡潔に答えてください。
"""

MODEL_ID = os.environ.get("MOCHIDASU_MODEL_ID", "global.anthropic.claude-sonnet-4-6")

AGENT_HOOKS: list[HookProvider | HookCallback] = [log_model_errors, log_tool_errors]


@contextmanager
def get_agent():
    yield Agent(
        name="Extractor",
        description="寄せ書き・サンクスカードから本人を説明する言葉を取り出すエージェント",
        model=BedrockModel(model_id=MODEL_ID),
        system_prompt=SYSTEM_PROMPT,
        tools=[],
        hooks=AGENT_HOOKS,
        session_manager=get_session_manager(),
    )
