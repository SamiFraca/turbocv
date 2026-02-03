"use client";

import { useState } from "react";
import PaymentModal from "./payment-modal";
import { generatePDF } from "../lib/pdf";

interface ResultViewProps {
	result: {
		optimizedCV: string;
		keywords: string[];
	};
	onReset: () => void;
}

export default function ResultView({ result, onReset }: ResultViewProps) {
	const [isPaid, setIsPaid] = useState(false);
	const [showPaymentForm, setShowPaymentForm] = useState(false);

	const handleDownloadPDF = () => {
		generatePDF(result.optimizedCV, result.keywords);
	};

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
