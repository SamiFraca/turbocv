"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { 
	processPDFFile as processPDFFileUtil,
	handleFileUpload as handleFileUploadUtil,
	handleDragOver as handleDragOverUtil,
	handleDragLeave as handleDragLeaveUtil,
	handleDrop as handleDropUtil
} from '../utils/file-handling';
import { extractTextFromPDF as extractTextFromPDFUtil } from '../utils/pdf-processing';
import { getLoadingPhrase, createLoadingAnimation } from '../utils/loading';

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
	const getLoadingPhraseForProgress = (progress: number) => getLoadingPhrase(progress, t);

	// Animate loading progress from 0% to 99%
	useEffect(() => {
		let cleanup: (() => void) | null = null;
		
		if (isLoading) {
			cleanup = createLoadingAnimation(setLoadingProgress);
		} else {
			setLoadingProgress(0);
		}
		
		return () => {
			if (cleanup) cleanup();
		};
	}, [isLoading]);

	const processPDFFile = async (file: File) => {
		await processPDFFileUtil(file, setPdfFile, setCvFileName, t);
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		await handleFileUploadUtil(e, processPDFFile);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		handleDragOverUtil(e, setIsDragging);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		handleDragLeaveUtil(e, setIsDragging);
	};

	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		await handleDropUtil(e, setIsDragging, processPDFFile);
	};

	const extractTextFromPDF = async (file: File): Promise<string> => {
		return await extractTextFromPDFUtil(file);
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
							{getLoadingPhraseForProgress(loadingProgress)}
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
