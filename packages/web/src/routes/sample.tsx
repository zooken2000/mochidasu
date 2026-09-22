import { createFileRoute } from '@tanstack/react-router';
import { ReadingView } from '../components/site/ReadingView';
import { sampleReading } from '../demo/sample';
import { useLang } from '../hooks/useLang';

export const Route = createFileRoute('/sample')({
  component: SamplePage,
});

/** 見本（架空の人物宛て）。自分の結果を出しても変わらない */
function SamplePage() {
  const { lang } = useLang();
  return <ReadingView reading={sampleReading(lang)} />;
}
