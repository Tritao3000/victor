"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");

  function handleChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            locale === loc
              ? "bg-navy text-white"
              : "text-slate hover:bg-mist hover:text-navy"
          }`}
        >
          {t(loc)}
        </button>
      ))}
    </div>
  );
}
