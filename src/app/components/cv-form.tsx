"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";

interface CVFormProps {
	onOptimize: (pdfFile: File, jobOffer: string) => Promise<void>;
}

export default function CVForm({ onOptimize }: CVFormProps) {
	const t = useTranslations("cvForm");
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const [cvFileName, setCvFileName] = useState("");
	const [jobOffer, setJobOffer] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	
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

	const handleSubmit = async () => {
		if (!pdfFile || !jobOffer.trim()) return;

		setIsLoading(true);
		await onOptimize(pdfFile, jobOffer);
		setIsLoading(false);
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

				<button
					type="button"
					onClick={handleSubmit}
					disabled={!pdfFile || !jobOffer.trim() || isLoading}
					className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
				>
					{isLoading ? t("analyzing") : t("optimizeButton")}
				</button>
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
