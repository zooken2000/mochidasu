import type { Extraction } from '../generated/extractor/types.gen';
import { type Lang, MESSAGES, whenLabelIn } from './i18n';

/** 紙1枚・貼り付け1件などの素材 */
export type Source = {
  id: string;
  label: string;
  /** 何年前にもらったか（今年 = 0） */
  yearsAgo: number;
  kind: 'photo' | 'text';
};

/** 1人分（1通分）のメッセージ */
export type Fragment = {
  id: string;
  sourceId: string;
  text: string;
  writer?: string;
  /** 本人を説明する言葉として残すか */
  keep: boolean;
  confidence: 'high' | 'partial';
  /** 付箋・色画用紙などの紙の色（見本の切り抜き表示用） */
  paper?: string;
};

/** 強みの候補。複数の書き手が別々に触れている特徴 */
export type Trait = {
  id: string;
  label: string;
  fragmentIds: string[];
  questions: string[];
};

/** 1回分の読み取り結果 */
export type Reading = {
  sources: Source[];
  fragments: Fragment[];
  traits: Trait[];
  /** 見本データかどうか */
  isSample: boolean;
};

export const whenLabel = (yearsAgo: number, lang: Lang = 'ja') =>
  whenLabelIn(lang, yearsAgo);

export const findSource = (
  reading: Reading,
  id: string,
  lang: Lang = 'ja',
): Source =>
  reading.sources.find((s) => s.id === id) ?? {
    id,
    label: MESSAGES[lang].unknownSource,
    yearsAgo: 0,
    kind: 'photo',
  };

/**
 * エージェントの結果を、画面で使う形に変換する。
 * sources はリクエストで送った順（写真 → 貼り付けた文章）に並べておくこと。
 */
export const fromExtraction = (
  extraction: Extraction,
  sources: Source[],
): Reading => {
  const fragments: Fragment[] = extraction.fragments.map((f, i) => ({
    id: `f${i}`,
    sourceId: sources[f.source]?.id ?? `s${f.source}`,
    text: f.text,
    writer: f.writer ?? undefined,
    keep: f.keep,
    confidence: f.confidence,
  }));
  const traits: Trait[] = extraction.traits.map((t, i) => ({
    id: `t${i}`,
    label: t.label,
    fragmentIds: t.fragmentIndexes
      .filter((n) => n >= 0 && n < fragments.length)
      .map((n) => `f${n}`),
    questions: t.questions,
  }));
  return { sources, fragments, traits, isSample: false };
};
