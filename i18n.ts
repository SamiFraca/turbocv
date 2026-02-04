import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale || 'en';
  
  try {
    const messages = await import(`./messages/${resolvedLocale}.json`);
    return {
      locale: resolvedLocale,
      messages: messages.default
    };
  } catch {
    const messages = await import(`./messages/en.json`);
    return {
      locale: 'en',
      messages: messages.default
    };
  }
});
