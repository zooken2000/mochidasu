"""入出力のスキーマ定義。

Web から受け取る素材（写真・貼り付けた文章）と、エージェントが返す構造化データの型をここにまとめる。
"""

import base64
import binascii
from typing import Literal

from pydantic import BaseModel, Field, field_validator

ImageFormat = Literal["png", "jpeg", "webp", "gif"]

# Bedrock の画像1枚あたりの上限 (3.75MB) に合わせる。base64 は元サイズの約4/3。
MAX_IMAGE_BYTES = 3_750_000
MAX_IMAGES = 6
MAX_TEXTS = 20
MAX_TEXT_CHARS = 2000


class SourceMeta(BaseModel):
    """素材1つ分の付帯情報（ユーザーが入力する）。"""

    label: str = Field(default="", max_length=60, description="紙の種類や出どころ（例: 中学の卒業寄せ書き）")
    years_ago: int = Field(default=0, ge=0, le=80, description="何年前にもらったか（今年 = 0）")


class ImageInput(SourceMeta):
    """ブラウザから送られる写真1枚 (base64)。"""

    format: ImageFormat
    data: str = Field(description="base64 エンコードされた画像データ (data URL の接頭辞なし)")

    @field_validator("data")
    @classmethod
    def _validate_base64(cls, value: str) -> str:
        try:
            raw = base64.b64decode(value, validate=True)
        except (binascii.Error, ValueError) as e:
            raise ValueError("data は base64 文字列である必要があります") from e
        if len(raw) > MAX_IMAGE_BYTES:
            raise ValueError(f"画像サイズが上限 ({MAX_IMAGE_BYTES} bytes) を超えています")
        return value

    def to_bytes(self) -> bytes:
        return base64.b64decode(self.data)


class TextInput(SourceMeta):
    """貼り付けた最近の言葉（ピアボーナス・Slack の感謝など）。"""

    text: str = Field(min_length=1, max_length=MAX_TEXT_CHARS)


# ---- エージェントの出力 ----


class Fragment(BaseModel):
    """1人分（1通分）のメッセージ。残すものも捨てるものも全部返す。"""

    source: int = Field(ge=0, description="何番目の素材から読んだか（【素材N】の N）")
    text: str = Field(description="書かれた言葉を原文のまま。要約・言い換え・誤字の修正はしない")
    writer: str | None = Field(default=None, description="署名が読めれば書き手の名前。無ければ null")
    keep: bool = Field(description="本人の人柄・行動・関わり方を具体的に書いているなら true")
    reason: str = Field(description="残す／捨てる理由を1文で")
    confidence: Literal["high", "partial"] = Field(description="読み取りの自信。一部読めない字があれば partial")


class Trait(BaseModel):
    """複数の書き手が、別々に触れている本人の特徴。"""

    label: str = Field(description="本人を表す短い言葉（例: 最後まで持ち場を離れない）")
    fragment_indexes: list[int] = Field(description="根拠になる fragments の番号（0始まり）")
    questions: list[str] = Field(description="本人が最近の経験を思い出すための問いかけ（2〜3個）")


class Extraction(BaseModel):
    """1回の読み取り結果。"""

    fragments: list[Fragment]
    traits: list[Trait] = Field(description="2人以上が別々に触れている特徴だけ。多い順に最大4つ")
    unreadable_count: int = Field(ge=0, description="判読できず読み飛ばした箇所の数")
