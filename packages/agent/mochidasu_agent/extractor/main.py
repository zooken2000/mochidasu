from typing import Any, Literal

import uvicorn
from bedrock_agentcore.runtime.models import PingStatus
from pydantic import BaseModel, Field

from .init import JsonStreamingResponse, app
from .middleware.session_id_middleware import SessionIdMiddleware
from .schema import MAX_IMAGES, Extraction, ImageInput

DEFAULT_EXTRACT_PROMPT = "この紙から、私を説明する言葉を取り出してください。"


class InvokeInput(BaseModel):
    prompt: str = Field(default="", max_length=10000)
    images: list[ImageInput] = Field(default_factory=list, max_length=MAX_IMAGES)


class StreamChunk(BaseModel):
    type: Literal["text", "result"] = "text"
    content: str = ""
    result: Extraction | None = None


def build_content(input: InvokeInput) -> list[dict[str, Any]]:
    """Strands に渡す ContentBlock のリストを組み立てる。"""
    content: list[dict[str, Any]] = [
        {"image": {"format": image.format, "source": {"bytes": image.to_bytes()}}} for image in input.images
    ]
    text = input.prompt.strip() or (DEFAULT_EXTRACT_PROMPT if input.images else "")
    if text:
        content.append({"text": text})
    return content


async def handle_invoke(input: InvokeInput):
    """画像があれば構造化抽出、無ければ通常の会話としてストリームする"""
    content = build_content(input)
    if not content:
        yield StreamChunk(content="画像か質問を送ってください。")
        return

    kwargs: dict[str, Any] = {}
    if input.images:
        kwargs["structured_output_model"] = Extraction

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
                yield StreamChunk(type="result", result=structured)


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
    # TODO: if running an async task, return PingStatus.HEALTHY_BUSY
    return PingStatus.HEALTHY


if __name__ == "__main__":
    uvicorn.run("mochidasu_agent.extractor.main:app", port=8080)
