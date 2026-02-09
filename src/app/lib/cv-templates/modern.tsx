import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontSize: 10,
		fontFamily: 'Helvetica',
		backgroundColor: '#ffffff',
	},
	header: {
		marginBottom: 25,
		paddingBottom: 15,
		borderBottomWidth: 3,
		borderBottomColor: '#2563eb',
	},
	name: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#1e293b',
		marginBottom: 5,
	},
	title: {
		fontSize: 14,
		color: '#2563eb',
		fontWeight: 'bold',
		marginBottom: 8,
	},
	contact: {
		fontSize: 9,
		color: '#64748b',
		lineHeight: 1.3,
	},
	section: {
		marginBottom: 18,
	},
	sectionTitle: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#ffffff',
		backgroundColor: '#2563eb',
		paddingHorizontal: 8,
		paddingVertical: 4,
		marginBottom: 10,
	},
	jobHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 4,
	},
	jobTitle: {
		fontSize: 11,
		fontWeight: 'bold',
		color: '#1e293b',
	},
	jobDates: {
		fontSize: 9,
		color: '#64748b',
	},
	jobCompany: {
		fontSize: 10,
		color: '#2563eb',
		fontWeight: 'bold',
		marginBottom: 4,
	},
	jobDescription: {
		fontSize: 9,
		color: '#334155',
		lineHeight: 1.5,
		marginBottom: 10,
	},
	educationItem: {
		marginBottom: 10,
	},
	degreeTitle: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#1e293b',
		marginBottom: 2,
	},
	school: {
		fontSize: 9,
		color: '#2563eb',
		marginBottom: 2,
	},
	skillsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
	},
	skillBadge: {
		fontSize: 8,
		backgroundColor: '#dbeafe',
		color: '#1e40af',
		paddingHorizontal: 8,
		paddingVertical: 4,
		marginBottom: 6,
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

export function ModernTemplate({ optimizedCV, keywords }: CVData) {
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
						<Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
						<Text style={{ fontSize: 9, color: '#334155', lineHeight: 1.5 }}>
							{parsed.profile}
						</Text>
					</View>
				)}

				{parsed.employment && parsed.employment.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>EXPERIENCE</Text>
						{parsed.employment.map((job, idx) => (
							<View key={idx} style={{ marginBottom: 12 }}>
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
								{edu.dates && <Text style={{ fontSize: 8, color: '#64748b' }}>{edu.dates}</Text>}
							</View>
						))}
					</View>
				)}

				{keywords && keywords.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>SKILLS</Text>
						<View style={styles.skillsContainer}>
							{keywords.map((keyword, idx) => (
								<Text key={idx} style={styles.skillBadge}>
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
