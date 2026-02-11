"use client";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-slate-200 py-8 px-4 text-center text-sm text-slate-500">
			<div className="max-w-4xl mx-auto">
				<p className="font-semibold text-slate-700 mb-1">TurboCV</p>
				<p>&copy; {currentYear} TurboCV. All rights reserved.</p>
			</div>
		</footer>
	);
}
