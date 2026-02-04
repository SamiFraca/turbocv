"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
	const tResult = useTranslations("result");
	const [isPaid, setIsPaid] = useState(false);
	const [showPaymentForm, setShowPaymentForm] = useState(false);
	const isDebugging = true;

	const handleDownloadPDF = () => {
		generatePDF(result.optimizedCV, result.keywords);
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

					{result.keywords && result.keywords.length > 0 && (
						<div className="mb-6">
							<h3 className="font-semibold text-slate-700 mb-2">
								{tResult("unlocked.keywordsLabel")}
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
						{tResult("unlocked.downloadButton")}
					</button>
				</div>
			)}
		</div>
	);
}
