import { createFileRoute, Link } from '@tanstack/react-router';
import { useReading } from '../components/ReadingProvider';
import { ReadingView } from '../components/site/ReadingView';
import {
  primaryButton,
  SiteHeader,
  secondaryButton,
} from '../components/site/SiteHeader';
import { useLang } from '../hooks/useLang';

export const Route = createFileRoute('/result')({
  component: ResultPage,
});

/** 自分が読み取った結果。タブの中にだけあるので、再読み込みすると消える */
function ResultPage() {
  const { reading } = useReading();
  const { t } = useLang();
  if (reading) return <ReadingView reading={reading} />;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-6 pt-16 md:px-12">
        <h1 className="font-mincho text-[26px] font-semibold leading-normal">
          {t.result.emptyTitle}
        </h1>
        <p className="mt-4 text-sm leading-[1.9] text-ink-3">
          {t.result.emptyLead}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/upload" className={`${primaryButton} h-12`}>
            {t.result.read}
          </Link>
          <Link to="/sample" className={`${secondaryButton} h-12`}>
            {t.result.sample}
          </Link>
        </div>
      </main>
    </div>
  );
}
