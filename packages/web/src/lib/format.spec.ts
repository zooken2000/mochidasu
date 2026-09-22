import { describe, expect, it } from 'vitest';
import { SAMPLE_READING } from '../demo/sample';
import { summarize, toPlainText, traitEvidence } from './format';
import { fitWithin, isHeic, stripDataUrl } from './image';
import { fromExtraction, type Reading, type Source } from './reading';

const reading: Reading = {
  sources: [
    { id: 'work', label: '職場の退職色紙', yearsAgo: 0, kind: 'photo' },
  ],
  fragments: [
    {
      id: 'a',
      sourceId: 'work',
      text: '最後まで付き合ってくれた',
      writer: '林',
      keep: true,
      confidence: 'high',
    },
    {
      id: 'b',
      sourceId: 'work',
      text: 'お疲れさまでした！',
      writer: '田中',
      keep: false,
      confidence: 'high',
    },
    {
      id: 'c',
      sourceId: 'work',
      text: '頼りになった',
      keep: true,
      confidence: 'high',
    },
  ],
  traits: [],
  isSample: false,
};

describe('summarize', () => {
  it('残す／捨てるを数える', () => {
    expect(summarize(reading.fragments)).toEqual({
      total: 3,
      kept: 2,
      dropped: 1,
    });
  });
  it('見本データは41件のうち10件を残す', () => {
    expect(summarize(SAMPLE_READING.fragments)).toEqual({
      total: 41,
      kept: 10,
      dropped: 31,
    });
  });
});

describe('toPlainText', () => {
  it('残す言葉だけを出典つきで出す。署名がなければ書き手は省く', () => {
    expect(toPlainText(reading)).toBe(
      '「最後まで付き合ってくれた」\n　— 林（職場の退職色紙・今年）\n\n「頼りになった」\n　— 職場の退職色紙・今年',
    );
  });
});

describe('traitEvidence', () => {
  it('根拠を古い順に並べ、人数・期間・場所の数を数える', () => {
    const e = traitEvidence(SAMPLE_READING.traits[0], SAMPLE_READING);
    expect(e.quotes.map((q) => q.writer)).toEqual([
      'ゆい',
      'なつみ',
      '斎藤',
      '林',
    ]);
    expect(e).toMatchObject({ writers: 4, spanYears: 8, contexts: 4 });
  });
  it('見本の強みの候補は、どれも2人以上が触れている', () => {
    for (const t of SAMPLE_READING.traits) {
      expect(traitEvidence(t, SAMPLE_READING).writers).toBeGreaterThanOrEqual(
        2,
      );
    }
  });
});

describe('fromExtraction', () => {
  const sources: Source[] = [
    { id: 'p0', label: '中学の卒業寄せ書き', yearsAgo: 8, kind: 'photo' },
    { id: 't0', label: 'ピアボーナス', yearsAgo: 0, kind: 'text' },
  ];
  it('素材番号を素材 ID に、fragment 番号を ID に置き換える', () => {
    const r = fromExtraction(
      {
        fragments: [
          {
            source: 0,
            text: '最後まで残ってた',
            writer: 'ゆい',
            keep: true,
            reason: '',
            confidence: 'high',
          },
          {
            source: 1,
            text: '助かりました',
            writer: null,
            keep: true,
            reason: '',
            confidence: 'partial',
          },
        ],
        traits: [
          {
            label: '最後まで残る',
            fragmentIndexes: [0, 1, 5],
            questions: ['最近は？'],
          },
        ],
        unreadableCount: 0,
      },
      sources,
    );
    expect(r.fragments.map((f) => [f.id, f.sourceId, f.writer])).toEqual([
      ['f0', 'p0', 'ゆい'],
      ['f1', 't0', undefined],
    ]);
    expect(r.traits[0]).toMatchObject({ id: 't0', fragmentIds: ['f0', 'f1'] });
    expect(r.isSample).toBe(false);
    expect(traitEvidence(r.traits[0], r).spanYears).toBe(8);
  });
});

describe('image helpers', () => {
  it('長辺が上限以下ならそのまま', () => {
    expect(fitWithin(800, 600, 2000)).toEqual({ width: 800, height: 600 });
  });
  it('長辺を上限に合わせて縮小する', () => {
    expect(fitWithin(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
  });
  it('HEIC を type か拡張子で見分ける', () => {
    expect(isHeic({ name: 'IMG_0001.HEIC', type: '' })).toBe(true);
    expect(isHeic({ name: 'photo', type: 'image/heif' })).toBe(true);
    expect(isHeic({ name: 'photo.jpg', type: 'image/jpeg' })).toBe(false);
  });
  it('data URL の接頭辞を外す', () => {
    expect(stripDataUrl('data:image/jpeg;base64,AAAA')).toBe('AAAA');
  });
});
