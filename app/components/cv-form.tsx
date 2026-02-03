"use client";

import { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined") {
	pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface CVFormProps {
	onOptimize: (cvText: string, jobOffer: string) => Promise<void>;
}

export default function CVForm({ onOptimize }: CVFormProps) {
	const [cvText, setCvText] = useState("");
	const [jobOffer, setJobOffer] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isExtracting, setIsExtracting] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const extractTextFromPDF = async (file: File): Promise<string> => {
		const arrayBuffer = await file.arrayBuffer();
		const typedArray = new Uint8Array(arrayBuffer);
		
		const loadingTask = pdfjsLib.getDocument({ data: typedArray });
		const pdf = await loadingTask.promise;
		let fullText = "";

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			const textContent = await page.getTextContent();
			const pageText = textContent.items
				.map((item: any) => item.str)
				.join(" ");
			fullText += pageText + "\n";
		}

		return fullText.trim();
	};

	const processPDFFile = async (file: File) => {
		if (file.type !== "application/pdf") {
			alert("Por favor, sube un archivo PDF");
			return;
		}

		setIsExtracting(true);
		try {
			const text = await extractTextFromPDF(file);
			setCvText(text);
		} catch (error) {
			console.error("Error extrayendo PDF:", error);
			const errorMsg = error instanceof Error ? error.message : String(error);
			alert(`Error al leer el PDF: ${errorMsg}\n\nIntenta copiar y pegar el texto.`);
		} finally {
			setIsExtracting(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		await processPDFFile(file);
	};

	const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files?.[0];
		if (!file) return;
		await processPDFFile(file);
	};

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
					<div className="flex items-center justify-between mb-2">
						<label
							htmlFor="cv"
							className="block text-sm font-semibold text-slate-700"
						>
							Tu CV (copia y pega el texto o sube PDF)
						</label>
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							disabled={isExtracting}
							className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-slate-400"
						>
							{isExtracting ? "Extrayendo..." : "📄 Subir PDF"}
						</button>
						<input
							ref={fileInputRef}
							type="file"
							accept=".pdf"
							onChange={handleFileUpload}
							className="hidden"
						/>
					</div>
					<textarea
						id="cv"
						rows={8}
						className={`w-full px-4 py-3 rounded-lg border transition-all resize-none ${
							isDragging
								? "border-blue-500 border-2 bg-blue-50"
								: "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						}`}
						placeholder="Pega aquí tu currículum o arrastra un PDF..."
						value={cvText}
						onChange={(e) => setCvText(e.target.value)}
						disabled={isExtracting}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
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
