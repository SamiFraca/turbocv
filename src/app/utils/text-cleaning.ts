/**
 * Text cleaning utilities for PDF text extraction
 */

/**
 * Complete text processing pipeline for PDF extraction
 * @param rawText - Raw text from PDF
 * @returns Fully processed text
 */
export function processPDFText(rawText: string): string {
	// Combined text cleaning operations for better performance
	const cleanedText = rawText
		// Fix URLs with spaces
		.replace(/https\s*:\s*\/\s*/g, 'https://')
		.replace(/www\s*\.\s*/g, 'www.')
		// Fix email addresses with spaces
		.replace(/\s+@\s+/g, '@')
		// Fix accented characters that were split (most important fix)
		.replace(/([a-zA-Z])\s+([áéíóúÁÉÍÓÚñÑ])/g, '$1$2')
		.replace(/([áéíóúÁÉÍÓÚñÑ])\s+([a-zA-Z])/g, '$1$2')
		// Fix spaces around punctuation
		.replace(/([a-zA-ZáéíóúÁÉÍÓÚñÑ])\s+([.,;:!?])/g, '$1$2')
		.replace(/([.,;:!?])\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ])/g, '$1$2')
		// Add spaces between joined words
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		// Fix broken URLs with extra slashes
		.replace(/https\s*:\s*\/\s*\/\s*/g, 'https://')
		// Fix spaced hyphens
		.replace(/\s*-\s*/g, '-')
		// Remove excessive spaces
		.replace(/\s{2,}/g, ' ')
		// Fix line breaks
		.replace(/\n\s*\n/g, '\n')
		.trim();

	// Add line breaks after periods (excluding URLs and emails)
	// First, temporarily replace URLs to protect them
	let protectedText = cleanedText;
	const urlPlaceholders: string[] = [];
	let urlIndex = 0;
	
	// Protect URLs and emails with comprehensive patterns
	protectedText = protectedText.replace(
		/(?:https?:\/\/|www\.)[^\s]+|[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g, 
		(match) => {
			const placeholder = `__URL_${urlIndex}__`;
			urlPlaceholders.push(match);
			urlIndex++;
			return placeholder;
		}
	);
	
	// Add line breaks after periods, question marks, and exclamation marks
	protectedText = protectedText.replace(/([.?!])\s*/g, '$1\n');
	
	// Restore URLs and emails
	urlPlaceholders.forEach((url, index) => {
		protectedText = protectedText.replace(`__URL_${index}__`, url);
	});
	
	return protectedText;
}
