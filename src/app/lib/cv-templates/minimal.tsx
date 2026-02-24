import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { TemplateProps } from '../cv-types';
import { getTemplateHeadings, type SupportedLanguage } from '@/app/utils/language-detection';

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

export function MinimalTemplate({ cv, keywords, language }: TemplateProps) {
	const lang = (language || cv.language || 'en') as SupportedLanguage;
	const headings = getTemplateHeadings(lang);
	const contactLine = [cv.contact.email, cv.contact.phone, cv.contact.location]
		.filter(Boolean)
		.join('  |  ');

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.header}>
					<Text style={styles.name}>{cv.name}</Text>
					<Text style={styles.title}>{cv.title}</Text>
					<Text style={styles.contact}>{contactLine}</Text>
				</View>

				{cv.profile && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{headings.professionalSummary}</Text>
						<Text style={{ fontSize: 8, color: '#333333', lineHeight: 1.5 }}>
							{cv.profile}
						</Text>
					</View>
				)}

				{cv.key_accomplishments && cv.key_accomplishments.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{headings.keyAccomplishments}</Text>
						{cv.key_accomplishments.map((acc, idx) => (
							<Text key={idx} style={{ fontSize: 8, color: '#333333', marginBottom: 3, lineHeight: 1.3 }}>
								• {acc}
							</Text>
						))}
					</View>
				)}

				{cv.experience.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{headings.experience}</Text>
						{cv.experience.map((job, idx) => (
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

				{cv.education.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{headings.education}</Text>
						{cv.education.map((edu, idx) => (
							<View key={idx} style={styles.educationItem}>
								<Text style={styles.degreeTitle}>{edu.degree}</Text>
								<Text style={styles.school}>{edu.school}</Text>
								{edu.dates && <Text style={{ fontSize: 7, color: '#888888' }}>{edu.dates}</Text>}
							</View>
						))}
					</View>
				)}

				{keywords.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{headings.skills}</Text>
						<View style={styles.skillsContainer}>
							{keywords.map((keyword, idx) => (
								<Text key={idx} style={styles.skillTag}>
									{keyword}
								</Text>
							))}
						</View>
					</View>
				)}

				{cv.tools && cv.tools.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>TOOLS & TECHNOLOGIES</Text>
						<View style={styles.skillsContainer}>
							{cv.tools.map((tool, idx) => (
								<Text key={idx} style={{ fontSize: 7, color: '#555555', marginBottom: 3 }}>
									{tool}
								</Text>
							))}
						</View>
					</View>
				)}

				{cv.languages && cv.languages.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{headings.languages}</Text>
						{cv.languages.map((lang, idx) => (
							<Text key={idx} style={{ fontSize: 8, color: '#333333', marginBottom: 2 }}>
								{lang}
							</Text>
						))}
					</View>
				)}
			</Page>
		</Document>
	);
}
