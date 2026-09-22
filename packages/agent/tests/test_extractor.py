import asyncio
import base64
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from mochidasu_agent.extractor import main
from mochidasu_agent.extractor.main import DEFAULT_EXTRACT_PROMPT, InvokeInput, build_content, handle_invoke
from mochidasu_agent.extractor.schema import MAX_IMAGE_BYTES, Extraction, ImageInput, TextInput

PNG = base64.b64encode(b"\x89PNG\r\n\x1a\nfake").decode()


def sample_extraction() -> Extraction:
    return Extraction(
        fragments=[
            {
                "source": 0,
                "text": "掃除の時間、いつも最後まで残ってた",
                "writer": "ゆい",
                "keep": True,
                "reason": "具体的な行動",
                "confidence": "high",
            },
            {
                "source": 1,
                "text": "閉店作業、最後まで付き合ってくれた",
                "writer": "林",
                "keep": True,
                "reason": "具体的な行動",
                "confidence": "high",
            },
        ],
        traits=[{"label": "最後まで残る", "fragment_indexes": [0, 1], "questions": ["最近同じことをした場面は？"]}],
        unreadable_count=0,
    )


def test_image_input_rejects_invalid_base64():
    with pytest.raises(ValidationError):
        ImageInput(format="png", data="not base64!!")


def test_image_input_rejects_oversized_image():
    big = base64.b64encode(b"0" * (MAX_IMAGE_BYTES + 1)).decode()
    with pytest.raises(ValidationError):
        ImageInput(format="jpeg", data=big)


def test_build_content_numbers_images_then_texts():
    content, texts = build_content(
        InvokeInput(
            images=[ImageInput(format="png", data=PNG, label="中学の卒業寄せ書き", years_ago=8)],
            texts=[TextInput(text="いつも助かってます", label="ピアボーナス")],
        )
    )
    assert content[0] == {"text": "【素材0】中学の卒業寄せ書き（8年前）"}
    assert content[1]["image"]["source"]["bytes"].startswith(b"\x89PNG")
    assert content[2] == {"text": "【素材1】ピアボーナス（今年）\nいつも助かってます"}
    assert content[-1] == {"text": DEFAULT_EXTRACT_PROMPT}
    assert texts == {1: "いつも助かってます"}


def test_build_content_text_only_prompt():
    content, texts = build_content(InvokeInput(prompt=" 強みは？ "))
    assert content == [{"text": "強みは？"}]
    assert texts == {}
    assert build_content(InvokeInput()) == ([], {})


class FakeAgent:
    def __init__(self, events):
        self.events = events
        self.calls = []

    async def stream_async(self, content, **kwargs):
        self.calls.append((content, kwargs))
        for e in self.events:
            yield e


async def collect(input):
    return [c async for c in handle_invoke(input)]


def test_handle_invoke_with_sources_yields_verified_result(monkeypatch):
    agent = FakeAgent(
        [
            {"event": {"contentBlockDelta": {"delta": {"text": "読んでいます"}}}},
            {"result": SimpleNamespace(structured_output=sample_extraction())},
        ]
    )
    monkeypatch.setattr(main.app.state, "agent", agent, raising=False)

    chunks = asyncio.run(
        collect(
            InvokeInput(
                images=[ImageInput(format="png", data=PNG)],
                texts=[TextInput(text="閉店作業、最後まで付き合ってくれた。ありがとう")],
            )
        )
    )

    assert agent.calls[0][1] == {"structured_output_model": Extraction}
    assert chunks[0].content == "読んでいます"
    assert chunks[-1].type == "result"
    assert chunks[-1].result.traits[0].fragment_indexes == [0, 1]


def test_handle_invoke_text_only_skips_structured_output(monkeypatch):
    agent = FakeAgent([{"event": {"contentBlockDelta": {"delta": {"text": "はい"}}}}])
    monkeypatch.setattr(main.app.state, "agent", agent, raising=False)

    chunks = asyncio.run(collect(InvokeInput(prompt="まとめて")))

    assert agent.calls[0][1] == {}
    assert [c.content for c in chunks] == ["はい"]


def test_handle_invoke_empty_input():
    chunks = asyncio.run(collect(InvokeInput()))
    assert chunks[0].content.startswith("写真か文章")
