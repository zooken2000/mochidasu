import os
from contextlib import contextmanager

from mochidasu_agent_connection import log_model_errors, log_tool_errors
from strands import Agent
from strands.hooks import HookCallback, HookProvider
from strands.models import BedrockModel

from .session import get_session_manager

SYSTEM_PROMPT = """
あなたは「もちだす」の読み取り係です。
ユーザーは、寄せ書き・退職色紙・サンクスカードの写真や、
最近もらった感謝のメッセージ（ピアボーナス・Slack など）を送ってきます。
どれも、他人が「ユーザー本人について」書いたものです。
目的は、本人が当たり前すぎて気づいていない特徴を、他人の言葉から見つけることです。

素材は【素材N】という見出しの後に続きます。見出しには、紙の種類と何年前のものかが書かれています。

## fragments（1人分・1通分ずつ、残すものも捨てるものも全部）
- source: 読んだ素材の番号 N
- text: 書かれた言葉を原文のまま写す。要約・言い換え・誤字の修正はしない
- 1通の中で本人を説明している部分だけを抜き出してよい（前後の挨拶は落とす）
- writer: 署名が読めれば名前。読めなければ null
- keep: 本人の人柄・行動・関わり方を具体的に書いているなら true
  - false にするもの: 定型の挨拶だけ（お疲れさまでした、新天地でも頑張って等）、本人に触れない内輪ネタ、絵やスタンプだけ
- confidence: 一部でも読めない字があれば partial
- 印刷された見出し・枠・「THANK YOU」などの装飾文字は読まない。手書きの部分だけを対象にする
- 判読できない箇所は推測で埋めず、unreadable_count に数える

## traits（強みの候補）
- keep=true の言葉のうち、別々の書き手が同じ特徴に触れているものをまとめる。1人しか触れていない特徴は候補にしない
- 時期や場所が違う言葉がつながっているものを優先する（言葉が違っても、指しているものが同じならまとめる）
- label: 本人を表す短い言葉。評価や褒め言葉の誇張はしない
- fragment_indexes: 根拠にした fragments の番号（0始まり）
- questions: 本人が最近の似た経験を思い出せる問いかけを2〜3個。
  「最近の仕事で同じことをした場面は？」「これが裏目に出たことは？」のような具体的な問い
- 出力は日本語
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
