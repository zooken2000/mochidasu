from typing import Any, Literal

import uvicorn
from bedrock_agentcore.runtime.models import PingStatus
from pydantic import BaseModel, Field

from .init import JsonStreamingResponse, app
from .middleware.session_id_middleware import SessionIdMiddleware
from .schema import MAX_IMAGES, MAX_TEXTS, Extraction, ImageInput, SourceMeta, TextInput
from .verify import verify

DEFAULT_EXTRACT_PROMPT = "これらの素材から、私について書かれた言葉を読み取り、強みの候補をまとめてください。"

# 画面が英語のとき。引用（fragments.text）は翻訳させない
ENGLISH_OUTPUT_NOTE = (
    "画面は英語で表示します。traits の label と questions は英語で書いてください。"
    "fragments の text は原文のまま写し、翻訳しないでください。"
)


class InvokeInput(BaseModel):
    prompt: str = Field(default="", max_length=10000)
    images: list[ImageInput] = Field(default_factory=list, max_length=MAX_IMAGES)
    texts: list[TextInput] = Field(default_factory=list, max_length=MAX_TEXTS)
    language: Literal["ja", "en"] = "ja"


class StreamChunk(BaseModel):
    type: Literal["text", "result"] = "text"
    content: str = ""
    result: Extraction | None = None


def _heading(n: int, meta: SourceMeta, kind: str) -> str:
    when = "今年" if meta.years_ago == 0 else f"{meta.years_ago}年前"
    label = meta.label.strip() or kind
    return f"【素材{n}】{label}（{when}）"


def build_content(input: InvokeInput) -> tuple[list[dict[str, Any]], dict[int, str]]:
    """Strands に渡す ContentBlock と、照合用の {素材番号: 貼り付けた原文} を組み立てる。

    素材番号は写真 → 貼り付けた文章の順に 0 から振る。
    """
    content: list[dict[str, Any]] = []
    texts_by_source: dict[int, str] = {}
    n = 0
    for image in input.images:
        content.append({"text": _heading(n, image, "写真")})
        content.append({"image": {"format": image.format, "source": {"bytes": image.to_bytes()}}})
        n += 1
    for t in input.texts:
        content.append({"text": f"{_heading(n, t, '最近もらった言葉')}\n{t.text}"})
        texts_by_source[n] = t.text
        n += 1
    prompt = input.prompt.strip() or (DEFAULT_EXTRACT_PROMPT if n > 0 else "")
    if prompt:
        content.append({"text": prompt})
    if n > 0 and input.language == "en":
        content.append({"text": ENGLISH_OUTPUT_NOTE})
    return content, texts_by_source


async def handle_invoke(input: InvokeInput):
    """素材があれば構造化抽出、無ければ通常の会話としてストリームする"""
    content, texts_by_source = build_content(input)
    if not content:
        yield StreamChunk(content="写真か文章を送ってください。")
        return

    has_sources = bool(input.images or input.texts)
    kwargs: dict[str, Any] = {"structured_output_model": Extraction} if has_sources else {}

    stream = app.state.agent.stream_async(content, **kwargs)
    async for event in stream:
        text = event.get("event", {}).get("contentBlockDelta", {}).get("delta", {}).get("text")
        if text is not None:
            yield StreamChunk(content=text)
        elif event.get("event", {}).get("messageStop") is not None:
            yield StreamChunk(content="\n")
        elif "result" in event:
            structured = getattr(event["result"], "structured_output", None)
            if isinstance(structured, Extraction):
                yield StreamChunk(type="result", result=verify(structured, texts_by_source))


@app.post(
    "/invocations",
    response_class=JsonStreamingResponse,
    responses={200: JsonStreamingResponse.openapi_response(StreamChunk, "Stream of agent response chunks")},
)
async def invoke(input: InvokeInput) -> JsonStreamingResponse:
    """Entry point for agent invocation"""
    return JsonStreamingResponse(handle_invoke(input))


app.add_middleware(SessionIdMiddleware)


@app.get("/ping")
def ping() -> str:
    return PingStatus.HEALTHY


if __name__ == "__main__":
    uvicorn.run("mochidasu_agent.extractor.main:app", port=8080)
