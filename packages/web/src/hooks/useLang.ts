import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useEffect } from 'react';
import { detectLang, isLang, type Lang, MESSAGES } from '../lib/i18n';

/** いまの言語と文言。URL の ?lang が無ければブラウザの言語に合わせる */
export const useLang = () => {
  const search = useSearch({ strict: false }) as { lang?: unknown };
  const lang: Lang = isLang(search.lang)
    ? search.lang
    : detectLang(typeof navigator === 'undefined' ? [] : navigator.languages);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  /** 言語を切り替える（URL の ?lang を書き換える。ブラウザには保存しない） */
  const setLang = useCallback(
    (next: Lang) =>
      navigate({
        to: '.',
        search: (prev: Record<string, unknown>) => ({ ...prev, lang: next }),
        replace: true,
      } as never),
    [navigate],
  );

  return { lang, t: MESSAGES[lang], setLang };
};
