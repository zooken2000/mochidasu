/**
 * 画面の文言（日本語・英語）。
 *
 * 言語は URL の ?lang=ja|en で決める。無ければブラウザの言語（日本語なら ja、それ以外は en）。
 * 引用（人が書いた言葉）は翻訳しない。
 */

export type Lang = 'ja' | 'en';

export const isLang = (v: unknown): v is Lang => v === 'ja' || v === 'en';

/** ブラウザの言語から既定の言語を決める */
export const detectLang = (languages: readonly string[] | undefined): Lang =>
  languages?.[0]?.toLowerCase().startsWith('ja') ? 'ja' : 'en';

const ja = {
  switchTo: 'English',
  switchLabel: 'Switch to English',

  // 時期
  thisYear: '今年',
  yearsAgo: (n: number) => `${n}年前`,
  spanYears: (n: number) => (n === 0 ? '今年' : `${n}年間`),
  unknownSource: '不明な素材',

  // トップ
  entry: {
    howLink: 'つかいかた',
    start: 'はじめる',
    eyebrow: '実家の押し入れと、引き出しの奥から',
    title: ['自分を説明する言葉は、', 'もう誰かが', '書いている。'],
    lead: '卒業アルバムの寄せ書き。退職のときの色紙。職場でもらったサンクスカード。あなたについて他人が書いた紙は、たいてい実家に置いたままです。引っ越しにも、結婚にも、持ち出さないまま。',
    read: '紙を読み込む',
    sample: 'サンプルの結果を見る',
    steps: [
      {
        no: '01',
        title: '読み込む',
        body: 'もらった紙を撮るだけ。書かれた言葉を1人分ずつに分けて読み取ります。',
      },
      { no: '02', title: '捨てる', body: '挨拶や定型句、内輪ネタを外します。' },
      {
        no: '03',
        title: '持ち出す',
        body: '残った言葉を、いつ・どの紙かを付けたテキストとしてコピーできます。',
      },
    ],
    footer:
      '表示中のサンプルは、架空の人物「佐藤 陽」さんに宛てた寄せ書きやカードです。',
  },

  // 読み込む
  upload: {
    step: 'ステップ 1 / 2　読み込む',
    title: 'もらった紙を、そのまま撮る',
    lead: '色紙、寄せ書き、サンクスカード、手紙。1枚に何人分書かれていても大丈夫です。時期の違う紙があるほど、共通点が見つかりやすくなります。',
    drop: '紙の写真をここに置く',
    dropHint: (max: number) =>
      `斜めに撮った写真でも読み取れます（最大${max}枚）。`,
    choose: '画像を選ぶ',
    recentTitle: '最近もらった言葉（任意）',
    recentHint:
      'ピアボーナスや Slack の感謝のメッセージなどを貼り付けると、昔の紙とのつながりが見えます。',
    recentLabelPlaceholder: '出どころ（例: 社内のピアボーナス）',
    recentLabelAria: '最近もらった言葉の出どころ',
    recentTextPlaceholder:
      '例: 障害対応のとき、最後まで一緒に原因を追ってくれて助かりました',
    recentDefaultLabel: '最近もらった言葉',
    sample: 'サンプルの結果を見る',
    read: '読み取る',
    reading: '読み取っています…',
    readingHint:
      '1〜2分かかることがあります。写真は読み取りにだけ使い、保存しません。',
    failed: '読み取りに失敗しました。',
    noResult: '結果が返ってきませんでした',
    listTitle: '読み込む紙',
    listEmpty:
      '写真を選ぶと、ここに1枚ずつ並びます。紙の種類と、何年前にもらったかを入れてください。',
    photoLabelPlaceholder: '例: 中学の卒業寄せ書き',
    photoLabelAria: (i: number) => `写真 ${i} の紙の種類`,
    photoFallback: (i: number) => `写真 ${i}`,
    yearsAgoSuffix: '年前',
    remove: (i: number) => `写真 ${i} を外す`,
  },

  // 画像の読み込み
  image: {
    cannotLoad: (name: string) =>
      `「${name}」を読み込めませんでした。JPEG か PNG で保存し直して試してください。`,
    heicTimeout: (name: string) =>
      `「${name}」（HEIC）を変換できませんでした。JPEG で保存し直すか、Safari で試してください。`,
    cannotProcess: '画像を処理できませんでした',
  },

  // 結果
  result: {
    showText: '文字起こしを表示する',
    sampleNote:
      'これはサンプルです（架空の人物「佐藤 陽」さんに宛てた寄せ書きやカード）。',
    tryOwn: '自分の紙で試す',
    howLink: 'つかいかた',
    keptTitle: (total: number, kept: number) => ({
      before: `${total}件のうち${kept}件。`,
      em: '書かれたままの形で',
      after: '残します。',
    }),
    keptLead:
      '文字に起こすのは、探しやすくするためです。読み返すときは、できれば紙の実物で、その人の字で読んでください。',
    confidenceHigh: 'はっきり読めた',
    confidencePartial: '一部読めない',
    firstOnly: (n: number) => `最初の${n}件だけにする`,
    showRest: (n: number) => `残り${n}件を見る`,
    dropped: (n: number) => `捨てた${n}件`,
    droppedTitle: (n: number) => `捨てた${n}件（挨拶・定型句・内輪ネタ）`,
    clipNote:
      '手書きの切り抜きの代わりに、読み取った文字を書体で表示しています。',
    carry: (n: number) =>
      `コピーしてメモアプリなどに貼っておけば、紙が実家にあっても、この${n}件をいつでも読み返せます。`,
    copy: (n: number) => `${n}件をコピーする`,
    copied: 'コピーしました',
    emptyTitle: 'まだ、読み取った結果はありません。',
    emptyLead:
      '結果は保存していないので、ページを再読み込みしたり、タブを閉じたりすると消えます。',
    read: '紙を読み込む',
    sample: 'サンプルの結果を見る',
  },

  // 強みの候補
  insight: {
    noneTitle: 'まだ、共通点は見つかりませんでした。',
    noneLead:
      '2人以上が同じことに触れていると、ここに出てきます。別の時期にもらった紙や、最近のメッセージを足してみてください。',
    title: {
      before: 'あなたが',
      em: '当たり前だと思っていること',
      after: '。',
    },
    leadSpan: (span: string, places: boolean) =>
      `${span}、${places ? '場所が変わっても、' : ''}別々の人が同じことを書いていました。`,
    leadSame: '別々の人が、同じことを書いていました。',
    leadTail: '自分では、たぶん書かないことです。',
    who: (writers: number, contexts: number, span: string) =>
      `${writers}人が${contexts > 1 ? `${contexts}つの場所で` : '同じ場所で'}・${span}`,
    close: '閉じる',
    open: '根拠を見る',
    ask: '自分に聞いてみること',
    askTail: '思い当たる最近の経験が、あなた自身の言葉になります。',
  },

  // 持ち出し用テキスト
  plain: {
    quote: (text: string) => `「${text}」`,
    by: (writer: string | undefined, label: string, when: string) =>
      writer ? `${writer}（${label}・${when}）` : `${label}・${when}`,
  },

  // つかいかた
  how: {
    sample: 'サンプル',
    start: 'はじめる',
    title: 'つかいかた',
    lead: '他人があなたについて書いた紙から、時期も場所も違う人たちが、別々に同じことを書いていた特徴を取り出します。本人が当たり前すぎて、自己紹介には書かないような特徴です。',
    steps: [
      {
        no: '01',
        title: '読み込む',
        body: '寄せ書きや色紙、サンクスカードの写真を選びます（最大6枚）。写真ごとに「紙の種類」と「何年前にもらったか」を入れます。ピアボーナスや Slack の感謝のメッセージを貼り付けることもできます。',
      },
      {
        no: '02',
        title: '捨てる',
        body: 'Amazon Bedrock の Claude が1人分ずつに分けて、具体的な言葉だけを残します。定型の挨拶や内輪ネタは外します。',
      },
      {
        no: '03',
        title: 'つなぐ',
        body: '2人以上が別々に触れている特徴を「あなたが当たり前だと思っていること」として出します。根拠の言葉を時期の古い順に並べ、最近の似た経験を思い出すための問いかけを添えます。',
      },
      {
        no: '04',
        title: '持ち出す',
        body: '残した言葉を、いつ・どの紙かを付けたテキストとしてコピーできます。',
      },
    ],
    tipsTitle: '写真の撮り方と入れ方',
    tips: [
      '1枚の写真には、紙を1枚だけ。真上から、明るい場所で撮ると読み取りやすくなります。',
      '写真は JPEG か PNG で。iPhone の HEIC は Safari ならそのまま読めます。Chrome では JPEG で保存し直してください。',
      '「何年前」は、「何年間、別々の人が同じことを書いていたか」を出すために使います。写真からは分からないので、だいたいで構いません。',
      '時期や場所の違う紙を混ぜるほど、共通点が見つかりやすくなります。書き手が1人だけの特徴は出しません。',
    ],
    promisesTitle: 'やらないこと',
    promises: [
      {
        title: '言い換えない',
        body: '取り出す言葉は、書かれたままです。貼り付けた文章から取った言葉は、原文に含まれているかをプログラムで確かめています。',
      },
      {
        title: '保存しない',
        body: '写真も文章も、サーバーに残しません。結果はこのタブの中だけにあり、再読み込みすると消えます。アカウントも要りません。',
      },
      {
        title: '代わりに書かない',
        body: '自己PR文は作りません。渡すのは根拠の言葉と問いかけまでで、話す言葉はあなたが作ります。',
      },
    ],
    read: '紙を読み込む',
    sampleResult: 'サンプルの結果を見る',
  },
};

export type Messages = typeof ja;

const en: Messages = {
  switchTo: '日本語',
  switchLabel: '日本語に切り替える',

  thisYear: 'This year',
  yearsAgo: (n: number) => (n === 1 ? '1 year ago' : `${n} years ago`),
  spanYears: (n: number) =>
    n === 0 ? 'this year' : n === 1 ? 'over 1 year' : `over ${n} years`,
  unknownSource: 'Unknown source',

  entry: {
    howLink: 'How it works',
    start: 'Start',
    eyebrow: 'From the back of the closet at your parents’ house',
    title: ['The words that', 'describe you have', 'already been written.'],
    lead: 'Messages in your yearbook. The card you got when you left a job. Thank-you notes from coworkers. The things other people wrote about you usually stay in a box at your parents’ house, left behind every time you move.',
    read: 'Scan your cards',
    sample: 'See a sample result',
    steps: [
      {
        no: '01',
        title: 'Scan',
        body: 'Just take a photo. The words are read and split into one message per person.',
      },
      {
        no: '02',
        title: 'Filter',
        body: 'Greetings, set phrases and inside jokes are left out.',
      },
      {
        no: '03',
        title: 'Take with you',
        body: 'Copy the kept messages as text, each with when and where you got it.',
      },
    ],
    footer:
      'The sample shows cards and messages written to “Haru Sato”, a fictional person.',
  },

  upload: {
    step: 'Step 1 of 2: Scan',
    title: 'Photograph the cards as they are',
    lead: 'Message boards, farewell cards, thank-you cards, letters. It is fine if one card has many people’s messages. Cards from different times of your life make shared traits easier to find.',
    drop: 'Drop photos of your cards here',
    dropHint: (max: number) =>
      `Photos taken at an angle are fine (up to ${max} photos).`,
    choose: 'Choose images',
    recentTitle: 'Recent messages (optional)',
    recentHint:
      'Paste thank-you messages from a peer bonus tool or Slack to see how they connect to the old cards.',
    recentLabelPlaceholder: 'Where it is from (e.g. peer bonus at work)',
    recentLabelAria: 'Where the recent messages are from',
    recentTextPlaceholder:
      'e.g. Thanks for staying with me until we found the cause of the outage.',
    recentDefaultLabel: 'Recent messages',
    sample: 'See a sample result',
    read: 'Read',
    reading: 'Reading…',
    readingHint:
      'This can take a minute or two. Photos are used only for reading and are not stored.',
    failed: 'Reading failed.',
    noResult: 'No result was returned',
    listTitle: 'Cards to read',
    listEmpty:
      'Photos you choose appear here, one per row. Enter the kind of card and how many years ago you got it.',
    photoLabelPlaceholder: 'e.g. Middle school yearbook',
    photoLabelAria: (i: number) => `Kind of card for photo ${i}`,
    photoFallback: (i: number) => `Photo ${i}`,
    yearsAgoSuffix: 'years ago',
    remove: (i: number) => `Remove photo ${i}`,
  },

  image: {
    cannotLoad: (name: string) =>
      `Could not load “${name}”. Save it as JPEG or PNG and try again.`,
    heicTimeout: (name: string) =>
      `Could not convert “${name}” (HEIC). Save it as JPEG, or try Safari.`,
    cannotProcess: 'Could not process the image',
  },

  result: {
    showText: 'Show transcription',
    sampleNote:
      'This is a sample (cards and messages written to “Haru Sato”, a fictional person).',
    tryOwn: 'Try with your own cards',
    howLink: 'How it works',
    keptTitle: (total: number, kept: number) => ({
      before: `${kept} of ${total} messages, `,
      em: 'kept as they were written',
      after: '.',
    }),
    keptLead:
      'The transcription makes the messages easy to find. When you read them again, read the real card, in the writer’s own handwriting, if you can.',
    confidenceHigh: 'Read clearly',
    confidencePartial: 'Partly unclear',
    firstOnly: (n: number) => `Show only the first ${n}`,
    showRest: (n: number) => `Show ${n} more`,
    dropped: (n: number) => `${n} left out`,
    droppedTitle: (n: number) =>
      `${n} left out (greetings, set phrases, inside jokes)`,
    clipNote:
      'Instead of the handwriting clipped from the photo, the transcribed text is shown in a handwriting-style font.',
    carry: (n: number) =>
      `Copy them into a notes app, and you can read these ${n} messages again anytime, even if the cards stay at home.`,
    copy: (n: number) => `Copy ${n} messages`,
    copied: 'Copied',
    emptyTitle: 'No result yet.',
    emptyLead:
      'Results are not stored, so they disappear when you reload the page or close the tab.',
    read: 'Scan your cards',
    sample: 'See a sample result',
  },

  insight: {
    noneTitle: 'No shared traits found yet.',
    noneLead:
      'Traits appear here when two or more people mention the same thing. Try adding cards from another time in your life, or recent messages.',
    title: {
      before: 'What you ',
      em: 'take for granted',
      after: '.',
    },
    leadSpan: (span: string, places: boolean) =>
      `${span[0].toUpperCase()}${span.slice(1)}${places ? ', in different places' : ''}, different people wrote the same thing.`,
    leadSame: 'Different people wrote the same thing.',
    leadTail: ' It is probably something you would not write about yourself.',
    who: (writers: number, contexts: number, span: string) =>
      `${writers} people${contexts > 1 ? ` in ${contexts} places` : ' in one place'} · ${span}`,
    close: 'Close',
    open: 'See the words',
    ask: 'Questions to ask yourself',
    askTail: 'A recent experience that comes to mind becomes your own words.',
  },

  plain: {
    quote: (text: string) => `“${text}”`,
    by: (writer: string | undefined, label: string, when: string) =>
      writer ? `${writer} (${label}, ${when})` : `${label}, ${when}`,
  },

  how: {
    sample: 'Sample',
    start: 'Start',
    title: 'How it works',
    lead: 'From cards other people wrote about you, mochidasu finds traits that different people, at different times and places, each wrote about. They are traits you take so much for granted that you would never put them in a self-introduction.',
    steps: [
      {
        no: '01',
        title: 'Scan',
        body: 'Choose photos of message boards, farewell cards or thank-you cards (up to 6). For each photo, enter the kind of card and how many years ago you got it. You can also paste thank-you messages from a peer bonus tool or Slack.',
      },
      {
        no: '02',
        title: 'Filter',
        body: 'Claude on Amazon Bedrock splits the text into one message per person and keeps only the specific ones. Greetings, set phrases and inside jokes are left out.',
      },
      {
        no: '03',
        title: 'Connect',
        body: 'Traits that two or more people mention separately are shown as “What you take for granted”, with the supporting words in time order and questions that help you recall a recent, similar experience.',
      },
      {
        no: '04',
        title: 'Take with you',
        body: 'Copy the kept messages as text, each with when and where you got it.',
      },
    ],
    tipsTitle: 'Taking and adding photos',
    tips: [
      'One card per photo. Shooting from straight above in good light makes reading easier.',
      'Use JPEG or PNG. iPhone HEIC photos work in Safari. In Chrome, save them as JPEG first.',
      '“Years ago” is used to show how many years different people have been writing the same thing. A photo cannot tell this, so a rough number is fine.',
      'Mixing cards from different times and places makes shared traits easier to find. A trait mentioned by only one person is not shown.',
    ],
    promisesTitle: 'What it does not do',
    promises: [
      {
        title: 'No rewording',
        body: 'The words are kept exactly as written. Quotes taken from pasted text are checked against the original by code.',
      },
      {
        title: 'No storage',
        body: 'Photos and text are not kept on the server. Results exist only in this tab and disappear when you reload. No account is needed.',
      },
      {
        title: 'No ghostwriting',
        body: 'It does not write a self-PR for you. It gives you the supporting words and questions; the words you speak are your own.',
      },
    ],
    read: 'Scan your cards',
    sampleResult: 'See a sample result',
  },
};

export const MESSAGES: Record<Lang, Messages> = { ja, en };

export const whenLabelIn = (lang: Lang, yearsAgo: number) =>
  yearsAgo === 0 ? MESSAGES[lang].thisYear : MESSAGES[lang].yearsAgo(yearsAgo);
