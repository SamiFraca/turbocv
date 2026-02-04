"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher() {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();

	const handleLanguageChange = (newLocale: string) => {
		if (newLocale === locale) return;
		
		startTransition(() => {
			let newPathname = pathname;
			
			if (pathname.startsWith(`/${locale}`)) {
				newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
			} else {
				newPathname = `/${newLocale}${pathname}`;
			}
			
			router.push(newPathname);
		});
	};

	return (
		<div className="flex gap-2">
			<button
				onClick={() => handleLanguageChange("en")}
				disabled={isPending || locale === "en"}
				className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
					locale === "en"
						? "bg-blue-600 text-white"
						: "bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50"
				}`}
			>
				EN
			</button>
			<button
				onClick={() => handleLanguageChange("es")}
				disabled={isPending || locale === "es"}
				className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
					locale === "es"
						? "bg-blue-600 text-white"
						: "bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50"
				}`}
			>
				ES
			</button>
		</div>
	);
}
