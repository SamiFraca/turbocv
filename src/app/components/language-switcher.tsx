'use client';

import {useLocale, useTranslations} from 'next-intl';
import {routing} from '@/i18n/routing';
import {usePathname, useRouter} from 'next/navigation';
import {useTransition} from 'react';

export default function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      const segments = pathname.split('/');
      segments[1] = newLocale;
      router.replace(segments.join('/'));
    });
  };

  return (
    <div className="flex gap-2">
      {routing.locales.map((loc: string) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          disabled={isPending || locale === loc}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            locale === loc
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          } disabled:opacity-50`}
        >
          {t(loc)}
        </button>
      ))}
    </div>
  );
}
