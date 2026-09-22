import {
  type Fragment,
  findSource,
  type Reading,
  type Trait,
  whenLabel,
} from './reading';

/** 残す／捨てるの件数 */
export const summarize = (fragments: Fragment[]) => {
  const kept = fragments.filter((f) => f.keep).length;
  return { total: fragments.length, kept, dropped: fragments.length - kept };
};

/** 持ち出し用のプレーンテキスト（メモアプリなどに貼る想定） */
export const toPlainText = (reading: Reading): string =>
  reading.fragments
    .filter((f) => f.keep)
    .map((f) => {
      const s = findSource(reading, f.sourceId);
      const by = f.writer
        ? `${f.writer}（${s.label}・${whenLabel(s.yearsAgo)}）`
        : `${s.label}・${whenLabel(s.yearsAgo)}`;
      return `「${f.text}」\n　— ${by}`;
    })
    .join('\n\n');

/** 強みの候補の根拠を、古い順に並べて期間をまとめる */
export const traitEvidence = (trait: Trait, reading: Reading) => {
  const quotes = trait.fragmentIds
    .map((id) => reading.fragments.find((f) => f.id === id))
    .filter((f): f is Fragment => f !== undefined)
    .map((f) => ({ ...f, source: findSource(reading, f.sourceId) }))
    .sort((a, b) => b.source.yearsAgo - a.source.yearsAgo);
  const years = quotes.map((q) => q.source.yearsAgo);
  return {
    quotes,
    writers: new Set(quotes.map((q) => `${q.sourceId}:${q.writer ?? q.id}`))
      .size,
    spanYears: years.length > 0 ? Math.max(...years) - Math.min(...years) : 0,
    contexts: new Set(quotes.map((q) => q.sourceId)).size,
  };
};
