/**
 * デモ用の見本データ。
 *
 * 架空の人物「佐藤 陽」宛の紙面5種（../../../../../design/Demo*.dc.html）の書き写し。
 * 実在の人物・実物の寄せ書きの内容は入れないこと。
 */

import type { Fragment, Reading, Source, Trait } from '../lib/reading';

const SOURCES: Source[] = [
  { id: 'school', label: '小学校の卒業寄せ書き', yearsAgo: 11, kind: 'photo' },
  { id: 'jhs', label: '中学の卒業寄せ書き', yearsAgo: 8, kind: 'photo' },
  { id: 'club', label: 'サークルのアルバム', yearsAgo: 4, kind: 'photo' },
  { id: 'work', label: '職場の退職色紙', yearsAgo: 0, kind: 'photo' },
  { id: 'cards', label: 'サンクスカード', yearsAgo: 3, kind: 'photo' },
];

const PINK = '#F3C6CF';
const GREEN = '#CFE3B0';
const BLUE = '#BFDCE8';

const FRAGMENTS: Fragment[] = [
  // ① 小学校（12人・残る0）
  ...[
    ['1年間たのしかった！中学でもよろしくね', 'まな'],
    ['はるくんへ わすれないでね！', 'ゆうと'],
    ['世界せいふく', 'こうき'],
    ['6年2組さいこう！！', 'りこ'],
    ['「あれ」またやろうな（笑）', 'しゅん'],
    ['ずっと友達だよ☆', 'あや'],
    ['給食のカレーまた食べたい', 'だいち'],
    ['はるのバカ！（うそ）', 'けんた'],
    ['これからもよろしく〜', 'ひな'],
    ['HARU かっこよく書いといた', 'そうた'],
    ['卒業おめでとう！！', 'みさき'],
    ['ぼくのこと忘れるなよ', 'はやと'],
  ].map(
    ([text, writer], i): Fragment => ({
      id: `school-${i}`,
      sourceId: 'school',
      text,
      writer,
      keep: false,
      confidence: 'high',
    }),
  ),

  // ② 中学（10人・残る2）
  {
    id: 'jhs-0',
    sourceId: 'jhs',
    text: '3年間ありがとう！高校でも元気でね',
    writer: 'さき',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'jhs-1',
    sourceId: 'jhs',
    text: '修学旅行の夜、最高だった（笑）',
    writer: 'たくみ',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'jhs-2',
    sourceId: 'jhs',
    text: '掃除の時間、いつも最後まで残ってたよね。ちょっと尊敬してた',
    writer: 'ゆい',
    keep: true,
    confidence: 'high',
    paper: '#FDFCF8',
  },
  {
    id: 'jhs-3',
    sourceId: 'jhs',
    text: '高校行っても連絡しろよ',
    writer: 'れん',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'jhs-4',
    sourceId: 'jhs',
    text: '例のノート返してね！',
    writer: 'かな',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'jhs-5',
    sourceId: 'jhs',
    text: '陽は怒らないから、何でも話しやすかった',
    writer: 'しょう',
    keep: true,
    confidence: 'high',
    paper: '#FDFCF8',
  },
  {
    id: 'jhs-6',
    sourceId: 'jhs',
    text: 'また文化祭しよう',
    writer: 'ひろき',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'jhs-7',
    sourceId: 'jhs',
    text: 'ずっと親友！',
    writer: 'あおい',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'jhs-8',
    sourceId: 'jhs',
    text: 'はるは優しいね',
    writer: 'めい',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'jhs-9',
    sourceId: 'jhs',
    text: 'Thank you!! 楽しかった',
    writer: 'りく',
    keep: false,
    confidence: 'high',
  },

  // ③ サークル（6人・残る2）
  {
    id: 'club-0',
    sourceId: 'club',
    text: '1年間おつかれさま！楽しかった〜',
    writer: 'まい',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'club-1',
    sourceId: 'club',
    text: '合宿の夜のアレは墓場まで',
    writer: 'こうへい',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'club-2',
    sourceId: 'club',
    text: '撤収のとき、一番動いてたのは陽だったと思う。みんな気づいてたよ',
    writer: 'なつみ',
    keep: true,
    confidence: 'high',
    paper: '#FDFCF8',
  },
  {
    id: 'club-3',
    sourceId: 'club',
    text: '写真係ありがとう！いい写真ばっかりだった',
    writer: 'ゆか',
    keep: true,
    confidence: 'partial',
    paper: '#FDFCF8',
  },
  {
    id: 'club-4',
    sourceId: 'club',
    text: 'これからもよろしく！',
    writer: 'けい',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'club-5',
    sourceId: 'club',
    text: '次の新歓も来てね',
    writer: 'あゆむ',
    keep: false,
    confidence: 'high',
  },

  // ④ 職場の色紙（10人・残る4）
  {
    id: 'work-0',
    sourceId: 'work',
    text: '今までありがとうございました。新天地でもがんばってください',
    writer: '店長',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'work-1',
    sourceId: 'work',
    text: 'お疲れさまでした！',
    writer: '田中',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'work-2',
    sourceId: 'work',
    text: '閉店作業、いつも最後まで付き合ってくれて本当に助かりました',
    writer: '林',
    keep: true,
    confidence: 'high',
    paper: GREEN,
  },
  {
    id: 'work-3',
    sourceId: 'work',
    text: '「佐藤さんに聞けば分かる」がみんなの合言葉でした',
    writer: '伊藤',
    keep: true,
    confidence: 'high',
    paper: BLUE,
  },
  {
    id: 'work-4',
    sourceId: 'work',
    text: 'また飲みに行きましょう！',
    writer: '木村',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'work-5',
    sourceId: 'work',
    text: '新人のとき何回も同じことを聞いたのに毎回ちゃんと教えてくれた',
    writer: '鈴木',
    keep: true,
    confidence: 'high',
    paper: PINK,
  },
  {
    id: 'work-6',
    sourceId: 'work',
    text: '体に気をつけて',
    writer: '山本',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'work-7',
    sourceId: 'work',
    text: '忙しい日ほど落ち着いていて、見ていて安心しました',
    writer: '中村',
    keep: true,
    confidence: 'partial',
    paper: BLUE,
  },
  {
    id: 'work-8',
    sourceId: 'work',
    text: 'これからも応援しています',
    writer: '小林',
    keep: false,
    confidence: 'high',
  },
  {
    id: 'work-9',
    sourceId: 'work',
    text: '休憩室のお菓子、誰か補充して（笑）',
    writer: '加藤',
    keep: false,
    confidence: 'high',
  },

  // ⑤ サンクスカード（3枚・残る2）
  {
    id: 'cards-0',
    sourceId: 'cards',
    text: 'レジが詰まったとき、何も言わずに隣に入ってくれた',
    writer: '太田',
    keep: true,
    confidence: 'high',
    paper: '#FDFCF8',
  },
  {
    id: 'cards-1',
    sourceId: 'cards',
    text: '棚卸し、最後の確認まで一緒にやってくれてありがとう',
    writer: '斎藤',
    keep: true,
    confidence: 'high',
    paper: '#FDFCF8',
  },
  {
    id: 'cards-2',
    sourceId: 'cards',
    text: 'いつもありがとう！',
    writer: '松井',
    keep: false,
    confidence: 'high',
  },
];

/** 強みの候補（将来エージェントが作る部分。見本では手書き） */
const TRAITS: Trait[] = [
  {
    id: 'stay',
    label: '最後まで持ち場を離れない',
    fragmentIds: ['jhs-2', 'club-2', 'cards-1', 'work-2'],
    questions: [
      '最後まで残っているとき、何を気にしていましたか？',
      '最近の仕事で、同じことをしていた場面はありますか？',
      'これが裏目に出たことはありますか？',
    ],
  },
  {
    id: 'calm',
    label: '落ち着いていて、話しかけやすい',
    fragmentIds: ['jhs-5', 'work-7'],
    questions: [
      '周りが慌てているとき、あなたは何を見ていますか？',
      '最近、誰かに相談されたのはどんな場面でしたか？',
    ],
  },
  {
    id: 'ask',
    label: '聞けば分かる、何度でも教える',
    fragmentIds: ['work-3', 'work-5'],
    questions: [
      '同じことを何度聞かれても、なぜ嫌にならなかったのでしょう？',
      '今の職場で、あなたに聞きに来る人はいますか？',
    ],
  },
];

export const SAMPLE_READING: Reading = {
  sources: SOURCES,
  fragments: FRAGMENTS,
  traits: TRAITS,
  isSample: true,
};
