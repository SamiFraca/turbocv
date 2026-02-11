"use client";

import { useTranslations } from "next-intl";

interface Skill {
	name: string;
}

interface BeforeAfterData {
	title: string;
	profile: string;
	experience: string;
	skills: Skill[];
}

export default function BeforeAfter() {
	const t = useTranslations("home");

	const beforeData: BeforeAfterData = {
		title: t("beforeAfter.beforeTitle"),
		profile: t("beforeAfter.beforeProfile"),
		experience: t("beforeAfter.beforeExp"),
		skills: [
			{ name: "JavaScript" },
			{ name: "CSS" },
			{ name: "HTML" },
		],
	};

	const afterData: BeforeAfterData = {
		title: t("beforeAfter.afterTitle"),
		profile: t("beforeAfter.afterProfile"),
		experience: t("beforeAfter.afterExp"),
		skills: [
			{ name: "React" },
			{ name: "TypeScript" },
			{ name: "Next.js" },
			{ name: "Performance Optimization" },
			{ name: "Accessibility" },
		],
	};

	return (
		<section className="bg-white py-16 px-4">
			<div className="max-w-5xl mx-auto">
				<h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">
					{t("beforeAfter.title")}
				</h2>
				<p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
					{t("beforeAfter.subtitle")}
				</p>
				<div className="grid md:grid-cols-2 gap-6">
					<ComparisonCard data={beforeData} variant="before" />
					<ComparisonCard data={afterData} variant="after" />
				</div>
			</div>
		</section>
	);
}

interface ComparisonCardProps {
	data: BeforeAfterData;
	variant: "before" | "after";
}

function ComparisonCard({ data, variant }: ComparisonCardProps) {
	const isBefore = variant === "before";
	const borderColor = isBefore ? "border-red-200" : "border-green-200";
	const bgColor = isBefore ? "bg-red-50/50" : "bg-green-50/50";
	const iconColor = isBefore ? "text-red-500" : "text-green-500";
	const titleColor = isBefore ? "text-red-800" : "text-green-800";
	const itemBgColor = isBefore ? "border-red-100" : "border-green-100";
	const skillColor = isBefore ? "text-slate-500" : "text-green-700";
	const skillFontWeight = isBefore ? "" : "font-medium";

	return (
		<div className={`border ${borderColor} rounded-xl p-6 ${bgColor}`}>
			<div className="flex items-center gap-2 mb-4">
				<span className={`${iconColor} text-lg`}>{isBefore ? "✗" : "✓"}</span>
				<h3 className={`font-semibold ${titleColor}`}>{data.title}</h3>
			</div>
			<div className="space-y-3 text-sm text-slate-600">
				<p className={`bg-white rounded-lg p-3 border ${itemBgColor}`}>
					{data.profile}
				</p>
				<p className={`bg-white rounded-lg p-3 border ${itemBgColor}`}>
					{data.experience}
				</p>
				<div className="flex flex-wrap gap-1">
					{data.skills.map((skill) => (
						<span
							key={skill.name}
							className={`px-2 py-0.5 bg-white border ${itemBgColor} rounded text-xs ${skillColor} ${skillFontWeight}`}
						>
							{skill.name}
						</span>
					))}
				</div>
			</div>
		</div>
	);
}
