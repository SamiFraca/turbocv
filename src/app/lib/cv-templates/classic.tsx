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

export function ClassicTemplate({ cv, keywords }: TemplateProps) {
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
						<Text style={{ fontSize: 9, color: '#333333', lineHeight: 1.5 }}>
							{cv.profile}
						</Text>
					</View>
				)}

				{cv.key_accomplishments && cv.key_accomplishments.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Key Accomplishments</Text>
						{cv.key_accomplishments.map((acc, idx) => (
							<Text key={idx} style={{ fontSize: 9, color: '#333333', marginBottom: 3, lineHeight: 1.3 }}>
								• {acc}
							</Text>
						))}
					</View>
				)}

				{cv.experience.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Professional Experience</Text>
						{cv.experience.map((job, idx) => (
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

				{cv.education.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Education</Text>
						{cv.education.map((edu, idx) => (
							<View key={idx} style={styles.educationItem}>
								<Text style={styles.degreeTitle}>{edu.degree}</Text>
								<Text style={styles.school}>{edu.school}</Text>
								{edu.dates && <Text style={{ fontSize: 8, color: '#555555' }}>{edu.dates}</Text>}
							</View>
						))}
					</View>
				)}

				{keywords.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Key Skills</Text>
						<Text style={styles.skillsList}>
							{keywords.join(' • ')}
						</Text>
					</View>
				)}

				{cv.tools && cv.tools.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Tools & Technologies</Text>
						<Text style={styles.skillsList}>
							{cv.tools.join(' • ')}
						</Text>
					</View>
				)}

				{cv.languages && cv.languages.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Languages</Text>
						{cv.languages.map((lang, idx) => (
							<Text key={idx} style={{ fontSize: 9, color: '#333333', marginBottom: 2 }}>
								{lang}
							</Text>
						))}
					</View>
				)}
			</Page>
		</Document>
	);
}
