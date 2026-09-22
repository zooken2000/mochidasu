import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Insight } from './Insight';
import { useLang } from '../../hooks/useLang';
import type { Messages } from '../../lib/i18n';
import { SiteHeader, secondaryButton } from './SiteHeader';
import { summarize, toPlainText } from '../../lib/format';
import {
  type Fragment,
  findSource,
  type Reading,
  whenLabel,
} from '../../lib/reading';

const FIRST_VIEW = 4;

/**
 * 人が書いた言葉（引用・書き手の名前）には translate="no" を付け、ブラウザの自動翻訳で書き換えさせない。
 */

/** 手書きの切り抜き（見本では、実物の画像の代わりに手書き風の書体で描く） */
const Clipping = ({ fragment }: { fragment: Fragment }) => (
  <div className="flex h-[260px] items-center justify-center border-b border-edge bg-[#F7F3EA] p-5">
    <div
      translate="no"
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

const ConfidenceTag = ({
  level,
  t,
}: {
  level: Fragment['confidence'];
  t: Messages['result'];
}) =>
  level === 'high' ? (
    <span className="rounded-[2px] bg-ok-bg px-2 py-[3px] text-[10px] text-ok-fg">
      {t.confidenceHigh}
    </span>
  ) : (
    <span className="rounded-[2px] bg-warn-bg px-2 py-[3px] text-[10px] text-warn-fg">
      {t.confidencePartial}
    </span>
  );

/** 読み取り結果の画面。/result（自分の結果）と /sample（見本）で共通 */
export const ReadingView = ({ reading }: { reading: Reading }) => {
  const { lang, t: all } = useLang();
  const t = all.result;
  const [showText, setShowText] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showDropped, setShowDropped] = useState(false);
  const [copied, setCopied] = useState(false);

  const { total, kept, dropped } = summarize(reading.fragments);
  const keptFragments = reading.fragments.filter((f) => f.keep);
  const droppedFragments = reading.fragments.filter((f) => !f.keep);
  const visible = showAll ? keptFragments : keptFragments.slice(0, FIRST_VIEW);

  const onCopy = async () => {
    await navigator.clipboard.writeText(toPlainText(reading, lang));
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
          {t.showText}
        </label>
      </SiteHeader>

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-6 pt-9 md:px-12">
        {reading.isSample && (
          <p className="mb-6 rounded-[3px] bg-kinari px-4 py-3 text-[13px] leading-[1.8] text-ink-3">
            {t.sampleNote}
            <Link to="/upload" className="ml-2 text-shu">
              {t.tryOwn}
            </Link>
            <Link to="/how" className="ml-4 text-shu">
              {t.howLink}
            </Link>
          </p>
        )}
        <Insight
          key={reading.traits.map((t) => t.id).join()}
          reading={reading}
        />

        <h2 className="mt-14 border-t border-line pt-10 font-mincho text-[22px] font-semibold leading-normal md:text-[24px]">
          {t.keptTitle(total, kept).before}
          <span className="text-shu">{t.keptTitle(total, kept).em}</span>
          {t.keptTitle(total, kept).after}
        </h2>
        <p className="mt-3 text-sm leading-[1.9] text-ink-3">{t.keptLead}</p>

        <ul className="mt-6 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((f) => {
            const s = findSource(reading, f.sourceId, lang);
            return (
              <li
                key={f.id}
                className="flex flex-col overflow-hidden rounded-[3px] border border-edge bg-sheet"
              >
                <Clipping fragment={f} />
                <div className="flex flex-col gap-2 px-4 py-3.5">
                  {showText && (
                    <span
                      translate="no"
                      className="text-xs leading-[1.8] text-ink-4"
                    >
                      {f.text}
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-ink-5">
                      {s.label}　{whenLabel(s.yearsAgo, lang)}
                    </span>
                    <ConfidenceTag level={f.confidence} t={t} />
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
                ? t.firstOnly(FIRST_VIEW)
                : t.showRest(keptFragments.length - FIRST_VIEW)}
            </button>
          )}
          <button
            type="button"
            className={secondaryButton}
            aria-expanded={showDropped}
            onClick={() => setShowDropped((v) => !v)}
          >
            {t.dropped(dropped)}
          </button>
          <span className="text-xs text-ink-5">{t.clipNote}</span>
        </div>

        {showDropped && (
          <section className="mt-5 rounded-[3px] border border-edge bg-sheet px-5 py-4">
            <h2 className="text-xs tracking-[0.14em] text-ink-5">
              {t.droppedTitle(dropped)}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {droppedFragments.map((f) => (
                <li key={f.id} className="text-[13px] leading-[1.8] text-ink-4">
                  <span translate="no">{f.text}</span>
                  <span className="ml-2 text-[11px] text-ink-5">
                    {f.writer && (
                      <span translate="no">
                        {f.writer}
                        {lang === 'ja' ? '・' : ' · '}
                      </span>
                    )}
                    {findSource(reading, f.sourceId, lang).label}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-auto mb-7 flex flex-col gap-4 rounded-[3px] bg-kinari px-6 py-5 md:flex-row md:items-center md:justify-between">
          <span className="text-[13px] leading-[1.8] text-[#3A342C]">
            {t.carry(kept)}
          </span>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-[3px] bg-shu px-6 text-sm font-medium text-sheet transition-colors hover:bg-shu-dark"
          >
            {copied ? t.copied : t.copy(kept)}
          </button>
        </div>
      </main>
    </div>
  );
};
