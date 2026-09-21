import {
  Alert,
  AlertDescription,
} from '@mochidasu/common-shadcn/components/ui/alert';
import { Button } from '@mochidasu/common-shadcn/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@mochidasu/common-shadcn/components/ui/card';
import { createFileRoute } from '@tanstack/react-router';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Spinner } from '../components/spinner';
import type { Extraction } from '../generated/extractor/types.gen';
import { useExtractorClient } from '../hooks/useExtractorClient';
import { groupByTheme, toPlainText } from '../lib/format';
import { toImageInput } from '../lib/image';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

const MAX_FILES = 6;

type Status = 'idle' | 'reading' | 'done' | 'error';

function RouteComponent() {
  const client = useExtractorClient();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<Extraction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const previews = useMemo(
    () =>
      files.map((f) => ({
        key: f.name + f.lastModified,
        name: f.name,
        url: URL.createObjectURL(f),
      })),
    [files],
  );
  useEffect(
    () => () => previews.forEach((p) => URL.revokeObjectURL(p.url)),
    [previews],
  );

  const onSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).slice(0, MAX_FILES);
    setFiles(selected);
    setResult(null);
    setError(null);
    setStatus('idle');
  };

  const onExtract = async () => {
    setStatus('reading');
    setError(null);
    setResult(null);
    try {
      const images = await Promise.all(files.map(toImageInput));
      for await (const chunk of client.invoke({ images })) {
        if (chunk.type === 'result' && chunk.result) {
          setResult(chunk.result);
        }
      }
      setStatus('done');
    } catch (e) {
      console.error(e);
      setError('読み取りに失敗しました。時間をおいてもう一度試してください。');
      setStatus('error');
    }
  };

  const onCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(toPlainText(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">もちだす</h1>
        <p className="text-muted-foreground">
          自分を説明する言葉は、もう誰かが書いている。
          <br />
          寄せ書きやサンクスカードの写真から、その言葉だけを取り出します。
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>紙の写真を選ぶ（最大{MAX_FILES}枚）</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onSelect}
            className="text-sm file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-medium"
          />
          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {previews.map((p) => (
                <img
                  key={p.key}
                  src={p.url}
                  alt={p.name}
                  className="aspect-square w-full rounded-md border object-cover"
                />
              ))}
            </div>
          )}
          <Button
            onClick={onExtract}
            disabled={files.length === 0 || status === 'reading'}
          >
            {status === 'reading' ? (
              <>
                <Spinner /> 読み取り中…
              </>
            ) : (
              '言葉を取り出す'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>{result.sourceType}から取り出した言葉</CardTitle>
            <Button variant="outline" size="sm" onClick={onCopy}>
              {copied ? 'コピーしました' : 'テキストでコピー'}
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {result.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((k) => (
                  <span
                    key={k.word}
                    className="rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground"
                  >
                    {k.word}
                    <span className="ml-1 opacity-70">×{k.count}</span>
                  </span>
                ))}
              </div>
            )}

            {groupByTheme(result.phrases).map((group) => (
              <section key={group.theme} className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {group.theme}
                </h2>
                <ul className="flex flex-col gap-3">
                  {group.phrases.map((p, i) => (
                    <li
                      key={`${group.theme}-${i}`}
                      className="border-l-4 border-primary/40 pl-3"
                    >
                      <p className="text-base">「{p.text}」</p>
                      {p.writer && (
                        <p className="text-sm text-muted-foreground">
                          — {p.writer}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <p className="text-xs text-muted-foreground">
              定型の挨拶など {result.excludedCount} 件を除外
              {result.unreadableCount > 0 &&
                ` ／ 判読できなかった箇所 ${result.unreadableCount} 件`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
