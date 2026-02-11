"use client";

import { useTranslations } from "next-intl";

interface Testimonial {
	id: number;
	review: string;
	name: string;
	role: string;
}

export default function Testimonials() {
	const t = useTranslations("home");

	const testimonials: Testimonial[] = [
		{
			id: 1,
			review: t("testimonials.review1"),
			name: t("testimonials.name1"),
			role: t("testimonials.role1"),
		},
		{
			id: 2,
			review: t("testimonials.review2"),
			name: t("testimonials.name2"),
			role: t("testimonials.role2"),
		},
		{
			id: 3,
			review: t("testimonials.review3"),
			name: t("testimonials.name3"),
			role: t("testimonials.role3"),
		},
	];

	return (
		<section className="py-16 px-4">
			<div className="max-w-3xl mx-auto text-center">
				<h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-10">
					{t("testimonials.title")}
				</h2>
				<div className="grid md:grid-cols-3 gap-6">
					{testimonials.map((testimonial) => (
						<TestimonialCard key={testimonial.id} testimonial={testimonial} />
					))}
				</div>
			</div>
		</section>
	);
}

interface TestimonialCardProps {
	testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
	return (
		<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
			<div className="text-yellow-400 text-sm mb-3">★★★★★</div>
			<p className="text-sm text-slate-600 mb-4 italic">
				&ldquo;{testimonial.review}&rdquo;
			</p>
			<p className="text-xs font-semibold text-slate-800">{testimonial.name}</p>
			<p className="text-xs text-slate-500">{testimonial.role}</p>
		</div>
	);
}
