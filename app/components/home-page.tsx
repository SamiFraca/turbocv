"use client";

import { useState } from "react";
import CVForm from "./cv-form";
import ResultView from "./result-view";

export default function HomePage() {
	const [result, setResult] = useState<{
		optimizedCV: string;
		keywords: string[];
	} | null>(null);

	const handleOptimize = async (cvText: string, jobOffer: string) => {
		try {
			const response = await fetch("/api/optimize", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ cvText, jobOffer }),
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
							TurboCV - Ajusta tu CV a cada oferta en 60 segundos
						</h1>
						<p className="text-xl text-slate-300 max-w-2xl mx-auto">
							Optimiza tu currículum para pasar filtros ATS. Analiza tu CV y la oferta de trabajo para obtener un CV ajustado que maximice tus opciones.
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
