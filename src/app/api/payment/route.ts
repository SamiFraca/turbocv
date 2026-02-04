import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2026-01-28.clover",
});

export async function POST(req: NextRequest) {
	try {
		const { amount } = await req.json();

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount || 899,
			currency: "eur",
			automatic_payment_methods: {
				enabled: true,
			},
		});

		return NextResponse.json({
			clientSecret: paymentIntent.client_secret,
		});
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "Error al crear el pago" },
			{ status: 500 },
		);
	}
}
