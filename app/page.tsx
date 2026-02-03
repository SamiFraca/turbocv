"use client";

import { useState } from "react";
import PaymentModal from "./components/PaymentModal";
import { generatePDF } from "./lib/pdf";

export default function Home() {
	const [cvText, setCvText] = useState("");
	const [jobOffer, setJobOffer] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<{
		optimizedCV: string;
		keywords: string[];
	} | null>(null);
	const [showPayment, setShowPayment] = useState(false);

	const handleOptimize = async () => {
		if (!cvText.trim() || !jobOffer.trim()) return;

		setIsLoading(true);
		try {
			const response = await fetch("/api/optimize", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ cvText, jobOffer }),
			});
			const data = await response.json();
			setResult(data);
			setShowPayment(true);
		} catch (error) {
			console.error("Error:", error);
		}
		setIsLoading(false);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
			<div className="bg-slate-900 text-white py-16 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-4">
						Ajusta tu CV a cada oferta en 60 segundos
					</h1>
					<p className="text-xl text-slate-300 max-w-2xl mx-auto">
						Diseñado para pasar filtros ATS, no para sonar bonito
					</p>
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-4 py-12">
				{!showPayment ? (
					<div className="bg-white rounded-2xl shadow-lg p-8">
						<div className="space-y-6">
							<div>
								<label
									htmlFor="cv"
									className="block text-sm font-semibold text-slate-700 mb-2"
								>
									Tu CV (copia y pega el texto)
								</label>
								<textarea
									id="cv"
									rows={8}
									className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
									placeholder="Pega aquí tu currículum..."
									value={cvText}
									onChange={(e) => setCvText(e.target.value)}
								/>
							</div>

							<div>
								<label
									htmlFor="offer"
									className="block text-sm font-semibold text-slate-700 mb-2"
								>
									Oferta de trabajo
								</label>
								<textarea
									id="offer"
									rows={6}
									className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
									placeholder="Pega aquí la descripción de la oferta..."
									value={jobOffer}
									onChange={(e) => setJobOffer(e.target.value)}
								/>
							</div>

							<button
								type="button"
								onClick={handleOptimize}
								disabled={!cvText.trim() || !jobOffer.trim() || isLoading}
								className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
							>
								{isLoading ? "Analizando..." : "Optimizar mi CV"}
							</button>
						</div>

						<div className="mt-12 pt-8 border-t border-slate-100">
							<div className="grid md:grid-cols-3 gap-6 text-center">
								<div>
									<div className="text-2xl mb-2">🎯</div>
									<h3 className="font-semibold text-slate-800">
										Optimizado para ATS
									</h3>
									<p className="text-sm text-slate-600 mt-1">
										Pasa los filtros automáticos
									</p>
								</div>
								<div>
									<div className="text-2xl mb-2">⚡</div>
									<h3 className="font-semibold text-slate-800">
										Resultado inmediato
									</h3>
									<p className="text-sm text-slate-600 mt-1">
										En menos de 60 segundos
									</p>
								</div>
								<div>
									<div className="text-2xl mb-2">✅</div>
									<h3 className="font-semibold text-slate-800">Sin mentiras</h3>
									<p className="text-sm text-slate-600 mt-1">
										Reescribe sin inventar experiencia
									</p>
								</div>
							</div>
						</div>
					</div>
				) : (
					<PaymentView
						result={result}
						onReset={() => {
							setShowPayment(false);
							setResult(null);
						}}
					/>
				)}
			</div>
		</div>
	);
}

function PaymentView({
	result,
	onReset,
}: {
	result: { optimizedCV: string; keywords: string[] } | null;
	onReset: () => void;
}) {
	const [isPaid, setIsPaid] = useState(false);
	const [showPaymentForm, setShowPaymentForm] = useState(false);

	const handleDownloadPDF = () => {
		if (result) {
			generatePDF(result.optimizedCV, result.keywords);
		}
	};

	if (!result) return null;

	return (
		<div className="bg-white rounded-2xl shadow-lg p-8">
			{!isPaid ? (
				<div className="text-center py-8">
					<div className="text-6xl mb-4">🔒</div>
					<h2 className="text-2xl font-bold text-slate-800 mb-2">
						Tu CV está listo
					</h2>
					<p className="text-slate-600 mb-6">
						Desbloquea tu CV optimizado y descárgalo en PDF
					</p>

					<div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
						<h3 className="font-semibold text-slate-800 mb-3">
							Lo que incluye:
						</h3>
						<ul className="space-y-2 text-slate-600">
							<li className="flex items-center gap-2">
								<span className="text-green-500">✓</span> CV reescrito y
								optimizado
							</li>
							<li className="flex items-center gap-2">
								<span className="text-green-500">✓</span> Palabras clave
								añadidas para ATS
							</li>
							<li className="flex items-center gap-2">
								<span className="text-green-500">✓</span> Formato profesional
								europeo
							</li>
							<li className="flex items-center gap-2">
								<span className="text-green-500">✓</span> Descarga en PDF
							</li>
						</ul>
					</div>

					<div className="text-3xl font-bold text-slate-800 mb-6">8.99 €</div>

					{!showPaymentForm ? (
						<button
							type="button"
							onClick={() => setShowPaymentForm(true)}
							className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-lg"
						>
							Pagar y desbloquear
						</button>
					) : (
						<PaymentModal
							onSuccess={() => setIsPaid(true)}
							onCancel={() => setShowPaymentForm(false)}
						/>
					)}

					<button
						type="button"
						onClick={onReset}
						className="mt-4 text-slate-500 hover:text-slate-700 text-sm"
					>
						← Volver atrás
					</button>
				</div>
			) : (
				<div>
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-slate-800">
							Tu CV Optimizado
						</h2>
						<button
							type="button"
							onClick={onReset}
							className="text-blue-600 hover:text-blue-700 text-sm"
						>
							Nuevo CV →
						</button>
					</div>

					{result.keywords.length > 0 && (
						<div className="mb-6">
							<h3 className="font-semibold text-slate-700 mb-2">
								Palabras clave añadidas:
							</h3>
							<div className="flex flex-wrap gap-2">
								{result.keywords.map((kw) => (
									<span
										key={kw}
										className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
									>
										{kw}
									</span>
								))}
							</div>
						</div>
					)}

					<div className="bg-slate-50 rounded-lg p-6 mb-6">
						<pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed">
							{result.optimizedCV}
						</pre>
					</div>

					<button
						type="button"
						onClick={handleDownloadPDF}
						className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
					>
						📄 Descargar PDF
					</button>
				</div>
			)}
		</div>
	);
}
