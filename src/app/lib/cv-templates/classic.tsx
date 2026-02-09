import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontSize: 10,
		fontFamily: 'Helvetica',
	},
	header: {
		marginBottom: 20,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#000000',
	},
	name: {
		fontSize: 26,
		fontWeight: 'bold',
		color: '#000000',
		marginBottom: 4,
	},
	title: {
		fontSize: 12,
		color: '#333333',
		marginBottom: 6,
	},
	contact: {
		fontSize: 8,
		color: '#555555',
		lineHeight: 1.3,
	},
	section: {
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: 'bold',
		color: '#000000',
		marginBottom: 8,
		marginTop: 4,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	jobHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 2,
	},
	jobTitle: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#000000',
	},
	jobDates: {
		fontSize: 9,
		color: '#555555',
	},
	jobCompany: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#000000',
		marginBottom: 3,
	},
	jobDescription: {
		fontSize: 9,
		color: '#333333',
		lineHeight: 1.4,
		marginBottom: 8,
	},
	educationItem: {
		marginBottom: 8,
	},
	degreeTitle: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#000000',
		marginBottom: 2,
	},
	school: {
		fontSize: 9,
		color: '#333333',
		marginBottom: 2,
	},
	skillsList: {
		fontSize: 9,
		color: '#333333',
		lineHeight: 1.4,
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

export function ClassicTemplate({ optimizedCV, keywords }: CVData) {
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
						<Text style={styles.sectionTitle}>Professional Summary</Text>
						<Text style={{ fontSize: 9, color: '#333333', lineHeight: 1.5 }}>
							{parsed.profile}
						</Text>
					</View>
				)}

				{parsed.employment && parsed.employment.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Professional Experience</Text>
						{parsed.employment.map((job, idx) => (
							<View key={idx} style={{ marginBottom: 10 }}>
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
						<Text style={styles.sectionTitle}>Education</Text>
						{parsed.education.map((edu, idx) => (
							<View key={idx} style={styles.educationItem}>
								<Text style={styles.degreeTitle}>{edu.degree}</Text>
								<Text style={styles.school}>{edu.school}</Text>
								{edu.dates && <Text style={{ fontSize: 8, color: '#555555' }}>{edu.dates}</Text>}
							</View>
						))}
					</View>
				)}

				{keywords && keywords.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Key Skills</Text>
						<Text style={styles.skillsList}>
							{keywords.join(' • ')}
						</Text>
					</View>
				)}
			</Page>
		</Document>
	);
}
