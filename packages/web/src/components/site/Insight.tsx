import { useState } from 'react';
import { traitEvidence } from '../../lib/format';
import { type Reading, type Trait, whenLabel } from '../../lib/reading';

/** 期間の言い方（0年 = 今年だけ） */
const spanLabel = (years: number) => (years === 0 ? '今年' : `${years}年間`);

const TraitCard = ({
  trait,
  reading,
  open,
  onToggle,
}: {
  trait: Trait;
  reading: Reading;
  open: boolean;
  onToggle: () => void;
}) => {
  const { quotes, writers, spanYears, contexts } = traitEvidence(
    trait,
    reading,
  );
  const panelId = `trait-${trait.id}`;

  return (
    <li className="rounded-[3px] border border-edge bg-sheet">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="flex flex-col gap-1.5">
          <span className="font-mincho text-[21px] font-semibold text-ink">
            {trait.label}
          </span>
          <span className="text-xs text-ink-4">
            {writers}人が{contexts > 1 ? `${contexts}つの場所で` : '同じ場所で'}
            ・{spanLabel(spanYears)}
          </span>
        </div>
        <span className="shrink-0 text-[13px] text-shu">
          {open ? '閉じる' : '根拠を見る'}
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          className="grid gap-8 border-t border-edge px-6 py-6 lg:grid-cols-[3fr_2fr]"
        >
          <ol className="relative flex flex-col gap-5 border-l border-line-strong pl-6">
            {quotes.map((q) => {
              const s = q.source;
              return (
                <li key={q.id} className="relative">
                  <span
                    className="absolute top-[9px] -left-[29px] size-[9px] rounded-full bg-shu"
                    aria-hidden="true"
                  />
                  <span className="text-[11px] tracking-[0.12em] text-ink-5">
                    {whenLabel(s.yearsAgo)}　{s.label}
                  </span>
                  <p className="mt-1 font-mincho text-base leading-[1.9] text-ink-2">
                    「{q.text}」
                  </p>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-col gap-3 rounded-[3px] bg-kinari px-5 py-5">
            <span className="text-xs tracking-[0.14em] text-warn-fg">
              自分に聞いてみること
            </span>
            <ul className="flex flex-col gap-3">
              {trait.questions.map((question) => (
                <li key={question} className="text-sm leading-[1.8] text-ink-2">
                  {question}
                </li>
              ))}
            </ul>
            <span className="mt-1 text-xs leading-[1.8] text-ink-4">
              思い当たる最近の経験が、あなた自身の言葉になります。
            </span>
          </div>
        </div>
      )}
    </li>
  );
};

/** 本人が当たり前すぎて気づいていない特徴を、過去の言葉から見せる */
export const Insight = ({ reading }: { reading: Reading }) => {
  const { traits } = reading;
  const [openId, setOpenId] = useState<string | null>(traits[0]?.id ?? null);
  const lead = traits[0] ? traitEvidence(traits[0], reading) : undefined;

  if (traits.length === 0) {
    return (
      <section aria-labelledby="insight-heading">
        <h1
          id="insight-heading"
          className="font-mincho text-[26px] font-semibold leading-normal md:text-[30px]"
        >
          まだ、共通点は見つかりませんでした。
        </h1>
        <p className="mt-3 text-sm leading-[1.9] text-ink-3">
          2人以上が同じことに触れていると、ここに出てきます。別の時期にもらった紙や、最近のメッセージを足してみてください。
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="insight-heading">
      <h1
        id="insight-heading"
        className="font-mincho text-[26px] font-semibold leading-normal md:text-[30px]"
      >
        あなたが<span className="text-shu">当たり前だと思っていること</span>。
      </h1>
      {lead && (
        <p className="mt-3 text-sm leading-[1.9] text-ink-3">
          {lead.spanYears > 0
            ? `${spanLabel(lead.spanYears)}、場所が変わっても、別々の人が同じことを書いていました。`
            : '別々の人が、同じことを書いていました。'}
          自分では、たぶん書かないことです。
        </p>
      )}
      <ul className="mt-6 flex flex-col gap-3">
        {traits.map((t) => (
          <TraitCard
            key={t.id}
            trait={t}
            reading={reading}
            open={openId === t.id}
            onToggle={() => setOpenId((cur) => (cur === t.id ? null : t.id))}
          />
        ))}
      </ul>
    </section>
  );
};
