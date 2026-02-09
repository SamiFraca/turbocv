import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { getTemplate, TemplateType } from './cv-templates';
import type { StructuredCV, TemplateProps } from './cv-types';

interface CVData {
	optimizedCV: string;
	cvData?: StructuredCV;
	keywords: string[];
}

const DEFAULT_CV: StructuredCV = {
	name: '',
	title: '',
	contact: { email: '', phone: '', location: '' },
	profile: '',
	experience: [],
	education: [],
	certifications: [],
	skills: [],
};

export async function generatePDFBlob(data: CVData, templateType: TemplateType = 'modern'): Promise<Blob> {
	try {
		const template = getTemplate(templateType);
		const TemplateComponent = template.component as React.FC<TemplateProps>;
		
		const props: TemplateProps = {
			cv: data.cvData ?? DEFAULT_CV,
			keywords: data.keywords,
		};

		const doc = React.createElement(TemplateComponent, props);
		
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const blob = await pdf(doc as any).toBlob();
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
