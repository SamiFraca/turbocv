"use client";

import { useTranslations } from "next-intl";

interface Step {
	number: number;
	title: string;
	description: string;
}

export default function HowItWorks() {
	const t = useTranslations("home");

	const steps: Step[] = [
		{
			number: 1,
			title: t("howItWorks.step1Title"),
			description: t("howItWorks.step1Desc"),
		},
		{
			number: 2,
			title: t("howItWorks.step2Title"),
			description: t("howItWorks.step2Desc"),
		},
		{
			number: 3,
			title: t("howItWorks.step3Title"),
			description: t("howItWorks.step3Desc"),
		},
	];

	return (
		<section className="max-w-5xl mx-auto px-4 py-16">
			<h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">
				{t("howItWorks.title")}
			</h2>
			<p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
				{t("howItWorks.subtitle")}
			</p>
			<div className="grid md:grid-cols-3 gap-8">
				{steps.map((step) => (
					<div key={step.number} className="text-center">
						<div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
							{step.number}
						</div>
						<h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
						<p className="text-sm text-slate-500">{step.description}</p>
					</div>
				))}
			</div>
		</section>
	);
}
