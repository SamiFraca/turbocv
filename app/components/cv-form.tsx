"use client";

import { useState } from "react";

interface CVFormProps {
	onOptimize: (cvText: string, jobOffer: string) => Promise<void>;
}

export default function CVForm({ onOptimize }: CVFormProps) {
	const [cvText, setCvText] = useState("");
	const [jobOffer, setJobOffer] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async () => {
		if (!cvText.trim() || !jobOffer.trim()) return;

		setIsLoading(true);
		await onOptimize(cvText, jobOffer);
		setIsLoading(false);
	};

	return (
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
					onClick={handleSubmit}
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
						<h3 className="font-semibold text-slate-800">Optimizado para ATS</h3>
						<p className="text-sm text-slate-600 mt-1">
							Pasa los filtros automáticos
						</p>
					</div>
					<div>
						<div className="text-2xl mb-2">⚡</div>
						<h3 className="font-semibold text-slate-800">Resultado inmediato</h3>
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
	);
}
