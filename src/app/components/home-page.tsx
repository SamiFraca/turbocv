"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import CVForm from "./cv-form";
import ResultView from "./result-view";
import Header from "./sections/header";
import HeroSection from "./sections/hero-section";
import HowItWorks from "./sections/how-it-works";
import BeforeAfter from "./sections/before-after";
import Testimonials from "./sections/testimonials";
import Footer from "./sections/footer";
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
	const formRef = useRef<HTMLDivElement>(null);

	const scrollToForm = () => {
		formRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleOptimize = async (pdfFile: File, jobOffer: string, originalText: string) => {
		try {
			setError(null);
			const formData = new FormData();
			formData.append("pdf", pdfFile);
			formData.append("jobOffer", jobOffer);
			formData.append("originalText", originalText);
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
			const errorMessage = err instanceof Error ? err.message : t("error");
			setError(errorMessage);
		}
	};

	const handleReset = () => {
		setResult(null);
		setError(null);
	};

	return (
		<div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
			<Header onScrollToForm={scrollToForm} />
			<HeroSection onScrollToForm={scrollToForm} />
			
			{!result && (
				<>
					<HowItWorks />
					<BeforeAfter />
					<Testimonials />
				</>
			)}

			<div ref={formRef} className="max-w-4xl mx-auto px-4 py-12">
				{!result ? (
					<CVForm onOptimize={handleOptimize} error={error} onError={setError} />
				) : (
					<ResultView result={result} onReset={handleReset} />
				)}
			</div>

			<Footer />
		</div>
	);
}
