import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { TemplateProps } from '../cv-types';

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

export function ModernTemplate({ cv, keywords }: TemplateProps) {
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
						<Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
						<Text style={{ fontSize: 9, color: '#334155', lineHeight: 1.5 }}>
							{cv.profile}
						</Text>
					</View>
				)}

				{cv.key_accomplishments && cv.key_accomplishments.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>KEY ACCOMPLISHMENTS</Text>
						{cv.key_accomplishments.map((acc, idx) => (
							<Text key={idx} style={{ fontSize: 9, color: '#334155', marginBottom: 4, lineHeight: 1.4 }}>
								• {acc}
							</Text>
						))}
					</View>
				)}

				{cv.experience.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>EXPERIENCE</Text>
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
						<Text style={styles.sectionTitle}>EDUCATION</Text>
						{cv.education.map((edu, idx) => (
							<View key={idx} style={styles.educationItem}>
								<Text style={styles.degreeTitle}>{edu.degree}</Text>
								<Text style={styles.school}>{edu.school}</Text>
								{edu.dates && <Text style={{ fontSize: 8, color: '#64748b' }}>{edu.dates}</Text>}
							</View>
						))}
					</View>
				)}

				{keywords.length > 0 && (
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

				{cv.tools && cv.tools.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>TOOLS & TECHNOLOGIES</Text>
						<View style={styles.skillsContainer}>
							{cv.tools.map((tool, idx) => (
								<Text key={idx} style={{ fontSize: 8, backgroundColor: '#e0e7ff', color: '#3730a3', paddingHorizontal: 6, paddingVertical: 3, marginBottom: 4 }}>
									{tool}
								</Text>
							))}
						</View>
					</View>
				)}

				{cv.languages && cv.languages.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>LANGUAGES</Text>
						{cv.languages.map((lang, idx) => (
							<Text key={idx} style={{ fontSize: 9, color: '#334155', marginBottom: 3 }}>
								{lang}
							</Text>
						))}
					</View>
				)}
			</Page>
		</Document>
	);
}
