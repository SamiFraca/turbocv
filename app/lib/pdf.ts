import { jsPDF } from "jspdf";

export function generatePDF(cvText: string, keywords: string[]): void {
	const doc = new jsPDF();
	const pageWidth = doc.internal.pageSize.getWidth();
	const margin = 20;
	const maxWidth = pageWidth - 2 * margin;
	let yPosition = 20;

	doc.setFontSize(16);
	doc.text("Currículum Vitae Optimizado", margin, yPosition);
	yPosition += 15;

	if (keywords.length > 0) {
		doc.setFontSize(10);
		doc.setTextColor(100, 100, 100);
		doc.text(`Palabras clave: ${keywords.join(", ")}`, margin, yPosition);
		yPosition += 10;
	}

	doc.setFontSize(11);
	doc.setTextColor(0, 0, 0);

	const lines = doc.splitTextToSize(cvText, maxWidth);
	for (const line of lines) {
		if (yPosition > 280) {
			doc.addPage();
			yPosition = 20;
		}
		doc.text(line, margin, yPosition);
		yPosition += 6;
	}

	doc.save("cv-optimizado.pdf");
}
