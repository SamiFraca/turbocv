import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
	page: {
		padding: 35,
		fontSize: 9,
		fontFamily: 'Helvetica',
	},
	header: {
		marginBottom: 18,
	},
	name: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#1a1a1a',
		marginBottom: 3,
	},
	title: {
		fontSize: 11,
		color: '#666666',
		marginBottom: 6,
	},
	contact: {
		fontSize: 8,
		color: '#888888',
		lineHeight: 1.2,
	},
	section: {
		marginBottom: 14,
	},
	sectionTitle: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#1a1a1a',
		marginBottom: 6,
		paddingBottomWidth: 1,
		paddingBottom: 4,
	},
	jobHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 1,
	},
	jobTitle: {
		fontSize: 9,
		fontWeight: 'bold',
		color: '#1a1a1a',
	},
	jobDates: {
		fontSize: 8,
		color: '#888888',
	},
	jobCompany: {
		fontSize: 9,
		color: '#666666',
		marginBottom: 2,
	},
	jobDescription: {
		fontSize: 8,
		color: '#333333',
		lineHeight: 1.4,
		marginBottom: 7,
	},
	educationItem: {
		marginBottom: 6,
	},
	degreeTitle: {
		fontSize: 9,
		fontWeight: 'bold',
		color: '#1a1a1a',
		marginBottom: 1,
	},
	school: {
		fontSize: 8,
		color: '#666666',
		marginBottom: 1,
	},
	skillsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 4,
	},
	skillTag: {
		fontSize: 8,
		color: '#666666',
		marginBottom: 4,
	},
});

interface CVData {
	optimizedCV: string;
	keywords: string[];
}

interface ParsedCV {
	header?: { name: string; title: string; contact: string };
	profile?: string;
	employment?: Array<{ title: string; company: string; dates: string; description: string }>;
	education?: Array<{ degree: string; school: string; dates?: string }>;
	certifications?: string[];
}

function parseCV(text: string): ParsedCV {
	const result: ParsedCV = {};
	const lines = text.split('\n').filter(l => l.trim());

	if (lines.length > 0) {
		result.header = {
			name: lines[0] || 'CV',
			title: lines[1] || '',
			contact: lines.slice(2, 5).join(' • ') || '',
		};
	}

	const profileMatch = text.match(/(?:Profile|Summary|Professional Summary)([\s\S]*?)(?=\n\n(?:Employment|Education|Certification|Skills|$))/i);
	if (profileMatch) result.profile = profileMatch[1].trim();

	const employmentMatch = text.match(/(?:Employment|Professional Experience|Work Experience)([\s\S]*?)(?=\n\n(?:Education|Certification|Skills|$))/i);
	if (employmentMatch) {
		const jobs = [];
		const jobBlocks = employmentMatch[1].split(/\n(?=[A-Z])/);
		for (const block of jobBlocks) {
			const lines = block.split('\n').filter(l => l.trim());
			if (lines.length > 0) {
				jobs.push({
					title: lines[0] || '',
					company: lines[1] || '',
					dates: lines[2] || '',
					description: lines.slice(3).join(' '),
				});
			}
		}
		result.employment = jobs;
	}

	const educationMatch = text.match(/Education([\s\S]*?)(?=\n\n(?:Certification|Skills|$))/i);
	if (educationMatch) {
		const education = [];
		const eduBlocks = educationMatch[1].split(/\n(?=[A-Z])/);
		for (const block of eduBlocks) {
			const lines = block.split('\n').filter(l => l.trim());
			if (lines.length > 0) {
				education.push({
					degree: lines[0] || '',
					school: lines[1] || '',
					dates: lines[2],
				});
			}
		}
		result.education = education;
	}

	const certMatch = text.match(/Certification[s]?([\s\S]*?)(?=\n\n(?:Skills|$))/i);
	if (certMatch) {
		result.certifications = certMatch[1]
			.split('\n')
			.map(c => c.trim())
			.filter(c => c && !c.startsWith('-'));
	}

	return result;
}

export function MinimalTemplate({ optimizedCV, keywords }: CVData) {
	const parsed = parseCV(optimizedCV);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{parsed.header && (
					<View style={styles.header}>
						<Text style={styles.name}>{parsed.header.name}</Text>
						<Text style={styles.title}>{parsed.header.title}</Text>
						<Text style={styles.contact}>{parsed.header.contact}</Text>
					</View>
				)}

				{parsed.profile && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>SUMMARY</Text>
						<Text style={{ fontSize: 8, color: '#333333', lineHeight: 1.5 }}>
							{parsed.profile}
						</Text>
					</View>
				)}

				{parsed.employment && parsed.employment.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>EXPERIENCE</Text>
						{parsed.employment.map((job, idx) => (
							<View key={idx} style={{ marginBottom: 8 }}>
								<View style={styles.jobHeader}>
									<Text style={styles.jobTitle}>{job.title}</Text>
									<Text style={styles.jobDates}>{job.dates}</Text>
								</View>
								<Text style={styles.jobCompany}>{job.company}</Text>
								<Text style={styles.jobDescription}>{job.description}</Text>
							</View>
						))}
					</View>
				)}

				{parsed.education && parsed.education.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>EDUCATION</Text>
						{parsed.education.map((edu, idx) => (
							<View key={idx} style={styles.educationItem}>
								<Text style={styles.degreeTitle}>{edu.degree}</Text>
								<Text style={styles.school}>{edu.school}</Text>
								{edu.dates && <Text style={{ fontSize: 7, color: '#888888' }}>{edu.dates}</Text>}
							</View>
						))}
					</View>
				)}

				{keywords && keywords.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>SKILLS</Text>
						<View style={styles.skillsContainer}>
							{keywords.map((keyword, idx) => (
								<Text key={idx} style={styles.skillTag}>
									{keyword}
								</Text>
							))}
						</View>
					</View>
				)}
			</Page>
		</Document>
	);
}
