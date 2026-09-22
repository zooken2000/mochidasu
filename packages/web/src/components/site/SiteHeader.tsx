import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useLang } from '../../hooks/useLang';

/** 日本語 ⇄ 英語の切り替え */
const LangSwitch = () => {
  const { lang, t, setLang } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
      aria-label={t.switchLabel}
      className="inline-flex h-9 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-[3px] border border-line-strong bg-sheet px-2.5 text-[13px] text-ink-3 transition-colors hover:bg-kinari hover:text-shu sm:px-3"
    >
      <span className="sm:hidden">{lang === 'ja' ? 'EN' : 'JA'}</span>
      <span className="hidden sm:inline">{t.switchTo}</span>
    </button>
  );
};

/** 全画面共通のヘッダー。右側は画面ごとに差し替える */
export const SiteHeader = ({ children }: { children?: ReactNode }) => (
  <header className="border-b border-line">
    <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between gap-3 px-5 sm:px-6 md:px-14">
      <Link
        to="/"
        className="shrink-0 whitespace-nowrap font-mincho text-[21px] font-semibold tracking-[0.08em] text-ink no-underline"
      >
        もちだす
      </Link>
      <div className="flex items-center gap-3 whitespace-nowrap md:gap-7">
        {children}
        <LangSwitch />
      </div>
    </div>
  </header>
);

/** 朱色の主ボタン（リンク） */
export const primaryButton =
  'inline-flex items-center justify-center rounded-[3px] bg-shu px-8 font-medium text-sheet no-underline transition-colors hover:bg-shu-dark';

/** 生成りの副ボタン */
export const secondaryButton =
  'inline-flex h-11 cursor-pointer items-center justify-center rounded-[3px] border border-line-strong bg-sheet px-[18px] text-[13px] text-ink-2 transition-colors hover:bg-kinari';
