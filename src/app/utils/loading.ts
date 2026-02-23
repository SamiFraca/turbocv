/**
 * Loading animation utilities
 */

/**
 * Gets loading phrase based on progress percentage
 * @param progress - Current progress percentage (0-99)
 * @param t - Translation function
 * @returns Loading phrase for current progress
 */
export function getLoadingPhrase(progress: number, t: (key: string) => string): string {
	if (progress < 20) return t("analyzing");
	if (progress < 40) return t("extractingSkills");
	if (progress < 60) return t("matchingKeywords");
	if (progress < 80) return t("optimizingContent");
	return t("finalizing");
}

/**
 * Configuration for loading animation
 */
export const LOADING_CONFIG = {
	minIncrement: 5,
	maxIncrement: 15,
	minInterval: 700,
	maxInterval: 1300,
	maxProgress: 99,
} as const;

/**
 * Creates a loading progress animation
 * @param setLoadingProgress - Function to set loading progress
 * @returns Cleanup function to clear the interval
 */
export function createLoadingAnimation(setLoadingProgress: (progress: number | ((prev: number) => number)) => void): () => void {
	setLoadingProgress(0);
	
	const interval = setInterval(() => {
		setLoadingProgress((prev: number) => {
			if (prev >= LOADING_CONFIG.maxProgress) return LOADING_CONFIG.maxProgress;
			
			const increment = Math.random() * (LOADING_CONFIG.maxIncrement - LOADING_CONFIG.minIncrement) + LOADING_CONFIG.minIncrement;
			const newProgress = prev + increment;
			return newProgress >= LOADING_CONFIG.maxProgress ? LOADING_CONFIG.maxProgress : newProgress;
		});
	}, Math.random() * (LOADING_CONFIG.maxInterval - LOADING_CONFIG.minInterval) + LOADING_CONFIG.minInterval);
	
	return () => clearInterval(interval);
}
