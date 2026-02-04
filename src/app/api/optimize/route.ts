import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";

export async function POST(req: NextRequest) {
	try {
		const { cvText, jobOffer, locale = "en" } = await req.json();

		if (!cvText || !jobOffer) {
			const t = await getTranslations({ locale, namespace: "api.errors" });
			return NextResponse.json(
				{ error: t("missingFields") },
				{ status: 400 },
			);
		}

		const tPrompt = await getTranslations({ locale, namespace: "api.prompt" });
		const prompt = tPrompt("systemRole", { cvText, jobOffer });

		const openaiKey = process.env.OPENAI_API_KEY;
		if (!openaiKey) {
			const tError = await getTranslations({ locale, namespace: "api.errors" });
			return NextResponse.json(
				{ error: tError("apiKeyNotConfigured") },
				{ status: 500 },
			);
		}

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${openaiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages: [
					{
						role: "system",
						content: tPrompt("systemMessage"),
					},
					{ role: "user", content: prompt },
				],
				temperature: 0.7,
				response_format: { type: "json_object" },
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error("OpenAI API Error:", errorData);
			throw new Error(`OpenAI API Error: ${JSON.stringify(errorData)}`);
		}

		const data = await response.json();
		const result = JSON.parse(data.choices[0].message.content);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error completo:", error);
		const errorMsg = error instanceof Error ? error.message : String(error);
		const tError = await getTranslations({ locale: "en", namespace: "api.errors" });
		return NextResponse.json(
			{ error: tError("processingError"), details: errorMsg },
			{ status: 500 },
		);
	}
}
