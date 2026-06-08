"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export default function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-2 text-xs text-gray-500">
      <span>{t("label")}</span>
      <select
        value={locale}
        onChange={(e) => {
          const nextLocale = e.target.value;
          document.cookie = `NEXT_LOCALE=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
          router.replace(pathname);
          router.refresh();
        }}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
      >
        <option value="it">{t("it")}</option>
        <option value="en">{t("en")}</option>
      </select>
    </label>
  );
}
