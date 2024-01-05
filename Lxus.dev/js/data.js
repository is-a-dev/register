class CookieData {
	/**
	 *
	 * @param {string} theme
	 * @param {string[]} history
	 * @param {Date} lastLogin
	 */
	constructor(theme = "dark", history = [], lastLogin = new Date()) {
		this.theme = theme;
		this.history = history;
		this.lastLogin = lastLogin;
	}

	/**
	 * @param {string} string The string to parse.
	 * @returns {CookieData} The parsed cookie.
	 */
	static fromJSON(string) {
		return JSON.parse(string);
	}

	/**
	 * @param {str} theme The theme to set.
	 */
	static updateTheme(theme) {
		let c = cookie ?? new CookieData();
		c.theme = theme;
		document.cookie = JSON.stringify(c);
	}

	/**
	 * @returns {ColorPalette?} The current theme.
	 */
	static getTheme() {
		return getPalette(cookie?.theme ?? "dark");
	}

	/**
	 * @param {string[]} history The history to set.
	 */
	static updateHistory(history) {
		let c = cookie ?? new CookieData();
		c.history = history;
		document.cookie = JSON.stringify(c);
	}

	/**
	 * @returns {string[]} The current history.
	 */
	static getHistory() {
		return cookie?.history ?? [];
	}

	/**
	 * @param {Date} date The date to set.
	 */
	static updateLastLogin(date) {
		let c = cookie ?? new CookieData();
		c.lastLogin = date;
		document.cookie = JSON.stringify(c);
	}

	/**
	 * @returns {Date} The last login date.
	 */
	static getLastLogin() {
		return cookie ? Date.parse(cookie.lastLogin) : new Date();
	}
}
