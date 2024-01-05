class ColorPalette {
	/**
	 * Constructs a new ColorPalette object.
	 *
	 * @param {string} displayName The palette's display name.
	 * @param {string} shortName The palette's short name.
	 * @param {string} primaryColor The primary color.
	 * @param {string} secondaryColor The secondary color.
	 * @param {string} textColor The text color.
	 * @param {string} highlightColor The highlight color.
	 * @param {string} backgroundColor The background color.
	 */
	constructor(
		displayName,
		shortName,
		primaryColor,
		secondaryColor,
		textColor,
		highlightColor,
		backgroundColor
	) {
		this.displayName = displayName;
		this.shortName = shortName;
		this.primaryColor = primaryColor;
		this.secondaryColor = secondaryColor;
		this.textColor = textColor;
		this.highlightColor = highlightColor;
		this.backgroundColor = backgroundColor;
	}

	static applySavedTerminalTheme() {
		var theme = CookieData.getTheme();
		if (theme) {
			ColorPalette.applyTerminalTheme(theme);
		}
	}

	/**
	 * Applies the given color theme to the page.
	 *
	 * @param {ColorPalette} theme The color theme to apply.
	 */
	static applyTerminalTheme(theme) {
		var root = document.documentElement;
		root.style.setProperty("--primary-color", theme.primaryColor);
		root.style.setProperty("--secondary-color", theme.secondaryColor);
		root.style.setProperty("--text-color", theme.textColor);
		root.style.setProperty("--highlight-color", theme.highlightColor);
		root.style.setProperty("--background-color", theme.backgroundColor);
		CookieData.updateTheme(theme.shortName);
	}
}

const dark = new ColorPalette(
	"Dark",
	"dark",
	"#87E882", // Primary
	"#73A9FF", // Secondary
	"#949aa7", // Text
	"#A3A3A3", // Highlight
	"#1e2127" // Background
);

const light = new ColorPalette(
	"Light (Flashbang)",
	"light",
	"#1B8D53", // Primary
	"#2474f2", // Secondary
	"#575656", // Text
	"#3b3b3b", // Highlight
	"#F9F9F9" // Background
);

const midnight = new ColorPalette(
	"Midnight Serenade",
	"midnight",
	"#666666", // Primary
	"#6A9Eb8", // Secondary
	"#FFFFFF", // Text
	"#A3A3A3", // Highlight
	"#080808" // Background
);

const palettes = [dark, light, midnight];

/**
 * Gets the color palette with the given short name.
 *
 * @param {string} str The string to check.
 * @returns {ColorPalette?} The color palette.
 */
function getPalette(str) {
	return (
		palettes.filter((palette) => palette.shortName === str).shift() || null
	);
}