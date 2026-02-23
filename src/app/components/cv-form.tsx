"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

// Set up PDF.js worker for client-side with fallback
if (typeof window !== 'undefined') {
	try {
		pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
	} catch (error) {
		console.warn('Failed to load PDF.js worker from CDN, using local fallback');
		pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';
	}
}

interface CVFormProps {
	onOptimize: (pdfFile: File, jobOffer: string, originalText: string) => Promise<void>;
	error?: string | null;
	onError?: (error: string) => void;
}

export default function CVForm({ onOptimize, error, onError }: CVFormProps) {
	const t = useTranslations("cvForm");
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const [cvFileName, setCvFileName] = useState("");
	const [jobOffer, setJobOffer] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Loading phrases that change based on progress
	const getLoadingPhrase = (progress: number) => {
		if (progress < 20) return t("analyzing");
		if (progress < 40) return t("extractingSkills");
		if (progress < 60) return t("matchingKeywords");
		if (progress < 80) return t("optimizingContent");
		return t("finalizing");
	};

	// Animate loading progress from 0% to 99%
	useEffect(() => {
		if (isLoading) {
			setLoadingProgress(0);
			const interval = setInterval(() => {
				setLoadingProgress((prev) => {
					if (prev >= 99) return 99;
					const increment = Math.random() * 15 + 5; 
					const newProgress = prev + increment;
					return newProgress >= 99 ? 99 : newProgress;
				});
			}, Math.random() * 1300 + 700); 

			return () => clearInterval(interval);
		} else {
			setLoadingProgress(0);
		}
	}, [isLoading]);

	const processPDFFile = async (file: File) => {
		if (file.type !== "application/pdf") {
			alert(t("pdfAlert"));
			return;
		}

		try {
			setPdfFile(file);
			setCvFileName(file.name);
		} catch (error) {
			console.error("Error processing PDF:", error);
			alert(t("pdfError"));
		}
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		await processPDFFile(file);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files?.[0];
		if (!file) return;
		await processPDFFile(file);
	};

	const extractTextFromPDF = async (file: File): Promise<string> => {
		let pdf: pdfjsLib.PDFDocumentProxy | null = null;
		try {
			const arrayBuffer = await file.arrayBuffer();
			pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
			const textParts: string[] = [];

			for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
				const page = await pdf.getPage(pageNum);
				const textContent = await page.getTextContent();
				const pageText = textContent.items
					.filter((item): item is TextItem => 'str' in item)
					.map((item: TextItem) => item.str || '')
					.join(' ');
				textParts.push(pageText);
			}

			// Clean up the extracted text with optimized regex
			const rawText = textParts.join('\n\n');
			const cleanedText = rawText
				// Combined text cleaning operations for better performance
				.replace(/https\s*:\s*\/\s*/g, 'https://')
				.replace(/www\s*\.\s*/g, 'www.')
				.replace(/\s+@\s+/g, '@')
				.replace(/([a-zA-Z])\s+([áéíóúÁÉÍÓÚñÑ])/g, '$1$2')
				.replace(/([áéíóúÁÉÍÓÚñÑ])\s+([a-zA-Z])/g, '$1$2')
				.replace(/([a-zA-ZáéíóúÁÉÍÓÚñÑ])\s+([.,;:!?])/g, '$1$2')
				.replace(/([.,;:!?])\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ])/g, '$1$2')
				.replace(/([a-z])([A-Z])/g, '$1 $2')
				.replace(/https\s*:\s*\/\s*\/\s*/g, 'https://')
				.replace(/\s*-\s*/g, '-')
				.replace(/\s{2,}/g, ' ')
				.replace(/\n\s*\n/g, '\n')
				.trim();

			// Add line breaks after periods (excluding URLs and emails)
			const finalText = cleanedText
				.replace(/([.?!])(?!\w*@|https?:\/\/|www\.)/g, '$1\n');

			return finalText;
		} catch (error) {
			console.error('Failed to extract PDF text:', error);
			throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF document.');
		} finally {
			// Clean up PDF document to prevent memory leaks
			if (pdf) {
				try {
					await pdf.destroy();
				} catch (cleanupError) {
					console.warn('Failed to cleanup PDF document:', cleanupError);
				}
			}
		}
	};

	const handleSubmit = async () => {
		if (!pdfFile || !jobOffer.trim()) return;

		setIsLoading(true);
		
		try {
			// Extract text from PDF on client-side
			const originalText = await extractTextFromPDF(pdfFile);
			
			// Validate extracted text
			if (!originalText.trim()) {
				throw new Error('Unable to extract text from the PDF. Please ensure the PDF contains readable text.');
			}
			
			await onOptimize(pdfFile, jobOffer, originalText);
		} catch (error) {
			console.error('Failed to process PDF:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF';
			if (onError) {
				onError(errorMessage);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-lg p-8">
			<div className="space-y-6">
				<div>
					<label className="block text-sm font-semibold text-slate-700 mb-2">
						{t("cvLabel")}
					</label>
					<div
						className={`w-full px-4 py-8 rounded-lg border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center min-h-40 ${
							isDragging
								? "border-blue-500 bg-blue-50"
								: "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
						}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={() => fileInputRef.current?.click()}
					>
						{cvFileName ? (
							<div className="text-center">
								<div className="text-3xl mb-2">📄</div>
								<p className="font-semibold text-slate-800">{cvFileName}</p>
								<p className="text-sm text-slate-500 mt-2">
									{t("uploadPDF")}
								</p>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										setPdfFile(null);
										setCvFileName("");
									}}
									className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
								>
									Remove
								</button>
							</div>
						) : (
							<div className="text-center">
								<div className="text-4xl mb-2">📁</div>
								<p className="font-semibold text-slate-800">
									{t("uploadPDF")}
								</p>
								<p className="text-sm text-slate-500 mt-1">
									{t("cvPlaceholder")}
								</p>
							</div>
						)}
						<input
							ref={fileInputRef}
							type="file"
							accept=".pdf"
							onChange={handleFileUpload}
							className="hidden"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="offer"
						className="block text-sm font-semibold text-slate-700 mb-2"
					>
						{t("jobLabel")}
					</label>
					<textarea
						id="offer"
						rows={6}
						className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
						placeholder={t("jobPlaceholder")}
						value={jobOffer}
						onChange={(e) => setJobOffer(e.target.value)}
					/>
				</div>

				{error && (
					<div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
						{error}
					</div>
				)}

				{isLoading ? (
					<div className="space-y-4">
						<div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden animate-pulse">
							<div 
								className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out " 
								style={{ width: `${loadingProgress}%` }} 
							/>
						</div>
						<p className="text-center text-slate-600 text-sm font-medium">
							{getLoadingPhrase(loadingProgress)}
						</p>
					</div>
				) : (
					<button
						type="button"
						onClick={handleSubmit}
						disabled={!pdfFile || !jobOffer.trim()}
						className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
					>
						{t("optimizeButton")}
					</button>
				)}
			</div>

			<div className="mt-12 pt-8 border-t border-slate-100">
				<div className="grid md:grid-cols-3 gap-6 text-center">
					<div>
						<div className="text-2xl mb-2">🎯</div>
						<h3 className="font-semibold text-slate-800">{t("features.atsOptimized")}</h3>
						<p className="text-sm text-slate-600 mt-1">
							{t("features.atsOptimizedDesc")}
						</p>
					</div>
					<div>
						<div className="text-2xl mb-2">⚡</div>
						<h3 className="font-semibold text-slate-800">{t("features.immediateResult")}</h3>
						<p className="text-sm text-slate-600 mt-1">
							{t("features.immediateResultDesc")}
						</p>
					</div>
					<div>
						<div className="text-2xl mb-2">✅</div>
						<h3 className="font-semibold text-slate-800">{t("features.noLies")}</h3>
						<p className="text-sm text-slate-600 mt-1">
							{t("features.noLiesDesc")}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
