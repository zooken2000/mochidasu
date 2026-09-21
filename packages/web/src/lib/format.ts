import type { Extraction, Phrase } from '../generated/extractor/types.gen';

export const THEME_ORDER: Phrase['theme'][] = [
  '強み',
  '仕事ぶり',
  '人柄',
  '関わり方',
  '感謝',
  'その他',
];

/** theme ごとにまとめ、THEME_ORDER の順で返す (空の theme は除く) */
export const groupByTheme = (
  phrases: Phrase[],
): { theme: Phrase['theme']; phrases: Phrase[] }[] =>
  THEME_ORDER.map((theme) => ({
    theme,
    phrases: phrases.filter((p) => p.theme === theme),
  })).filter((g) => g.phrases.length > 0);

/** 持ち歩き用のプレーンテキスト (メモアプリや職務経歴書に貼る想定) */
export const toPlainText = (extraction: Extraction): string => {
  const lines: string[] = [];
  if (extraction.keywords.length > 0) {
    lines.push(
      `■ よく言われること: ${extraction.keywords.map((k) => k.word).join(' / ')}`,
      '',
    );
  }
  for (const group of groupByTheme(extraction.phrases)) {
    lines.push(`■ ${group.theme}`);
    for (const p of group.phrases) {
      lines.push(`「${p.text}」${p.writer ? ` — ${p.writer}` : ''}`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
};
