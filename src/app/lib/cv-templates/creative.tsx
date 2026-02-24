import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { TemplateProps } from '../cv-types';
import { getTemplateHeadings, type SupportedLanguage } from '@/app/utils/language-detection';

const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontSize: 10,
		fontFamily: 'Helvetica',
		backgroundColor: '#fafafa',
	},
	header: {
		marginBottom: 25,
		paddingBottom: 15,
		paddingHorizontal: 15,
		paddingVertical: 15,
		backgroundColor: '#ffffff',
		borderLeftWidth: 4,
		borderLeftColor: '#7c3aed',
	},
	name: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#7c3aed',
		marginBottom: 4,
	},
	title: {
		fontSize: 13,
		color: '#6b21a8',
		marginBottom: 8,
	},
	contact: {
		fontSize: 8,
		color: '#666666',
		lineHeight: 1.3,
	},
	section: {
		marginBottom: 18,
		paddingHorizontal: 15,
		paddingVertical: 12,
		backgroundColor: '#ffffff',
	},
	sectionTitle: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#7c3aed',
		marginBottom: 10,
		paddingBottom: 6,
		borderBottomColor: '#e9d5ff',
	},
	jobHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 3,
	},
	jobTitle: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#1f2937',
	},
	jobDates: {
		fontSize: 8,
		color: '#9333ea',
		fontWeight: '600',
	},
	jobCompany: {
		fontSize: 10,
		color: '#7c3aed',
		fontWeight: 'bold',
		marginBottom: 4,
	},
	jobDescription: {
		fontSize: 9,
		color: '#374151',
		lineHeight: 1.5,
		marginBottom: 10,
	},
	educationItem: {
		marginBottom: 10,
	},
	degreeTitle: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#1f2937',
		marginBottom: 2,
	},
	school: {
		fontSize: 9,
		color: '#7c3aed',
		marginBottom: 2,
	},
	certItem: {
		fontSize: 9,
		color: '#374151',
		marginBottom: 4,
		lineHeight: 1.3,
	},
	skillsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
	},
	skillBadge: {
		fontSize: 8,
		backgroundColor: '#ede9fe',
		color: '#6b21a8',
		paddingHorizontal: 8,
		paddingVertical: 4,
		marginBottom: 6,
		borderRadius: 2,
		fontWeight: '600',
	},
});

export function CreativeTemplate({ cv, keywords, language }: TemplateProps) {
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
						<Text style={{ fontSize: 9, color: '#374151', lineHeight: 1.5 }}>
							{cv.profile}
						</Text>
					</View>
				)}

				{cv.key_accomplishments && cv.key_accomplishments.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{headings.keyAccomplishments}</Text>
						{cv.key_accomplishments.map((acc, idx) => (
							<Text key={idx} style={{ fontSize: 9, color: '#374151', marginBottom: 4, lineHeight: 1.3 }}>
								• {acc}
							</Text>
						))}
					</View>
				)}

				{cv.experience.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{headings.experience}</Text>
						{cv.experience.map((job, idx) => (
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

				{cv.education.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{headings.education}</Text>
						{cv.education.map((edu, idx) => (
							<View key={idx} style={styles.educationItem}>
								<Text style={styles.degreeTitle}>{edu.degree}</Text>
								<Text style={styles.school}>{edu.school}</Text>
								{edu.dates && <Text style={{ fontSize: 8, color: '#666666' }}>{edu.dates}</Text>}
							</View>
						))}
					</View>
				)}

				{cv.certifications.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
						{cv.certifications.map((cert, idx) => (
							<Text key={idx} style={styles.certItem}>
								{cert}
							</Text>
						))}
					</View>
				)}

				{keywords.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{headings.skills}</Text>
						<View style={styles.skillsContainer}>
							{keywords.map((keyword, idx) => (
								<Text key={idx} style={styles.skillBadge}>
									{keyword}
								</Text>
							))}
						</View>
					</View>
				)}

				{cv.tools && cv.tools.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{headings.toolsTechnologies}</Text>
						<View style={styles.skillsContainer}>
							{cv.tools.map((tool, idx) => (
								<Text key={idx} style={{ fontSize: 8, backgroundColor: '#f3e8ff', color: '#6b21a8', paddingHorizontal: 6, paddingVertical: 3, marginBottom: 4 }}>
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
							<Text key={idx} style={{ fontSize: 9, color: '#374151', marginBottom: 3 }}>
								{lang}
							</Text>
						))}
					</View>
				)}
			</Page>
		</Document>
	);
}
