import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { TemplateProps } from '../cv-types';

const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontSize: 10,
		fontFamily: 'Helvetica',
	},
	header: {
		marginBottom: 22,
		paddingBottom: 10,
		borderBottomWidth: 2,
		borderBottomColor: '#1f2937',
	},
	name: {
		fontSize: 26,
		fontWeight: 'bold',
		color: '#1f2937',
		marginBottom: 4,
	},
	title: {
		fontSize: 13,
		color: '#374151',
		fontWeight: '600',
		marginBottom: 8,
	},
	contact: {
		fontSize: 9,
		color: '#6b7280',
		lineHeight: 1.3,
	},
	section: {
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: 'bold',
		color: '#1f2937',
		marginBottom: 8,
		marginTop: 2,
		textTransform: 'uppercase',
		letterSpacing: 1,
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
		fontSize: 9,
		color: '#6b7280',
		fontStyle: 'italic',
	},
	jobCompany: {
		fontSize: 10,
		fontWeight: '600',
		color: '#374151',
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
		color: '#374151',
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
		gap: 5,
	},
	skillBadge: {
		fontSize: 8,
		backgroundColor: '#f3f4f6',
		color: '#374151',
		paddingHorizontal: 6,
		paddingVertical: 3,
		marginBottom: 5,
		borderWidth: 1,
		borderColor: '#d1d5db',
	},
});

export function ProfessionalTemplate({ cv, keywords }: TemplateProps) {
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
						<Text style={styles.sectionTitle}>Professional Summary</Text>
						<Text style={{ fontSize: 9, color: '#374151', lineHeight: 1.5 }}>
							{cv.profile}
						</Text>
					</View>
				)}

				{cv.key_accomplishments && cv.key_accomplishments.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Key Accomplishments</Text>
						{cv.key_accomplishments.map((acc, idx) => (
							<Text key={idx} style={{ fontSize: 9, color: '#374151', marginBottom: 3, lineHeight: 1.3 }}>
								• {acc}
							</Text>
						))}
					</View>
				)}

				{cv.experience.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Professional Experience</Text>
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
						<Text style={styles.sectionTitle}>Education</Text>
						{cv.education.map((edu, idx) => (
							<View key={idx} style={styles.educationItem}>
								<Text style={styles.degreeTitle}>{edu.degree}</Text>
								<Text style={styles.school}>{edu.school}</Text>
								{edu.dates && <Text style={{ fontSize: 8, color: '#6b7280' }}>{edu.dates}</Text>}
							</View>
						))}
					</View>
				)}

				{cv.certifications.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Certifications</Text>
						{cv.certifications.map((cert, idx) => (
							<Text key={idx} style={styles.certItem}>
								{cert}
							</Text>
						))}
					</View>
				)}

				{keywords.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Core Competencies</Text>
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
						<Text style={styles.sectionTitle}>Tools & Technologies</Text>
						<View style={styles.skillsContainer}>
							{cv.tools.map((tool, idx) => (
								<Text key={idx} style={{ fontSize: 8, backgroundColor: '#f3f4f6', color: '#374151', paddingHorizontal: 5, paddingVertical: 2, marginBottom: 4, borderWidth: 1, borderColor: '#d1d5db' }}>
									{tool}
								</Text>
							))}
						</View>
					</View>
				)}

				{cv.languages && cv.languages.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Languages</Text>
						{cv.languages.map((lang, idx) => (
							<Text key={idx} style={{ fontSize: 9, color: '#374151', marginBottom: 2 }}>
								{lang}
							</Text>
						))}
					</View>
				)}
			</Page>
		</Document>
	);
}
