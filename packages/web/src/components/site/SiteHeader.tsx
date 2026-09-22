import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

/** 全画面共通のヘッダー。右側は画面ごとに差し替える */
export const SiteHeader = ({ children }: { children?: ReactNode }) => (
  <header className="border-b border-line">
    <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between gap-6 px-6 md:px-14">
      <Link
        to="/"
        className="font-mincho text-[21px] font-semibold tracking-[0.08em] text-ink no-underline"
      >
        もちだす
      </Link>
      <div className="flex items-center gap-4 md:gap-7">{children}</div>
    </div>
  </header>
);

/** 朱色の主ボタン（リンク） */
export const primaryButton =
  'inline-flex items-center justify-center rounded-[3px] bg-shu px-8 font-medium text-sheet no-underline transition-colors hover:bg-shu-dark';

/** 生成りの副ボタン */
export const secondaryButton =
  'inline-flex h-11 cursor-pointer items-center justify-center rounded-[3px] border border-line-strong bg-sheet px-[18px] text-[13px] text-ink-2 transition-colors hover:bg-kinari';
