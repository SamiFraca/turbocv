"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PaymentModal from "./payment-modal";
import { downloadPDF } from "../lib/pdf-render";
import { getAllTemplates, TemplateType } from "../lib/cv-templates";
import type { StructuredCV } from "../lib/cv-types";

interface ResultViewProps {
	result: {
		optimizedCV: string;
		cvData?: StructuredCV;
		keywords: string[];
		originalText?: string;
		pdfBase64?: string;
	};
	onReset: () => void;
}

export default function ResultView({ result, onReset }: ResultViewProps) {
	const tResult = useTranslations("result");
	const [isPaid, setIsPaid] = useState(false);
	const [showPaymentForm, setShowPaymentForm] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("modern");
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const [activeTab, setActiveTab] = useState<"optimized" | "comparison">("optimized");
	const isDebugging = process.env.NEXT_PUBLIC_DEBUG_MODE === "true";
	const templates = getAllTemplates();

	const handleDownloadPDF = async () => {
		try {
			setIsGeneratingPDF(true);
			await downloadPDF(
				{
					optimizedCV: result.optimizedCV,
					cvData: result.cvData,
					keywords: result.keywords,
				},
				selectedTemplate,
				"optimized-cv.pdf"
			);
		} catch (error) {
			console.error("Error downloading PDF:", error);
			alert("Failed to generate PDF. Please try again.");
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-lg p-8">
			{!isPaid && !isDebugging ? (
				<div className="text-center py-8">
					<div className="text-6xl mb-4">🔒</div>
					<h2 className="text-2xl font-bold text-slate-800 mb-2">
						{tResult("locked.title")}
					</h2>
					<p className="text-slate-600 mb-6">
						{tResult("locked.description")}
					</p>

					<div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
						<h3 className="font-semibold text-slate-800 mb-3">
							{tResult("locked.featuresTitle")}
						</h3>
						<ul className="space-y-2 text-slate-600">
							<li className="flex items-center gap-2">
								<span className="text-green-500">✓</span> {tResult("locked.rewritten")}
							</li>
							<li className="flex items-center gap-2">
								<span className="text-green-500">✓</span> {tResult("locked.keywords")}
							</li>
							<li className="flex items-center gap-2">
								<span className="text-green-500">✓</span> {tResult("locked.format")}
							</li>
							<li className="flex items-center gap-2">
								<span className="text-green-500">✓</span> {tResult("locked.download")}
							</li>
						</ul>
					</div>

					<div className="text-3xl font-bold text-slate-800 mb-6">{tResult("locked.price")}</div>

					{!showPaymentForm || isDebugging ? (
						<button
							type="button"
							onClick={() => setShowPaymentForm(true)}
							className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-lg"
						>
							{tResult("locked.payButton")}
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
						{tResult("locked.backButton")}
					</button>
				</div>
			) : (
				<div>
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-slate-800">
							{tResult("unlocked.title")}
						</h2>
						<button
							type="button"
							onClick={onReset}
							className="text-blue-600 hover:text-blue-700 text-sm"
						>
							{tResult("unlocked.newCV")}
						</button>
					</div>

					{result.originalText && (
						<div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg">
							<button
								type="button"
								onClick={() => setActiveTab("optimized")}
								className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
									activeTab === "optimized"
										? "bg-white text-slate-900 shadow-sm"
										: "text-slate-500 hover:text-slate-700"
								}`}
							>
								{tResult("unlocked.tabOptimized")}
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("comparison")}
								className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
									activeTab === "comparison"
										? "bg-white text-slate-900 shadow-sm"
										: "text-slate-500 hover:text-slate-700"
								}`}
							>
								{tResult("unlocked.tabComparison")}
							</button>
						</div>
					)}

					{activeTab === "comparison" && result.originalText ? (
						<div className="grid md:grid-cols-2 gap-4 mb-6">
							<div className="border border-red-200 rounded-xl p-5 bg-red-50/30">
								<div className="flex items-center gap-2 mb-3">
									<span className="text-red-500">✗</span>
									<h3 className="text-sm font-semibold text-red-800">{tResult("unlocked.beforeLabel")}</h3>
								</div>
								<pre className="whitespace-pre-wrap text-xs text-slate-600 leading-relaxed max-h-96 overflow-y-auto">
									{result.originalText}
								</pre>
							</div>
							<div className="border border-green-200 rounded-xl p-5 bg-green-50/30">
								<div className="flex items-center gap-2 mb-3">
									<span className="text-green-500">✓</span>
									<h3 className="text-sm font-semibold text-green-800">{tResult("unlocked.afterLabel")}</h3>
								</div>
								<pre className="whitespace-pre-wrap text-xs text-slate-600 leading-relaxed max-h-96 overflow-y-auto">
									{result.optimizedCV}
								</pre>
							</div>
						</div>
					) : (
						<>
							{result.cvData && (
								<div className="space-y-5 mb-6">
									<div className="bg-slate-50 rounded-lg p-6">
										<h3 className="text-lg font-bold text-slate-900">{result.cvData.name}</h3>
										<p className="text-sm text-slate-600">{result.cvData.title}</p>
										<p className="text-xs text-slate-500 mt-1">
											{[result.cvData.contact.email, result.cvData.contact.phone, result.cvData.contact.location].filter(Boolean).join(' · ')}
										</p>
									</div>

									{result.cvData.profile && (
										<div>
											<h4 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide">{tResult("unlocked.profileLabel")}</h4>
											<p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.cvData.profile}</p>
										</div>
									)}

									{result.cvData.key_accomplishments && result.cvData.key_accomplishments.length > 0 && (
										<div>
											<h4 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide">{tResult("unlocked.accomplishmentsLabel")}</h4>
											<ul className="space-y-1">
												{result.cvData.key_accomplishments.map((acc, idx) => (
													<li key={idx} className="text-sm text-slate-700 flex gap-2">
														<span className="text-blue-500 shrink-0">•</span> {acc}
													</li>
												))}
											</ul>
										</div>
									)}

									{result.cvData.experience.length > 0 && (
										<div>
											<h4 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide">{tResult("unlocked.experienceLabel")}</h4>
											<div className="space-y-3">
												{result.cvData.experience.map((job, idx) => (
													<div key={idx} className="border-l-2 border-blue-200 pl-4">
														<div className="flex justify-between items-start">
															<p className="text-sm font-semibold text-slate-800">{job.title}</p>
															<span className="text-xs text-slate-500 shrink-0 ml-2">{job.dates}</span>
														</div>
														<p className="text-xs text-slate-600">{job.company}</p>
														<p className="text-sm text-slate-700 mt-1 leading-relaxed">{job.description}</p>
													</div>
												))}
											</div>
										</div>
									)}

									{result.cvData.education.length > 0 && (
										<div>
											<h4 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide">{tResult("unlocked.educationLabel")}</h4>
											{result.cvData.education.map((edu, idx) => (
												<div key={idx} className="text-sm text-slate-700">
													<span className="font-medium">{edu.degree}</span> — {edu.school} {edu.dates && <span className="text-slate-500">({edu.dates})</span>}
												</div>
											))}
										</div>
									)}

									{result.cvData.skills.length > 0 && (
										<div>
											<h4 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide">{tResult("unlocked.skillsLabel")}</h4>
											<div className="flex flex-wrap gap-2">
												{result.cvData.skills.map((skill) => (
													<span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{skill}</span>
												))}
											</div>
										</div>
									)}

									{result.cvData.tools && result.cvData.tools.length > 0 && (
										<div>
											<h4 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide">{tResult("unlocked.toolsLabel")}</h4>
											<div className="flex flex-wrap gap-2">
												{result.cvData.tools.map((tool) => (
													<span key={tool} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">{tool}</span>
												))}
											</div>
										</div>
									)}

									{result.cvData.languages && result.cvData.languages.length > 0 && (
										<div>
											<h4 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide">{tResult("unlocked.languagesLabel")}</h4>
											<div className="flex flex-wrap gap-2">
												{result.cvData.languages.map((lang) => (
													<span key={lang} className="text-sm text-slate-700">{lang}</span>
												))}
											</div>
										</div>
									)}

									{result.cvData.certifications.length > 0 && (
										<div>
											<h4 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide">{tResult("unlocked.certificationsLabel")}</h4>
											<ul className="space-y-1">
												{result.cvData.certifications.map((cert, idx) => (
													<li key={idx} className="text-sm text-slate-700">{cert}</li>
												))}
											</ul>
										</div>
									)}
								</div>
							)}

							{result.keywords && result.keywords.length > 0 && (
								<div className="mb-6">
									<h3 className="font-semibold text-slate-700 mb-2">
										{tResult("unlocked.keywordsLabel")}
									</h3>
									<div className="flex flex-wrap gap-2">
										{result.keywords.map((kw) => (
											<span
												key={kw}
												className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
											>
												{kw}
											</span>
										))}
									</div>
								</div>
							)}
						</>
					)}

					<div className="mb-6">
						<h3 className="font-semibold text-slate-700 mb-3">{tResult("unlocked.templateLabel")}</h3>
						<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
							{templates.map((template) => (
								<button
									key={template.id}
									type="button"
									onClick={() => setSelectedTemplate(template.id)}
									className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
										selectedTemplate === template.id
											? "border-blue-600 bg-blue-50 text-blue-900"
											: "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
									}`}
									title={template.description}
								>
									{template.name}
								</button>
							))}
						</div>
					</div>

					<button
						type="button"
						onClick={handleDownloadPDF}
						disabled={isGeneratingPDF}
						className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors text-lg"
					>
						{isGeneratingPDF ? tResult("unlocked.generatingPDF") : tResult("unlocked.downloadButton")}
					</button>
				</div>
			)}
		</div>
	);
}
