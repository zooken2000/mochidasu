import { describe, expect, it } from 'vitest';
import type { Extraction } from '../generated/extractor/types.gen';
import { groupByTheme, toPlainText } from './format';
import { fitWithin, stripDataUrl } from './image';

const extraction: Extraction = {
  sourceType: '退職色紙',
  phrases: [
    { text: 'いつも周りを見てくれていた', theme: '人柄', reason: '' },
    {
      text: '最後まで投げ出さない',
      writer: '田中',
      theme: '強み',
      reason: '',
    },
  ],
  keywords: [{ word: 'やりきる', count: 2 }],
  excludedCount: 3,
  unreadableCount: 0,
};

describe('groupByTheme', () => {
  it('THEME_ORDER の順に並べ、空の theme は除く', () => {
    expect(groupByTheme(extraction.phrases).map((g) => g.theme)).toEqual([
      '強み',
      '人柄',
    ]);
  });
});

describe('toPlainText', () => {
  it('キーワードと theme 別の原文を出力する', () => {
    expect(toPlainText(extraction)).toBe(
      [
        '■ よく言われること: やりきる',
        '',
        '■ 強み',
        '「最後まで投げ出さない」 — 田中',
        '',
        '■ 人柄',
        '「いつも周りを見てくれていた」',
      ].join('\n'),
    );
  });
});

describe('image helpers', () => {
  it('長辺が上限以下ならそのまま', () => {
    expect(fitWithin(800, 600, 2000)).toEqual({ width: 800, height: 600 });
  });
  it('長辺を上限に合わせて縮小する', () => {
    expect(fitWithin(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
  });
  it('data URL の接頭辞を外す', () => {
    expect(stripDataUrl('data:image/jpeg;base64,AAAA')).toBe('AAAA');
  });
});
