import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { PDFDocument, rgb } from "pdf-lib";
import { PDFParse } from "pdf-parse";

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
		const fontSize = 9;
		const margin = 15;
		const maxWidth = width - 2 * margin;
		const lineHeight = 11;
		
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
		console.log("Model: gpt-4o-mini");
		console.log("File ID:", uploadResult.id);

		const prompt = `${jobOffer}

You are a senior CV strategist and talent acquisition expert. Your task is to optimize the attached CV for this specific job offer.

## CRITICAL REQUIREMENTS

### Profile Section (2-3 structured paragraphs):
- Paragraph 1: Professional identity (years experience + core specialization)
- Paragraph 2: Key achievements directly relevant to the job offer
- Paragraph 3: Value proposition with 2-3 most relevant skills from the job requirements
- Use professional, confident tone without generic adjectives
- Mirror terminology from the job offer where authentic

### Content Rules:
- Extract and integrate keywords naturally from the job offer
- Quantify achievements with metrics (%, €, time, scale, team size)
- Maintain 100% factual accuracy - no exaggeration or fabrication
- Use reverse chronological order
- Write in the SAME language as the original CV
- Keep descriptions impact-focused and evidence-based

### Skills Alignment:
- Prioritize skills that appear in BOTH the CV and job offer
- Group skills logically (technical, soft, domain-specific)
- Include proficiency levels when evident from experience

## JSON OUTPUT STRUCTURE
Return ONLY this exact JSON structure:

{
  "name": "Full name from CV",
  "title": "Professional title aligned with job offer",
  "contact": {
    "email": "email",
    "phone": "phone", 
    "location": "city/location",
    "links": {
      "linkedin": "URL or N/A",
      "github": "URL or N/A",
      "portfolio": "URL or N/A"
    }
  },
  "profile": "2-3 structured paragraphs: 1) Professional identity, 2) Relevant achievements, 3) Value proposition with aligned skills",
  "key_accomplishments": [
    "Quantified achievement directly relevant to the role",
    "Second quantified achievement with specific metrics"
  ],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name", 
      "dates": "Start - End",
      "description": "Achievement-focused description with metrics, tools, and business impact"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "school": "School name",
      "dates": "Year"
    }
  ],
  "certifications": ["Certification 1"],
  "skills": ["Skill1", "Skill2"],
  "tools": ["Tool1", "Tool2"],
  "languages": ["Language – Level"],
  "keywords": ["keyword1", "keyword2"]
}

Remember: Profile must be 2-3 structured paragraphs that naturally integrate key skills from both the CV and job offer.`;

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
		console.log("Full OpenAI response:", JSON.stringify(data, null, 2));
		
		// Debug: log all output items
		if (data.output) {
			data.output.forEach((item: any, idx: number) => {
				console.log(`Output[${idx}]:`, JSON.stringify(item, null, 2));
			});
		}
		
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
			console.error("Output structure:", JSON.stringify(data.output, null, 2));
			throw new Error("Invalid response from OpenAI API");
		}
		
		console.log("Raw content from OpenAI:", content);
		
		// Extract JSON from markdown code blocks if present
		let jsonString = content;
		const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
		if (jsonMatch) {
			jsonString = jsonMatch[1];
			console.log("Extracted JSON from markdown code block");
		}
		
		const result = JSON.parse(jsonString);
		console.log("Parsed result keys:", Object.keys(result));

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
		};

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

		const keywords = result.keywords || cvData.skills || [];

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

		console.log("=== Extracting original PDF text ===");
		const pdfBuffer = await pdfFile.arrayBuffer();
		let originalText = '';
		try {
			const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
			const textResult = await parser.getText();
			originalText = textResult.text || '';
		} catch (parseErr) {
			console.warn("Failed to extract original PDF text:", parseErr);
		}

		console.log("=== Modifying original PDF with optimized CV ===");
		const pdfBase64 = await modifyPDFWithOptimizedText(Buffer.from(pdfBuffer), flatCV);
		console.log("PDF modified, base64 length:", pdfBase64.length);

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
		console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
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
