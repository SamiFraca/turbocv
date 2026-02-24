/**
 * PDF processing utilities
 */

import { processPDFText } from './text-cleaning';

/**
 * Extracts text from a PDF file using PDF.js
 * @param file - PDF file to extract text from
 * @returns Extracted and processed text
 * @throws Error if PDF text extraction fails
 */
export async function extractTextFromPDF(file: File): Promise<string> {
	// Dynamic import to avoid SSR issues
	if (typeof window === 'undefined') {
		throw new Error('PDF processing is only available in the browser environment');
	}

	// Use mock if available (for testing)
	if (typeof (window as any).__mockExtractTextFromPDF === 'function') {
		return (window as any).__mockExtractTextFromPDF();
	}

	try {
		const pdfjsLib = await import('pdfjs-dist');
		
		// Set worker source for PDF.js
		pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

		let pdf: any = null;
		try {
			const arrayBuffer = await file.arrayBuffer();
			pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
			const textParts: string[] = [];

			for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
				const page = await pdf.getPage(pageNum);
				const textContent = await page.getTextContent();
				const pageText = textContent.items
					.filter((item: any) => item && 'str' in item)
					.map((item: any) => item.str || '')
					.join(' ');
				textParts.push(pageText);
			}

			// Clean and process the extracted text using utility functions
			const rawText = textParts.join('\n\n');
			const finalText = processPDFText(rawText);

			return finalText;
		} catch (error) {
			console.error('Failed to extract PDF text:', error);
			throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF document.');
		} finally {
			// Clean up PDF document to prevent memory leaks
			if (pdf) {
				try {
					await pdf.destroy();
				} catch (cleanupError) {
					console.warn('Failed to cleanup PDF document:', cleanupError);
				}
			}
		}
	} catch (error) {
		console.error('Failed to load PDF.js:', error);
		throw new Error('Failed to load PDF processing library. Please refresh the page and try again.');
	}
}
