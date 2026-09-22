import {
  createRootRouteWithContext,
  Outlet,
  retainSearchParams,
} from '@tanstack/react-router';
import { isLang, type Lang } from '../lib/i18n';
import { RouterProviderContext } from '../main';

type RootSearch = { lang?: Lang };

export const Route = createRootRouteWithContext<RouterProviderContext>()({
  // ?lang=ja|en を画面を移っても引き継ぐ
  validateSearch: (search: Record<string, unknown>): RootSearch =>
    isLang(search.lang) ? { lang: search.lang } : {},
  search: { middlewares: [retainSearchParams(['lang'])] },
  component: () => (
    <div className="min-h-screen bg-paper text-ink">
      <Outlet />
    </div>
  ),
});
