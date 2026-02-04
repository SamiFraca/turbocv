import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { cvText, jobOffer } = await req.json();

		if (!cvText || !jobOffer) {
			return NextResponse.json(
				{ error: "CV y oferta son requeridos" },
				{ status: 400 },
			);
		}

		const prompt = `Eres un experto en optimización de CVs para sistemas ATS (Applicant Tracking Systems).

Tu tarea:
1. Analiza el CV del candidato
2. Analiza la oferta de trabajo
3. Reescribe el CV para maximizar las posibilidades de pasar filtros ATS

Reglas ESTRICTAS:
- NO inventes experiencia que no existe
- NO exageres ni uses lenguaje artificial tipo "ChatGPT"
- Mantén toda la información verídica
- Usa palabras clave de la oferta cuando sean relevantes
- Formato profesional europeo
- Lenguaje claro y directo

CV del candidato:
${cvText}

Oferta de trabajo:
${jobOffer}

Devuelve un JSON con esta estructura exacta:
{
  "optimizedCV": "CV reescrito completo",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

		const openaiKey = process.env.OPENAI_API_KEY;
		if (!openaiKey) {
			return NextResponse.json(
				{ error: "API key no configurada" },
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
						content:
							"Eres un experto en optimización de CVs. Respondes SOLO con JSON válido.",
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
		return NextResponse.json(
			{ error: "Error al procesar la solicitud", details: errorMsg },
			{ status: 500 },
		);
	}
}
