"""モデルの出力を、決まりごとに合うよう後から整える。

- 貼り付けた文章から取った言葉は、原文に本当に含まれているかを照合する（言い換えを防ぐ）
- 強みの候補は、残した言葉だけを根拠にし、書き手が2人以上いるものだけにする
"""

import re

from .schema import Extraction, Trait

MIN_WRITERS = 2
MAX_TRAITS = 4


def _normalize(s: str) -> str:
    return re.sub(r"\s+", "", s)


def verify(extraction: Extraction, texts_by_source: dict[int, str]) -> Extraction:
    """texts_by_source: 貼り付けた文章の {素材番号: 原文}。写真の素材は含めない。"""
    fragments = list(extraction.fragments)

    # 貼り付けた文章は、原文に含まれない言葉を捨てる（写真は照合できないのでそのまま）
    for i, f in enumerate(fragments):
        original = texts_by_source.get(f.source)
        if original is not None and _normalize(f.text) not in _normalize(original):
            fragments[i] = f.model_copy(update={"keep": False, "reason": "原文と一致しないため除外"})

    traits: list[Trait] = []
    for t in extraction.traits:
        indexes = sorted({i for i in t.fragment_indexes if 0 <= i < len(fragments) and fragments[i].keep})
        writers = {(fragments[i].source, fragments[i].writer or f"#{i}") for i in indexes}
        if len(writers) < MIN_WRITERS:
            continue
        traits.append(t.model_copy(update={"fragment_indexes": indexes, "questions": t.questions[:3]}))

    traits.sort(key=lambda t: len(t.fragment_indexes), reverse=True)
    return extraction.model_copy(update={"fragments": fragments, "traits": traits[:MAX_TRAITS]})
