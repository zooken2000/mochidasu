import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useReading } from '../components/ReadingProvider';
import { Insight } from '../components/site/Insight';
import { SiteHeader, secondaryButton } from '../components/site/SiteHeader';
import { summarize, toPlainText } from '../lib/format';
import { type Fragment, findSource, whenLabel } from '../lib/reading';

export const Route = createFileRoute('/result')({
  component: ResultPage,
});

const FIRST_VIEW = 4;

/** 手書きの切り抜き（見本では、実物の画像の代わりに手書き風の書体で描く） */
const Clipping = ({ fragment }: { fragment: Fragment }) => (
  <div className="flex h-[260px] items-center justify-center border-b border-edge bg-[#F7F3EA] p-5">
    <div
      className="flex max-w-full flex-col gap-2 rounded-[2px] px-5 py-4 font-hand text-[15px] leading-[1.7] text-[#23304A] shadow-[0_2px_8px_rgba(60,46,28,0.12)]"
      style={{ background: fragment.paper ?? '#FDFCF8' }}
    >
      <span>{fragment.text}</span>
      {fragment.writer && (
        <span className="self-end text-[13px]">{fragment.writer}</span>
      )}
    </div>
  </div>
);

const ConfidenceTag = ({ level }: { level: Fragment['confidence'] }) =>
  level === 'high' ? (
    <span className="rounded-[2px] bg-ok-bg px-2 py-[3px] text-[10px] text-ok-fg">
      読み取り高
    </span>
  ) : (
    <span className="rounded-[2px] bg-warn-bg px-2 py-[3px] text-[10px] text-warn-fg">
      一部不明
    </span>
  );

function ResultPage() {
  const { reading } = useReading();
  const [showText, setShowText] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showDropped, setShowDropped] = useState(false);
  const [copied, setCopied] = useState(false);

  const { total, kept, dropped } = summarize(reading.fragments);
  const keptFragments = reading.fragments.filter((f) => f.keep);
  const droppedFragments = reading.fragments.filter((f) => !f.keep);
  const visible = showAll ? keptFragments : keptFragments.slice(0, FIRST_VIEW);

  const onCopy = async () => {
    await navigator.clipboard.writeText(toPlainText(reading));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader>
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-3">
          <input
            type="checkbox"
            checked={showText}
            onChange={(e) => setShowText(e.target.checked)}
            className="size-4 accent-shu"
          />
          文字起こしを下に出す
        </label>
      </SiteHeader>

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-6 pt-9 md:px-12">
        {reading.isSample && (
          <p className="mb-6 rounded-[3px] bg-kinari px-4 py-3 text-[13px] leading-[1.8] text-ink-3">
            これは見本です（架空の人物「佐藤 陽」さんに宛てた寄せ書き）。
            <Link to="/upload" className="ml-2 text-shu">
              自分の紙で試す
            </Link>
          </p>
        )}
        <Insight
          key={reading.traits.map((t) => t.id).join()}
          reading={reading}
        />

        <h2 className="mt-14 border-t border-line pt-10 font-mincho text-[22px] font-semibold leading-normal md:text-[24px]">
          {total}件のうち{kept}件。
          <span className="text-shu">書かれたままの形で</span>残します。
        </h2>
        <p className="mt-3 text-sm leading-[1.9] text-ink-3">
          文字に起こすのは、探すためです。読むのは、その人の字で読んでください。
        </p>

        <ul className="mt-6 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((f) => {
            const s = findSource(reading, f.sourceId);
            return (
              <li
                key={f.id}
                className="flex flex-col overflow-hidden rounded-[3px] border border-edge bg-sheet"
              >
                <Clipping fragment={f} />
                <div className="flex flex-col gap-2 px-4 py-3.5">
                  {showText && (
                    <span className="text-xs leading-[1.8] text-ink-4">
                      {f.text}
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-ink-5">
                      {s.label}　{whenLabel(s.yearsAgo)}
                    </span>
                    <ConfidenceTag level={f.confidence} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          {keptFragments.length > FIRST_VIEW && (
            <button
              type="button"
              className={secondaryButton}
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll
                ? '最初の4件だけにする'
                : `残り${keptFragments.length - FIRST_VIEW}件を見る`}
            </button>
          )}
          <button
            type="button"
            className={secondaryButton}
            aria-expanded={showDropped}
            onClick={() => setShowDropped((v) => !v)}
          >
            捨てた{dropped}件
          </button>
          <span className="text-xs text-ink-5">
            手書きの切り抜きの代わりに、読み取った文字を書体で表示しています。
          </span>
        </div>

        {showDropped && (
          <section className="mt-5 rounded-[3px] border border-edge bg-sheet px-5 py-4">
            <h2 className="text-xs tracking-[0.14em] text-ink-5">
              捨てた{dropped}件（挨拶・定型句・内輪ネタ）
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {droppedFragments.map((f) => (
                <li key={f.id} className="text-[13px] leading-[1.8] text-ink-4">
                  {f.text}
                  <span className="ml-2 text-[11px] text-ink-5">
                    {f.writer ? `${f.writer}・` : ''}
                    {findSource(reading, f.sourceId).label}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-auto mb-7 flex flex-col gap-4 rounded-[3px] bg-kinari px-6 py-5 md:flex-row md:items-center md:justify-between">
          <span className="text-[13px] leading-[1.8] text-[#3A342C]">
            この{kept}
            件は、紙が実家にあっても手元に残ります。迷ったときに、いつでも読み返せるように。
          </span>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-[3px] bg-shu px-6 text-sm font-medium text-sheet transition-colors hover:bg-shu-dark"
          >
            {copied ? 'コピーしました' : `${kept}件を持ち出す`}
          </button>
        </div>
      </main>
    </div>
  );
}
