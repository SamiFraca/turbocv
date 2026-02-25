"use client";

import { useTranslations } from "next-intl";
import LanguageSwitcher from "../language-switcher";

interface HeaderProps {
	onScrollToForm: () => void;
}

export default function Header({ onScrollToForm }: HeaderProps) {
	const t = useTranslations("home");

	return (
		<header className="bg-slate-900 text-white">
			<div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
				<span className="text-xl font-bold tracking-tight">TurboCV</span>
				<div className="flex items-center gap-4">
					<LanguageSwitcher />
					<button
						onClick={onScrollToForm}
						className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors font-medium"
					>
						{t("cta")}
					</button>
				</div>
			</div>
		</header>
	);
}
