import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  // Get the locale from the URL pathname or browser language
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || 'en';
  
  // Extract the preferred language from Accept-Language header
  const preferredLocale = acceptLanguage
    .split(',')[0]
    .split('-')[0]
    .toLowerCase();

  // Default to 'en' if the preferred language is not supported
  const locale = ['en', 'es'].includes(preferredLocale) ? preferredLocale : 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
