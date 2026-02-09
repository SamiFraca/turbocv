import { ModernTemplate } from './modern';
import { ClassicTemplate } from './classic';
import { MinimalTemplate } from './minimal';
import { ProfessionalTemplate } from './professional';
import { CreativeTemplate } from './creative';

export type TemplateType = 'modern' | 'classic' | 'minimal' | 'professional' | 'creative';

export const TEMPLATES = {
	modern: {
		name: 'Modern',
		description: 'Clean, contemporary design with blue accents',
		component: ModernTemplate,
	},
	classic: {
		name: 'Classic',
		description: 'Traditional black and white professional style',
		component: ClassicTemplate,
	},
	minimal: {
		name: 'Minimal',
		description: 'Minimalist design with focus on content',
		component: MinimalTemplate,
	},
	professional: {
		name: 'Professional',
		description: 'Corporate style with structured layout',
		component: ProfessionalTemplate,
	},
	creative: {
		name: 'Creative',
		description: 'Vibrant purple design with modern flair',
		component: CreativeTemplate,
	},
};

export function getTemplate(type: TemplateType) {
	return TEMPLATES[type] || TEMPLATES.modern;
}

export function getAllTemplates() {
	return Object.entries(TEMPLATES).map(([key, value]) => ({
		id: key as TemplateType,
		...value,
	}));
}
