/**
 * File handling utilities for CV form
 */

/**
 * Processes a PDF file for upload
 * @param file - File to process
 * @param setPdfFile - Function to set the PDF file state
 * @param setCvFileName - Function to set the CV file name state
 * @param t - Translation function
 * @throws Error if file is not a valid PDF
 */
export async function processPDFFile(
	file: File,
	setPdfFile: (file: File | null) => void,
	setCvFileName: (name: string) => void,
	t: (key: string) => string
): Promise<void> {
	// Validate if file is a PDF
	if (file.type !== "application/pdf") {
		alert(t("pdfAlert"));
		throw new Error("Invalid file type. Only PDF files are allowed.");
	}

	try {
		setPdfFile(file);
		setCvFileName(file.name);
	} catch (error) {
		console.error("Error processing PDF:", error);
		alert(t("pdfError"));
		throw error;
	}
}

/**
 * Handles file upload from input element
 * @param event - Change event from file input
 * @param processPDFFile - Function to process the PDF file
 */
export async function handleFileUpload(
	event: React.ChangeEvent<HTMLInputElement>,
	processPDFFile: (file: File) => Promise<void>
): Promise<void> {
	const file = event.target.files?.[0];
	if (!file) return;
	
	await processPDFFile(file);
}

/**
 * Handles drag over event for file drop zone
 * @param event - Drag event
 * @param setIsDragging - Function to set dragging state
 */
export function handleDragOver(
	event: React.DragEvent<HTMLDivElement>,
	setIsDragging: (isDragging: boolean) => void
): void {
	event.preventDefault();
	setIsDragging(true);
}

/**
 * Handles drag leave event for file drop zone
 * @param event - Drag event
 * @param setIsDragging - Function to set dragging state
 */
export function handleDragLeave(
	event: React.DragEvent<HTMLDivElement>,
	setIsDragging: (isDragging: boolean) => void
): void {
	event.preventDefault();
	setIsDragging(false);
}

/**
 * Handles file drop event for file drop zone
 * @param event - Drag event
 * @param setIsDragging - Function to set dragging state
 * @param processPDFFile - Function to process the PDF file
 */
export async function handleDrop(
	event: React.DragEvent<HTMLDivElement>,
	setIsDragging: (isDragging: boolean) => void,
	processPDFFile: (file: File) => Promise<void>
): Promise<void> {
	event.preventDefault();
	setIsDragging(false);

	const file = event.dataTransfer.files?.[0];
	if (!file) return;
	
	await processPDFFile(file);
}
