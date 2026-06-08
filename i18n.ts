import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const supportedLocales = ['it', 'en'] as const;
const defaultLocale = 'it';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  let locale: (typeof supportedLocales)[number] = defaultLocale;
  if (localeCookie && supportedLocales.includes(localeCookie as (typeof supportedLocales)[number])) {
    locale = localeCookie as (typeof supportedLocales)[number];
  }


  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});