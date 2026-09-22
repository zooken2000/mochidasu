import { createFileRoute, Link } from '@tanstack/react-router';
import {
  primaryButton,
  SiteHeader,
  secondaryButton,
} from '../components/site/SiteHeader';
import { useLang } from '../hooks/useLang';

export const Route = createFileRoute('/how')({
  component: HowPage,
});

function HowPage() {
  const { t } = useLang();
  const h = t.how;
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader>
        <Link
          to="/sample"
          className="text-sm text-ink-4 no-underline hover:text-shu"
        >
          {h.sample}
        </Link>
        <Link
          to="/upload"
          className={`${primaryButton} h-11 px-[22px] text-sm`}
        >
          {h.start}
        </Link>
      </SiteHeader>

      <main className="mx-auto flex w-full max-w-[880px] flex-1 flex-col px-6 pt-12 pb-16 md:px-12">
        <h1 className="font-mincho text-[28px] font-semibold leading-normal md:text-[32px]">
          {h.title}
        </h1>
        <p className="mt-4 text-sm leading-[1.9] text-ink-3">{h.lead}</p>

        <ol className="mt-10 flex flex-col gap-7 border-t border-line pt-8">
          {h.steps.map((s) => (
            <li key={s.no} className="grid grid-cols-[48px_1fr] gap-x-4">
              <span className="font-mincho text-[15px] text-shu">{s.no}</span>
              <div className="flex flex-col gap-2">
                <span className="text-[15px] font-medium">{s.title}</span>
                <span className="text-[13px] leading-[1.9] text-ink-4">
                  {s.body}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-12 rounded-[3px] border border-edge bg-sheet px-6 py-5">
          <h2 className="text-xs tracking-[0.14em] text-ink-5">
            {h.tipsTitle}
          </h2>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5">
            {h.tips.map((tip) => (
              <li key={tip} className="text-[13px] leading-[1.9] text-ink-3">
                {tip}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-mincho text-[20px] font-semibold">
            {h.promisesTitle}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {h.promises.map((p) => (
              <div
                key={p.title}
                className="flex flex-col gap-2 rounded-[3px] bg-kinari px-5 py-4"
              >
                <span className="text-[15px] font-medium">{p.title}</span>
                <span className="text-[13px] leading-[1.9] text-ink-3">
                  {p.body}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link to="/upload" className={`${primaryButton} h-12`}>
            {h.read}
          </Link>
          <Link to="/sample" className={`${secondaryButton} h-12`}>
            {h.sampleResult}
          </Link>
        </div>
      </main>
    </div>
  );
}
