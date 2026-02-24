import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { PDFDocument, rgb } from "pdf-lib";
import { generateCVOptimizationPrompt } from "@/app/utils/prompts";
import { detectCVLanguage } from "@/app/utils/language-detection";

// PDF layout configuration
const PDF_CONFIG = {
	fontSize: 9,
	margin: 15,
	lineHeight: 11,
	maxOriginalTextLength: 50000, // Maximum characters for original text
} as const;

async function modifyPDFWithOptimizedText(pdfBuffer: Buffer, optimizedText: string): Promise<string> {
	try {
		// Load the original PDF
		const pdfDoc = await PDFDocument.load(pdfBuffer);
		let pages = pdfDoc.getPages();
		
		if (pages.length === 0) {
			throw new Error("PDF has no pages");
		}
		
		// Get dimensions from the first page
		const firstPage = pages[0];
		const { width, height } = firstPage.getSize();
		
		// Strategy: Create a semi-transparent white rectangle to cover text areas,
		// then write optimized text on top. This preserves images and styling underneath.
		const fontSize = PDF_CONFIG.fontSize;
		const margin = PDF_CONFIG.margin;
		const maxWidth = width - 2 * margin;
		const lineHeight = PDF_CONFIG.lineHeight;
		
		let yPosition = height - margin;
		const lines = optimizedText.split('\n');
		let pageIndex = 0;
		
		for (const line of lines) {
			const wrappedLines = wrapText(line, maxWidth, fontSize);
			
			for (const wrappedLine of wrappedLines) {
				if (yPosition < margin) {
					pageIndex++;
					if (pageIndex >= pages.length) {
						pdfDoc.addPage([width, height]);
						pages = pdfDoc.getPages();
					}
					yPosition = height - margin;
				}
				
				const currentPage = pages[pageIndex];
				
				// Draw a white rectangle to cover the area (preserves images below)
				currentPage.drawRectangle({
					x: margin - 2,
					y: yPosition - 8,
					width: maxWidth + 4,
					height: lineHeight,
					color: rgb(1, 1, 1),
					opacity: 0.95,
				});
				
				// Draw the optimized text on top
				currentPage.drawText(wrappedLine, {
					x: margin,
					y: yPosition,
					size: fontSize,
					color: rgb(0, 0, 0),
				});
				
				yPosition -= lineHeight;
			}
		}
		
		// Save and return as base64
		const pdfBytes = await pdfDoc.save();
		return Buffer.from(pdfBytes).toString('base64');
	} catch (error) {
		console.error("Error modifying PDF:", error);
		return "";
	}
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
	// Rough estimation: each character is about 0.5 * fontSize in width
	const charsPerLine = Math.floor(maxWidth / (fontSize * 0.5));
	const lines: string[] = [];
	
	let currentLine = "";
	for (const word of text.split(" ")) {
		if ((currentLine + word).length > charsPerLine) {
			if (currentLine) lines.push(currentLine);
			currentLine = word;
		} else {
			currentLine += (currentLine ? " " : "") + word;
		}
	}
	if (currentLine) lines.push(currentLine);
	
	return lines;
}

export async function POST(req: NextRequest) {
	try {
		console.log("=== API Request Started ===");
		
		const formData = await req.formData();
		
		const pdfFile = formData.get("pdf") as File;
		const jobOffer = formData.get("jobOffer") as string;
		const originalText = formData.get("originalText") as string || '';
		const locale = formData.get("locale") as string || "en";
		
		// Validate original text length
		if (originalText.length > PDF_CONFIG.maxOriginalTextLength) {
			const tError = await getTranslations({ locale, namespace: "api.errors" });
			return NextResponse.json(
				{ error: tError("textTooLong"), maxLength: PDF_CONFIG.maxOriginalTextLength },
				{ status: 400 }
			);
		}
		
		console.log("PDF file present:", !!pdfFile);
		console.log("PDF file name:", pdfFile?.name);
		console.log("PDF file size:", pdfFile?.size);
		console.log("PDF file type:", pdfFile?.type);
		console.log("jobOffer present:", !!jobOffer);
		console.log("jobOffer length:", jobOffer?.length);
		console.log("locale:", locale);

		if (!pdfFile || !jobOffer) {
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
		
		const uploadResponse = await fetch("https://api.openai.com/v1/files", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${openaiKey}`,
			},
			body: uploadFormData,
		});
		
		if (!uploadResponse.ok) {
			const uploadError = await uploadResponse.json();
			throw new Error(`File upload failed: ${JSON.stringify(uploadError)}`);
		}
		
		const uploadResult = await uploadResponse.json();
		console.log("File uploaded successfully:", uploadResult.id);

		// Detect the language of the original CV
		const detectedLanguage = detectCVLanguage(originalText);
		console.log("Detected CV language:", detectedLanguage);

		const prompt = generateCVOptimizationPrompt({
			jobOffer,
			cvText: originalText,
			detectedLanguage
		});

		console.log("=== Calling OpenAI Responses API ===");
		
		const requestBody = {
			model: "gpt-4o-mini",
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
							"text": prompt
						}
					]
				}
			],
		};

		const response = await fetch("https://api.openai.com/v1/responses", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${openaiKey}`,
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error("=== OpenAI API Error ===");
			console.error("Status:", response.status);
			console.error("Error Data:", JSON.stringify(errorData, null, 2));
			throw new Error(`OpenAI API Error: ${JSON.stringify(errorData)}`);
		}
		
		console.log("=== OpenAI API Success ===");
		console.log("=== Parsing OpenAI Response ===");
		
		const data = await response.json();
		
		// The Responses API returns content in output[].content[].text
		// Find the first output with actual text content
		let content: string | null = null;
		for (const output of data.output || []) {
			for (const contentItem of output.content || []) {
				if (contentItem.text) {
					content = contentItem.text;
					break;
				}
			}
			if (content) break;
		}
		
		if (!content) {
			console.error("Invalid OpenAI response structure - no content found");
			throw new Error("Invalid response from OpenAI API");
		}
		
		console.log("Raw content extracted from OpenAI");
		
		// Extract JSON from markdown code blocks if present
		let jsonString = content;
		const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
		if (jsonMatch) {
			jsonString = jsonMatch[1];
			console.log("Extracted JSON from markdown code block");
		}

		const result = JSON.parse(jsonString);

		// Build structured CV data
		const cvData = {
			name: result.name || '',
			title: result.title || '',
			contact: result.contact || { email: '', phone: '', location: '' },
			profile: result.profile || '',
			key_accomplishments: result.key_accomplishments || [],
			experience: result.experience || [],
			education: result.education || [],
			certifications: result.certifications || [],
			skills: result.skills || [],
			tools: result.tools || [],
			languages: result.languages || [],
			language: detectedLanguage,
		};

		const keywords = result.keywords || cvData.skills || [];

		console.log("=== Cleaning up uploaded file ===");
		// Implement retry mechanism for file cleanup
		let cleanupAttempts = 0;
		const maxCleanupAttempts = 3;
		while (cleanupAttempts < maxCleanupAttempts) {
			try {
				await fetch(`https://api.openai.com/v1/files/${uploadResult.id}`, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${openaiKey}`,
					},
				});
				console.log("File deleted successfully");
				break;
			} catch (cleanupError) {
				cleanupAttempts++;
				if (cleanupAttempts >= maxCleanupAttempts) {
					console.warn(`Failed to delete file after ${maxCleanupAttempts} attempts:`, cleanupError);
					// Could add to a cleanup queue here for later retry
				} else {
					console.warn(`Cleanup attempt ${cleanupAttempts} failed, retrying...`);
					await new Promise(resolve => setTimeout(resolve, 1000 * cleanupAttempts)); // Exponential backoff
				}
			}
		}

		console.log("=== Modifying original PDF with optimized CV ===");
		// Original text will be extracted client-side and sent with the request
		const pdfBuffer = await pdfFile.arrayBuffer();

		// Build flat text for the PDF overlay (backward compat)
		const flatCV = [
			cvData.name,
			cvData.title,
			`${cvData.contact.email} | ${cvData.contact.phone} | ${cvData.contact.location}`,
			'',
			cvData.profile,
			'',
			...cvData.experience.flatMap((job: { title: string; company: string; dates: string; description: string }) => [
				`${job.title} - ${job.company} (${job.dates})`,
				job.description,
				'',
			]),
			...cvData.education.map((edu: { degree: string; school: string; dates: string }) => `${edu.degree} - ${edu.school} (${edu.dates})`),
		].join('\n');

		const pdfBase64 = await modifyPDFWithOptimizedText(Buffer.from(pdfBuffer), flatCV);

		return NextResponse.json({
			optimizedCV: flatCV,
			cvData,
			keywords,
			originalText,
			pdfBase64
		});
	} catch (error: unknown) {
		console.error("=== API Request Failed ===");
		console.error("Error type:", error instanceof Error ? error.constructor.name : 'Unknown');
		console.error("Error message:", error instanceof Error ? error.message : String(error));
		const errorMsg = error instanceof Error ? error.message : String(error);
		return NextResponse.json(
			{ 
				error: "An error occurred while processing your request", 
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
