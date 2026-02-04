import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { PDFDocument, PDFPage, rgb } from "pdf-lib";

export async function POST(req: NextRequest) {
	try {
		const { cvBase64, jobOffer, locale = "en" } = await req.json();

		if (!cvBase64 || !jobOffer) {
			const t = await getTranslations({ locale, namespace: "api.errors" });
			return NextResponse.json(
				{ error: t("missingFields") },
				{ status: 400 },
			);
		}

		const tPrompt = await getTranslations({ locale, namespace: "api.prompt" });
		const prompt = tPrompt("systemRole", { cvText: `data:application/pdf;base64,${cvBase64}`, jobOffer });

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

		try {
			const pdfBytes = Buffer.from(cvBase64, "base64");
			const pdfDoc = await PDFDocument.load(pdfBytes);
			const pages = pdfDoc.getPages();

			const pageHeight = pages[0].getHeight();
			const pageWidth = pages[0].getWidth();
			const margin = 20;
			const fontSize = 10;
			const lineHeight = 12;

			pages.forEach((page) => {
				page.drawText(result.optimizedCV, {
					x: margin,
					y: pageHeight - margin,
					size: fontSize,
					color: rgb(0, 0, 0),
					maxWidth: pageWidth - 2 * margin,
					lineHeight: lineHeight,
				});
			});

			const modifiedPdfBytes = await pdfDoc.save();
			const pdfBase64 = Buffer.from(modifiedPdfBytes).toString("base64");

			return NextResponse.json({
				...result,
				pdfBase64,
			});
		} catch (pdfError) {
			console.warn("PDF modification failed, returning text only:", pdfError);
			return NextResponse.json(result);
		}
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
