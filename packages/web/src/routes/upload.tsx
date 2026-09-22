import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { type DragEvent, useEffect, useId, useMemo, useState } from 'react';
import { useReading } from '../components/ReadingProvider';
import { primaryButton, SiteHeader } from '../components/site/SiteHeader';
import { useExtractorClient } from '../hooks/useExtractorClient';
import { isHeic, toImageInput } from '../lib/image';
import { fromExtraction, type Source } from '../lib/reading';

export const Route = createFileRoute('/upload')({
  component: UploadPage,
});

const MAX_FILES = 6;
const MAX_TEXT_CHARS = 2000;

type Photo = {
  key: string;
  file: File;
  url: string;
  label: string;
  yearsAgo: number;
};

const fieldClass =
  'h-10 rounded-[3px] border border-line-strong bg-sheet px-3 text-sm text-ink-2 focus:border-shu focus:outline-none';

function UploadPage() {
  const inputId = useId();
  const client = useExtractorClient();
  const { setReading } = useReading();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dragging, setDragging] = useState(false);
  const [recentText, setRecentText] = useState('');
  const [recentLabel, setRecentLabel] = useState('');
  const [status, setStatus] = useState<'idle' | 'reading' | 'error'>('idle');
  const [errorDetail, setErrorDetail] = useState('');

  const urls = useMemo(() => photos.map((p) => p.url), [photos]);
  useEffect(
    () => () => {
      for (const u of urls) URL.revokeObjectURL(u);
    },
    [urls],
  );

  const addFiles = (list: FileList | null) => {
    const images = Array.from(list ?? []).filter(
      (f) => f.type.startsWith('image/') || isHeic(f),
    );
    setPhotos((prev) =>
      [
        ...prev,
        ...images.map((file) => ({
          key: `${file.name}-${file.lastModified}-${Math.random()}`,
          file,
          url: URL.createObjectURL(file),
          label: '',
          yearsAgo: 0,
        })),
      ].slice(0, MAX_FILES),
    );
  };

  const updatePhoto = (key: string, patch: Partial<Photo>) =>
    setPhotos((prev) =>
      prev.map((p) => (p.key === key ? { ...p, ...patch } : p)),
    );

  const removePhoto = (key: string) =>
    setPhotos((prev) => prev.filter((p) => p.key !== key));

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const hasText = recentText.trim().length > 0;
  const canRead = (photos.length > 0 || hasText) && status !== 'reading';

  const onRead = async () => {
    setStatus('reading');
    setErrorDetail('');
    try {
      const images = await Promise.all(
        photos.map(async (p) => ({
          ...(await toImageInput(p.file)),
          label: p.label.trim(),
          yearsAgo: p.yearsAgo,
        })),
      );
      const texts = hasText
        ? [
            {
              text: recentText.trim(),
              label: recentLabel.trim() || '最近もらった言葉',
              yearsAgo: 0,
            },
          ]
        : [];

      // 素材の並びはエージェントと同じ（写真 → 貼り付けた文章）
      const sources: Source[] = [
        ...photos.map((p, i) => ({
          id: `p${i}`,
          label: p.label.trim() || `写真 ${i + 1}`,
          yearsAgo: p.yearsAgo,
          kind: 'photo' as const,
        })),
        ...texts.map((t, i) => ({
          id: `t${i}`,
          label: t.label,
          yearsAgo: t.yearsAgo,
          kind: 'text' as const,
        })),
      ];

      for await (const chunk of client.invoke({ images, texts })) {
        if (chunk.type === 'result' && chunk.result) {
          setReading(fromExtraction(chunk.result, sources));
          navigate({ to: '/result' });
          return;
        }
      }
      throw new Error('結果が返ってきませんでした');
    } catch (e) {
      console.error(e);
      setErrorDetail(e instanceof Error ? e.message : String(e));
      setStatus('error');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader>
        <span className="text-[13px] text-ink-4">ステップ 1 / 2　読み込む</span>
        <div className="hidden h-1 w-[180px] rounded-sm bg-edge sm:block">
          <div className="h-1 w-[108px] rounded-sm bg-shu" />
        </div>
      </SiteHeader>

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-10 px-6 py-12 md:px-14 lg:flex-row">
        <section className="flex w-full max-w-[560px] flex-col">
          <h1 className="font-mincho text-[30px] font-semibold">
            もらった紙を、そのまま撮る
          </h1>
          <p className="mt-3.5 text-[15px] leading-[1.9] text-ink-3">
            色紙、寄せ書き、サンクスカード、手紙。1枚に何人分書かれていても大丈夫です。時期の違う紙があるほど、共通点が見つかりやすくなります。
          </p>

          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`mt-7 flex cursor-pointer flex-col items-center gap-3.5 rounded-[3px] border border-dashed px-7 py-9 transition-colors ${
              dragging ? 'border-shu bg-kinari' : 'border-line-strong bg-sheet'
            }`}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-cha"
              aria-hidden="true"
            >
              <path d="M3 7h4l2-2h6l2 2h4v12H3z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            <span className="text-base font-medium">紙の写真をここに置く</span>
            <span className="text-center text-xs leading-[1.8] text-ink-4">
              斜めでも、光が入っていても読み取れます（最大{MAX_FILES}枚）。
            </span>
            <span className="mt-1.5 inline-flex h-12 items-center rounded-[3px] border border-line-strong bg-sheet px-6 text-sm text-ink-2">
              画像を選ぶ
            </span>
            <input
              id={inputId}
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>

          <div className="mt-8 flex flex-col gap-3">
            <label
              htmlFor={`${inputId}-recent`}
              className="text-[15px] font-medium"
            >
              最近もらった言葉（任意）
            </label>
            <span className="text-xs leading-[1.8] text-ink-4">
              ピアボーナスや Slack
              の感謝のメッセージなどを貼り付けると、昔の紙とのつながりが見えます。
            </span>
            <input
              type="text"
              value={recentLabel}
              onChange={(e) => setRecentLabel(e.target.value)}
              placeholder="出どころ（例: 社内のピアボーナス）"
              aria-label="最近もらった言葉の出どころ"
              maxLength={60}
              className={fieldClass}
            />
            <textarea
              id={`${inputId}-recent`}
              value={recentText}
              onChange={(e) => setRecentText(e.target.value)}
              maxLength={MAX_TEXT_CHARS}
              rows={5}
              placeholder="例: 障害対応のとき、最後まで一緒に原因を追ってくれて助かりました"
              className="rounded-[3px] border border-line-strong bg-sheet px-3 py-2.5 text-sm leading-[1.8] text-ink-2 focus:border-shu focus:outline-none"
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/result"
              className="text-[13px] text-ink-4 hover:text-shu"
            >
              見本の結果を見る
            </Link>
            <button
              type="button"
              onClick={onRead}
              disabled={!canRead}
              className={`${primaryButton} h-[52px] cursor-pointer px-[34px] text-[15px] disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {status === 'reading' ? '読み取っています…' : '読み取る'}
            </button>
          </div>
          <div aria-live="polite" className="mt-3 min-h-5 text-xs text-ink-4">
            {status === 'reading' &&
              '1〜2分かかることがあります。写真は読み取りにだけ使い、保存しません。'}
            {status === 'error' && (
              <span className="text-shu">
                読み取りに失敗しました。
                {errorDetail && `（${errorDetail}）`}
              </span>
            )}
          </div>
        </section>

        <section className="flex flex-1 flex-col">
          <span className="text-xs tracking-[0.14em] text-ink-5">
            読み込む紙
          </span>
          <ul className="mt-3.5 flex flex-col gap-2.5">
            {photos.length === 0 && (
              <li className="rounded-[3px] border border-dashed border-line-strong px-4 py-6 text-[13px] text-ink-4">
                写真を選ぶと、ここに1枚ずつ並びます。紙の種類と、何年前にもらったかを入れてください。
              </li>
            )}
            {photos.map((p, i) => (
              <li
                key={p.key}
                className="flex items-center gap-3.5 rounded-[3px] border border-edge bg-sheet px-4 py-3.5"
              >
                <img
                  src={p.url}
                  alt=""
                  className="h-[60px] w-12 shrink-0 border border-line object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={p.label}
                    onChange={(e) =>
                      updatePhoto(p.key, { label: e.target.value })
                    }
                    placeholder="例: 中学の卒業寄せ書き"
                    aria-label={`写真 ${i + 1} の紙の種類`}
                    maxLength={60}
                    className={`${fieldClass} min-w-0 flex-1`}
                  />
                  <label className="flex items-center gap-1.5 text-[13px] text-ink-4">
                    <input
                      type="number"
                      min={0}
                      max={80}
                      value={p.yearsAgo}
                      onChange={(e) =>
                        updatePhoto(p.key, {
                          yearsAgo: Math.max(
                            0,
                            Math.min(80, Number(e.target.value) || 0),
                          ),
                        })
                      }
                      className={`${fieldClass} w-16`}
                    />
                    年前
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removePhoto(p.key)}
                  aria-label={`写真 ${i + 1} を外す`}
                  className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[3px] text-ink-5 hover:bg-kinari hover:text-shu"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
