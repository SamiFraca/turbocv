import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { getTemplate, TemplateType } from './cv-templates';

interface CVData {
	optimizedCV: string;
	keywords: string[];
}

export async function generatePDFBlob(data: CVData, templateType: TemplateType = 'modern'): Promise<Blob> {
	try {
		const template = getTemplate(templateType);
		const TemplateComponent = template.component;
		
		const doc = React.createElement(TemplateComponent, {
			optimizedCV: data.optimizedCV,
			keywords: data.keywords,
		});
		
		const blob = await pdf(doc).toBlob();
		return blob;
	} catch (error) {
		console.error('Error generating PDF:', error);
		throw new Error('Failed to generate PDF');
	}
}

export async function downloadPDF(data: CVData, templateType: TemplateType = 'modern', filename: string = 'optimized-cv.pdf'): Promise<void> {
	try {
		const blob = await generatePDFBlob(data, templateType);
		
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error('Error downloading PDF:', error);
		throw error;
	}
}
