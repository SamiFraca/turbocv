import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";

export async function POST(req: NextRequest) {
	try {
		console.log("=== API Request Started ===");
		
		const formData = await req.formData();
		console.log("FormData keys:", Array.from(formData.keys()));
		
		const pdfFile = formData.get("pdf") as File;
		const jobOffer = formData.get("jobOffer") as string;
		const locale = formData.get("locale") as string || "en";
		
		console.log("PDF file present:", !!pdfFile);
		console.log("PDF file name:", pdfFile?.name);
		console.log("PDF file size:", pdfFile?.size);
		console.log("PDF file type:", pdfFile?.type);
		console.log("jobOffer present:", !!jobOffer);
		console.log("jobOffer length:", jobOffer?.length);
		console.log("locale:", locale);

		if (!pdfFile || !jobOffer) {
			console.log("=== Validation Failed ===");
			console.log("Missing PDF file:", !pdfFile);
			console.log("Missing jobOffer:", !jobOffer);
			const t = await getTranslations({ locale, namespace: "api.errors" });
			return NextResponse.json(
				{ 
					error: t("missingFields"),
					debug: {
						hasPdfFile: !!pdfFile,
						hasJobOffer: !!jobOffer,
						pdfFileName: pdfFile?.name || null,
						pdfFileSize: pdfFile?.size || 0,
						jobOfferLength: jobOffer?.length || 0,
						locale
					}
				},
				{ status: 400 },
			);
		}
		
		console.log("=== Validation Passed ===");

		const tPrompt = await getTranslations({ locale, namespace: "api.prompt" });

		const openaiKey = process.env.OPENAI_API_KEY;
		if (!openaiKey) {
			const tError = await getTranslations({ locale, namespace: "api.errors" });	
			return NextResponse.json(
				{ error: tError("apiKeyNotConfigured") },
				{ status: 500 },
			);
		}

		console.log("=== Uploading PDF to OpenAI Files API ===");
		
		// Create form data for file upload
		const uploadFormData = new FormData();
		uploadFormData.append("file", pdfFile);
		uploadFormData.append("purpose", "assistants");
		
		console.log("Uploading file...");
		const uploadResponse = await fetch("https://api.openai.com/v1/files", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${openaiKey}`,
			},
			body: uploadFormData,
		});
		
		if (!uploadResponse.ok) {
			const uploadError = await uploadResponse.json();
			console.error("File upload error:", uploadError);
			throw new Error(`File upload failed: ${JSON.stringify(uploadError)}`);
		}
		
		const uploadResult = await uploadResponse.json();
		console.log("File uploaded successfully:", uploadResult.id);
		
		console.log("=== Calling OpenAI Responses API ===");
		console.log("Model: gpt-5");
		console.log("File ID:", uploadResult.id);
		
		const requestBody = {
			model: "gpt-5",
			input: [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_file",
                        "file_id": uploadResult.id
                    },
                    {
                        "type": "input_text",
                        "text": jobOffer + "\n\nPlease return a JSON with:\n{\n  \"optimizedCV\": \"Rewritten complete CV\",\n  \"keywords\": [\"keyword1\", \"keyword2\", \"keyword3\"]\n}"
                    }
                ]
            }
			],
			text: {
				format: {
					type: "json_object"
				}
			}
		};
		
		console.log("Request body size:", JSON.stringify(requestBody).length);
		
		const response = await fetch("https://api.openai.com/v1/responses", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${openaiKey}`,
			},
			body: JSON.stringify(requestBody),
		});

		console.log("OpenAI Response Status:", response.status);
		console.log("OpenAI Response Headers:", Object.fromEntries(response.headers.entries()));

		if (!response.ok) {
			const errorData = await response.json();
			console.error("=== OpenAI API Error ===");
			console.error("Status:", response.status);
			console.error("Status Text:", response.statusText);
			console.error("Error Data:", JSON.stringify(errorData, null, 2));
			throw new Error(`OpenAI API Error: ${JSON.stringify(errorData)}`);
		}
		
		console.log("=== OpenAI API Success ===");

		console.log("=== Parsing OpenAI Response ===");
		const data = await response.json();
		console.log("OpenAI response structure:", {
			hasOutput: !!data.output,
			outputLength: data.output?.length,
			firstOutput: data.output?.[0] ? {
				hasContent: !!data.output[0]?.content?.[0],
				contentType: data.output[0]?.content?.[0]?.type,
				contentLength: data.output[0]?.content?.[0]?.text?.length
			} : null
		});
		
		// Clean up uploaded file
		console.log("=== Cleaning up uploaded file ===");
		try {
			await fetch(`https://api.openai.com/v1/files/${uploadResult.id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${openaiKey}`,
				},
			});
			console.log("File deleted successfully");
		} catch (cleanupError) {
			console.warn("Failed to delete file:", cleanupError);
		}
		
		if (!data.output?.[0]?.content?.[0]?.text) {
			console.error("Invalid OpenAI response structure");
			throw new Error("Invalid response from OpenAI API");
		}
		
		console.log("Raw content from OpenAI:", data.output[0].content[0].text.substring(0, 200) + "...");
		
		const result = JSON.parse(data.output[0].content[0].text);
		console.log("Parsed result keys:", Object.keys(result));
		console.log("Optimized CV length:", result.optimizedCV?.length);
		console.log("Keywords count:", result.keywords?.length);

		console.log("=== API Request Completed Successfully ===");
		return NextResponse.json(result);
	} catch (error: unknown) {
		console.error("=== API Request Failed ===");
		console.error("Error type:", error instanceof Error ? error.constructor.name : 'Unknown');
		console.error("Error message:", error instanceof Error ? error.message : String(error));
		console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
		const errorMsg = error instanceof Error ? error.message : String(error);
		const tError = await getTranslations({ locale: "en", namespace: "api.errors" });
		return NextResponse.json(
			{ 
				error: tError("genericError"), 
				details: errorMsg,
				debug: {
					errorType: error instanceof Error ? error.constructor.name : 'Unknown',
					message: errorMsg
				}
			},
			{ status: 500 },
		);
	}
}
