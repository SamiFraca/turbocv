"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import CVForm from "./cv-form";
import ResultView from "./result-view";
import type { StructuredCV } from "../lib/cv-types";

export default function HomePage() {
	const t = useTranslations("home");
	const locale = useLocale();
	const [result, setResult] = useState<{
		optimizedCV: string;
		cvData?: StructuredCV;
		keywords: string[];
		originalText?: string;
	} | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleOptimize = async (pdfFile: File, jobOffer: string) => {
		try {
			setError(null);
			const formData = new FormData();
			formData.append("pdf", pdfFile);
			formData.append("jobOffer", jobOffer);
			formData.append("locale", locale);
			
			const response = await fetch("/api/optimize", {
				method: "POST",
				body: formData,
			});
			const data = await response.json();

			if (!response.ok) {
				setError(data.error || t("error"));
				return;
			}

			setResult(data);
		} catch (err) {
			console.error("Error:", err);
			setError(t("error"));
		}
	};

	const handleReset = () => {
		setResult(null);
		setError(null);
	};

	return (
		<div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
			<header className="bg-slate-900 text-white">
				<div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
					<span className="text-xl font-bold tracking-tight">TurboCV</span>
					<a href="#form" className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors font-medium">
						{t("cta")}
					</a>
				</div>
			</header>

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
						<span className="flex items-center gap-2"><span className="text-green-400">✓</span> {t("heroBullets.noSignup")}</span>
						<span className="flex items-center gap-2"><span className="text-green-400">✓</span> {t("heroBullets.sixtySeconds")}</span>
						<span className="flex items-center gap-2"><span className="text-green-400">✓</span> {t("heroBullets.fiveTemplates")}</span>
					</div>
				</div>
			</section>

			{!result && (
				<section className="max-w-5xl mx-auto px-4 py-16">
					<h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">{t("howItWorks.title")}</h2>
					<p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">{t("howItWorks.subtitle")}</p>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">1</div>
							<h3 className="font-semibold text-slate-800 mb-2">{t("howItWorks.step1Title")}</h3>
							<p className="text-sm text-slate-500">{t("howItWorks.step1Desc")}</p>
						</div>
						<div className="text-center">
							<div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">2</div>
							<h3 className="font-semibold text-slate-800 mb-2">{t("howItWorks.step2Title")}</h3>
							<p className="text-sm text-slate-500">{t("howItWorks.step2Desc")}</p>
						</div>
						<div className="text-center">
							<div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">3</div>
							<h3 className="font-semibold text-slate-800 mb-2">{t("howItWorks.step3Title")}</h3>
							<p className="text-sm text-slate-500">{t("howItWorks.step3Desc")}</p>
						</div>
					</div>
				</section>
			)}

			{!result && (
				<section className="bg-white py-16 px-4">
					<div className="max-w-5xl mx-auto">
						<h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">{t("beforeAfter.title")}</h2>
						<p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">{t("beforeAfter.subtitle")}</p>
						<div className="grid md:grid-cols-2 gap-6">
							<div className="border border-red-200 rounded-xl p-6 bg-red-50/50">
								<div className="flex items-center gap-2 mb-4">
									<span className="text-red-500 text-lg">✗</span>
									<h3 className="font-semibold text-red-800">{t("beforeAfter.beforeTitle")}</h3>
								</div>
								<div className="space-y-3 text-sm text-slate-600">
									<p className="bg-white rounded-lg p-3 border border-red-100">{t("beforeAfter.beforeProfile")}</p>
									<p className="bg-white rounded-lg p-3 border border-red-100">{t("beforeAfter.beforeExp")}</p>
									<div className="flex flex-wrap gap-1">
										{["JavaScript", "CSS", "HTML"].map((s) => (
											<span key={s} className="px-2 py-0.5 bg-white border border-red-100 rounded text-xs text-slate-500">{s}</span>
										))}
									</div>
								</div>
							</div>
							<div className="border border-green-200 rounded-xl p-6 bg-green-50/50">
								<div className="flex items-center gap-2 mb-4">
									<span className="text-green-500 text-lg">✓</span>
									<h3 className="font-semibold text-green-800">{t("beforeAfter.afterTitle")}</h3>
								</div>
								<div className="space-y-3 text-sm text-slate-600">
									<p className="bg-white rounded-lg p-3 border border-green-100">{t("beforeAfter.afterProfile")}</p>
									<p className="bg-white rounded-lg p-3 border border-green-100">{t("beforeAfter.afterExp")}</p>
									<div className="flex flex-wrap gap-1">
										{["React", "TypeScript", "Next.js", "Performance Optimization", "Accessibility"].map((s) => (
											<span key={s} className="px-2 py-0.5 bg-white border border-green-100 rounded text-xs text-green-700 font-medium">{s}</span>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			)}

			{!result && (
				<section className="py-16 px-4">
					<div className="max-w-3xl mx-auto text-center">
						<h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-10">{t("testimonials.title")}</h2>
						<div className="grid md:grid-cols-3 gap-6">
							{[1, 2, 3].map((i) => (
								<div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
									<div className="text-yellow-400 text-sm mb-3">★★★★★</div>
									<p className="text-sm text-slate-600 mb-4 italic">&ldquo;{t(`testimonials.review${i}`)}&rdquo;</p>
									<p className="text-xs font-semibold text-slate-800">{t(`testimonials.name${i}`)}</p>
									<p className="text-xs text-slate-500">{t(`testimonials.role${i}`)}</p>
								</div>
							))}
						</div>
					</div>
				</section>
			)}

			<div id="form" className="max-w-4xl mx-auto px-4 py-12">
				{!result ? (
					<CVForm onOptimize={handleOptimize} error={error} />
				) : (
					<ResultView result={result} onReset={handleReset} />
				)}
			</div>

			<footer className="border-t border-slate-200 py-8 px-4 text-center text-sm text-slate-500">
				<div className="max-w-4xl mx-auto">
					<p className="font-semibold text-slate-700 mb-1">TurboCV</p>
					<p>&copy; {new Date().getFullYear()} TurboCV. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}
