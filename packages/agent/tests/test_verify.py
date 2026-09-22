from mochidasu_agent.extractor.schema import Extraction
from mochidasu_agent.extractor.verify import verify


def frag(source, text, writer, keep=True):
    return {"source": source, "text": text, "writer": writer, "keep": keep, "reason": "", "confidence": "high"}


def test_drops_pasted_text_that_is_not_in_the_original():
    e = Extraction(
        fragments=[frag(1, "何でも最後までやりきる人", "林")],
        traits=[],
        unreadable_count=0,
    )
    out = verify(e, {1: "閉店作業、いつも最後まで付き合ってくれた"})
    assert out.fragments[0].keep is False
    assert out.fragments[0].reason == "原文と一致しないため除外"


def test_keeps_pasted_text_found_in_original_ignoring_whitespace():
    e = Extraction(fragments=[frag(1, "最後まで 付き合ってくれた", "林")], traits=[], unreadable_count=0)
    out = verify(e, {1: "閉店作業、いつも最後まで\n付き合ってくれた"})
    assert out.fragments[0].keep is True


def test_photo_fragments_are_not_checked():
    e = Extraction(fragments=[frag(0, "写真から読んだ言葉", "ゆい")], traits=[], unreadable_count=0)
    assert verify(e, {}).fragments[0].keep is True


def test_traits_need_two_writers_and_kept_fragments_only():
    e = Extraction(
        fragments=[
            frag(0, "a", "ゆい"),
            frag(0, "b", "ゆい"),
            frag(1, "c", "林", keep=False),
            frag(2, "d", "なつみ"),
        ],
        traits=[
            {"label": "1人だけ", "fragment_indexes": [0, 1, 2], "questions": ["q"]},
            {"label": "2人", "fragment_indexes": [0, 3, 99], "questions": ["q1", "q2", "q3", "q4"]},
        ],
        unreadable_count=0,
    )
    out = verify(e, {})
    assert [t.label for t in out.traits] == ["2人"]
    assert out.traits[0].fragment_indexes == [0, 3]
    assert len(out.traits[0].questions) == 3


def test_unsigned_fragments_count_as_different_writers():
    e = Extraction(
        fragments=[frag(0, "a", None), frag(0, "b", None)],
        traits=[{"label": "署名なし", "fragment_indexes": [0, 1], "questions": ["q"]}],
        unreadable_count=0,
    )
    assert len(verify(e, {}).traits) == 1
