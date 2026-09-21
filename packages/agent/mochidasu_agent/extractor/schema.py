"""入出力のスキーマ定義。

エージェントが返す構造化データと、Web から受け取る画像入力の型をここにまとめる。
"""

import base64
import binascii
from typing import Literal

from pydantic import BaseModel, Field, field_validator

ImageFormat = Literal["png", "jpeg", "webp", "gif"]

# Bedrock の画像1枚あたりの上限 (3.75MB) に合わせる。base64 は元サイズの約4/3。
MAX_IMAGE_BYTES = 3_750_000
MAX_IMAGES = 6


class ImageInput(BaseModel):
    """ブラウザから送られる画像1枚 (base64)。"""

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


Theme = Literal["人柄", "仕事ぶり", "関わり方", "強み", "感謝", "その他"]


class Phrase(BaseModel):
    """紙から取り出した、本人を説明する一節。"""

    text: str = Field(description="紙に書かれた言葉を原文のまま。要約・言い換えはしない")
    writer: str | None = Field(default=None, description="署名があれば書き手の名前。無ければ null")
    theme: Theme = Field(description="この言葉が本人のどんな面を説明しているか")
    reason: str = Field(description="なぜ本人を説明する言葉と判断したか (1文)")


class Keyword(BaseModel):
    """複数の書き手に共通して現れる、本人を表す短い言葉。"""

    word: str = Field(description="本人を表す短い言葉 (例: 「最後までやりきる」)")
    count: int = Field(ge=1, description="この特徴に触れている Phrase の数")


class Extraction(BaseModel):
    """1回の読み取り結果。"""

    source_type: str = Field(description="紙の種類の推定 (サンクスカード / 退職色紙 / 卒業寄せ書き など)")
    phrases: list[Phrase] = Field(description="本人を説明する言葉だけを残したもの")
    keywords: list[Keyword] = Field(description="phrases に繰り返し現れる特徴。多い順に最大5件")
    excluded_count: int = Field(ge=0, description="定型の挨拶・内輪ネタ等として除外したメッセージの数")
    unreadable_count: int = Field(ge=0, description="判読できず読み飛ばした箇所の数")
