import { createFileRoute, Link } from '@tanstack/react-router';
import { primaryButton, SiteHeader } from '../components/site/SiteHeader';
import { sampleReading } from '../demo/sample';
import { useLang } from '../hooks/useLang';
import { findSource, whenLabel } from '../lib/reading';

export const Route = createFileRoute('/')({
  component: EntryPage,
});

/** 右側に散らす見本の3枚（違う時期・違う人が、同じことを書いている） */
const FLOATING = ['work-2', 'jhs-2', 'club-2'];

const floatStyles = [
  'top-2 left-6 w-[310px] -rotate-[3.5deg]',
  'top-[250px] left-24 w-[300px] rotate-[2.5deg]',
  'top-[500px] left-[18px] w-[286px] -rotate-[1.5deg]',
];

function EntryPage() {
  const { lang, t } = useLang();
  const sample = sampleReading(lang);
  const floating = FLOATING.map((id) =>
    sample.fragments.find((f) => f.id === id),
  ).filter((f) => f !== undefined);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader>
        <Link
          to="/how"
          className="text-sm text-ink-4 no-underline hover:text-shu"
        >
          {t.entry.howLink}
        </Link>
        <Link
          to="/upload"
          className={`${primaryButton} h-10 px-3.5! text-[13px] sm:h-11 sm:px-[22px]! sm:text-sm`}
        >
          {t.entry.start}
        </Link>
      </SiteHeader>

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-12 px-6 pt-12 md:px-14 md:pt-[72px] lg:flex-row">
        <div className="flex max-w-[600px] flex-col">
          <span className="text-[13px] tracking-[0.18em] text-cha">
            {t.entry.eyebrow}
          </span>
          <h1 className="mt-5 font-mincho text-[38px] font-semibold leading-[1.42] tracking-[0.01em] md:text-[50px]">
            {t.entry.title[0]}
            <br />
            {t.entry.title[1]}
            <br />
            {t.entry.title[2]}
          </h1>
          <p className="mt-7 max-w-[520px] text-base leading-loose text-ink-3">
            {t.entry.lead}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link to="/upload" className={`${primaryButton} h-14 text-base`}>
              {t.entry.read}
            </Link>
            <Link
              to="/sample"
              className="text-[15px] text-ink-4 hover:text-shu"
            >
              {t.entry.sample}
            </Link>
          </div>

          <div
            id="how"
            className="mt-16 grid grid-cols-1 gap-5 border-t border-line pt-8 sm:grid-cols-3"
          >
            {t.entry.steps.map((s) => (
              <div key={s.no} className="flex flex-col gap-2">
                <span className="font-mincho text-[15px] text-shu">{s.no}</span>
                <span className="text-[15px] font-medium">{s.title}</span>
                <span className="text-[13px] leading-[1.8] text-ink-4">
                  {s.body}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative hidden min-h-[680px] flex-1 lg:block"
          aria-hidden="true"
        >
          {floating.map((f, i) => {
            const s = findSource(sample, f.sourceId, lang);
            return (
              <div
                key={f.id}
                className={`absolute rounded-[2px] border border-edge bg-sheet px-7 py-[26px] shadow-[0_10px_28px_rgba(60,46,28,0.13)] ${floatStyles[i]}`}
              >
                <span className="text-[11px] tracking-[0.14em] text-ink-5">
                  {s.label}　{whenLabel(s.yearsAgo, lang)}
                </span>
                <p className="mt-3.5 font-mincho text-[15px] leading-[2.1] text-ink-2">
                  {f.text}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center px-6 md:px-14">
          <span className="text-xs text-ink-4">{t.entry.footer}</span>
        </div>
      </footer>
    </div>
  );
}
