import asyncio
import base64
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from mochidasu_agent.extractor import main
from mochidasu_agent.extractor.main import DEFAULT_EXTRACT_PROMPT, InvokeInput, build_content, handle_invoke
from mochidasu_agent.extractor.schema import MAX_IMAGE_BYTES, Extraction, ImageInput

PNG = base64.b64encode(b"\x89PNG\r\n\x1a\nfake").decode()


def sample_extraction() -> Extraction:
    return Extraction(
        source_type="退職色紙",
        phrases=[{"text": "最後まで投げ出さない人", "writer": "田中", "theme": "仕事ぶり", "reason": "具体的な特徴"}],
        keywords=[{"word": "やりきる", "count": 1}],
        excluded_count=3,
        unreadable_count=0,
    )


def test_image_input_rejects_invalid_base64():
    with pytest.raises(ValidationError):
        ImageInput(format="png", data="not base64!!")


def test_image_input_rejects_oversized_image():
    big = base64.b64encode(b"0" * (MAX_IMAGE_BYTES + 1)).decode()
    with pytest.raises(ValidationError):
        ImageInput(format="jpeg", data=big)


def test_build_content_uses_default_prompt_for_images():
    content = build_content(InvokeInput(images=[ImageInput(format="png", data=PNG)]))
    assert content[0]["image"]["format"] == "png"
    assert content[0]["image"]["source"]["bytes"].startswith(b"\x89PNG")
    assert content[-1] == {"text": DEFAULT_EXTRACT_PROMPT}


def test_build_content_text_only():
    assert build_content(InvokeInput(prompt=" 強みは？ ")) == [{"text": "強みは？"}]
    assert build_content(InvokeInput()) == []


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


def test_handle_invoke_with_images_yields_result(monkeypatch):
    extraction = sample_extraction()
    agent = FakeAgent(
        [
            {"event": {"contentBlockDelta": {"delta": {"text": "読んでいます"}}}},
            {"result": SimpleNamespace(structured_output=extraction)},
        ]
    )
    monkeypatch.setattr(main.app.state, "agent", agent, raising=False)

    chunks = asyncio.run(collect(InvokeInput(images=[ImageInput(format="png", data=PNG)])))

    assert agent.calls[0][1] == {"structured_output_model": Extraction}
    assert chunks[0].content == "読んでいます"
    assert chunks[-1].type == "result"
    assert chunks[-1].result == extraction


def test_handle_invoke_text_only_skips_structured_output(monkeypatch):
    agent = FakeAgent([{"event": {"contentBlockDelta": {"delta": {"text": "はい"}}}}])
    monkeypatch.setattr(main.app.state, "agent", agent, raising=False)

    chunks = asyncio.run(collect(InvokeInput(prompt="まとめて")))

    assert agent.calls[0][1] == {}
    assert [c.content for c in chunks] == ["はい"]


def test_handle_invoke_empty_input():
    chunks = asyncio.run(collect(InvokeInput()))
    assert chunks[0].content.startswith("画像か質問")
