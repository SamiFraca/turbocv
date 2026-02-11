"use client";

import {
	Elements,
	PaymentElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface PaymentFormProps {
	onSuccess: () => void;
	onCancel: () => void;
}

function CheckoutForm({ onSuccess, onCancel }: PaymentFormProps) {
	const t = useTranslations("payment");
	const stripe = useStripe();
	const elements = useElements();
	const [isProcessing, setIsProcessing] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements) return;

		setIsProcessing(true);
		setErrorMessage("");

		const { error } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/success`,
			},
			redirect: "if_required",
		});

		if (error) {
			setErrorMessage(error.message || t("error"));
			setIsProcessing(false);
		} else {
			onSuccess();
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<PaymentElement />

			{errorMessage && (
				<div className="text-red-600 text-sm">{errorMessage}</div>
			)}

			<div className="flex gap-3">
				<button
					type="submit"
					disabled={!stripe || isProcessing}
					className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
				>
					{isProcessing ? t("processing") : t("payButton")}
				</button>
				<button
					type="button"
					onClick={onCancel}
					className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors"
				>
					{t("cancelButton")}
				</button>
			</div>
		</form>
	);
}

export default function PaymentModal({
	onSuccess,
	onCancel,
}: PaymentFormProps) {
	const [clientSecret, setClientSecret] = useState<string | null>(null);

	useEffect(() => {
		fetch("/api/payment", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ amount: 899 }),
		})
			.then((res) => res.json())
			.then((data) => setClientSecret(data.clientSecret));
	}, []);

	if (!clientSecret) {
		return (
			<div className="text-center py-8">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
			</div>
		);
	}

	return (
		<Elements stripe={stripePromise} options={{ clientSecret }}>
			<CheckoutForm onSuccess={onSuccess} onCancel={onCancel} />
		</Elements>
	);
}
