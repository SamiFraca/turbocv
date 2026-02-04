"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import CVForm from "./cv-form";
import ResultView from "./result-view";

export default function HomePage() {
	const t = useTranslations("home");
	const locale = useLocale();
	const [result, setResult] = useState<{
		optimizedCV: string;
		keywords: string[];
	} | null>(null);

	const handleOptimize = async (cvBase64: string, jobOffer: string) => {
		try {
			const response = await fetch("/api/optimize", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ cvBase64, jobOffer, locale }),
			});
			const data = await response.json();
			setResult(data);
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const handleReset = () => {
		setResult(null);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
			<div className="bg-slate-900 text-white py-16 px-4">
				<div className="max-w-4xl mx-auto">
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold mb-4">
							{t("title")}
						</h1>
						<p className="text-xl text-slate-300 max-w-2xl mx-auto">
							{t("subtitle")}
						</p>
					</div>
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-4 py-12">
				{!result ? (
					<CVForm onOptimize={handleOptimize} />
				) : (
					<ResultView result={result} onReset={handleReset} />
				)}
			</div>
		</div>
	);
}
