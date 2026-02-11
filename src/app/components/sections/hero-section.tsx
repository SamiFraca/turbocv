"use client";

import { useTranslations } from "next-intl";

interface HeroSectionProps {
	onScrollToForm: () => void;
}

export default function HeroSection({ onScrollToForm }: HeroSectionProps) {
	const t = useTranslations("home");

	return (
		<section className="bg-slate-900 text-white pt-12 pb-20 px-4">
			<div className="max-w-3xl mx-auto text-center">
				<div className="inline-block bg-blue-600/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
					{t("badge")}
				</div>
				<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
					{t("title")}
				</h1>
				<p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
					{t("subtitle")}
				</p>
				<div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
					<span className="flex items-center gap-2">
						<span className="text-green-400">✓</span> {t("heroBullets.noSignup")}
					</span>
					<span className="flex items-center gap-2">
						<span className="text-green-400">✓</span> {t("heroBullets.sixtySeconds")}
					</span>
					<span className="flex items-center gap-2">
						<span className="text-green-400">✓</span> {t("heroBullets.fiveTemplates")}
					</span>
				</div>
			</div>
		</section>
	);
}
