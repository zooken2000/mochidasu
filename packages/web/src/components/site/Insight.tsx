import { useState } from 'react';
import { traitEvidence } from '../../lib/format';
import { useLang } from '../../hooks/useLang';
import { type Reading, type Trait, whenLabel } from '../../lib/reading';

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
  const { lang, t: all } = useLang();
  const t = all.insight;

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
            {t.who(writers, contexts, all.spanYears(spanYears))}
          </span>
        </div>
        <span className="shrink-0 text-[13px] text-shu">
          {open ? t.close : t.open}
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
                    {whenLabel(s.yearsAgo, lang)}　{s.label}
                  </span>
                  <p
                    translate="no"
                    className="mt-1 font-mincho text-base leading-[1.9] text-ink-2"
                  >
                    {all.plain.quote(q.text)}
                  </p>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-col gap-3 rounded-[3px] bg-kinari px-5 py-5">
            <span className="text-xs tracking-[0.14em] text-warn-fg">
              {t.ask}
            </span>
            <ul className="flex flex-col gap-3">
              {trait.questions.map((question) => (
                <li key={question} className="text-sm leading-[1.8] text-ink-2">
                  {question}
                </li>
              ))}
            </ul>
            <span className="mt-1 text-xs leading-[1.8] text-ink-4">
              {t.askTail}
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
  const { t: all } = useLang();
  const t = all.insight;

  if (traits.length === 0) {
    return (
      <section aria-labelledby="insight-heading">
        <h1
          id="insight-heading"
          className="font-mincho text-[26px] font-semibold leading-normal md:text-[30px]"
        >
          {t.noneTitle}
        </h1>
        <p className="mt-3 text-sm leading-[1.9] text-ink-3">{t.noneLead}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="insight-heading">
      <h1
        id="insight-heading"
        className="font-mincho text-[26px] font-semibold leading-normal md:text-[30px]"
      >
        {t.title.before}
        <span className="text-shu">{t.title.em}</span>
        {t.title.after}
      </h1>
      {lead && (
        <p className="mt-3 text-sm leading-[1.9] text-ink-3">
          {lead.spanYears > 0
            ? t.leadSpan(all.spanYears(lead.spanYears), lead.contexts > 1)
            : t.leadSame}
          {t.leadTail}
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
