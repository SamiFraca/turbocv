export interface StructuredCV {
	name: string;
	title: string;
	contact: {
		email: string;
		phone: string;
		location: string;
		links?: {
			linkedin?: string;
			github?: string;
			portfolio?: string;
		};
	};
	profile: string;
	key_accomplishments?: string[];
	experience: Array<{
		title: string;
		company: string;
		dates: string;
		description: string;
	}>;
	education: Array<{
		degree: string;
		school: string;
		dates: string;
	}>;
	certifications: string[];
	skills: string[];
	tools?: string[];
	languages?: string[];
}

export interface TemplateProps {
	cv: StructuredCV;
	keywords: string[];
}
