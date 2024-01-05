class Command {
	/**
	 * @param {string} name
	 * @param {() => {}} callback
	 */
	constructor(name, callback) {
		this.name = name;
		this.callback = callback;
	}
}

/**
 * The "sudo" command.
 */
const sudo = new Command("sudo", () => {
	TerminalUtils.printOut([SpanUtils.highlight("💀💀💀")], 0, 80);
	window.open("https://youtu.be/OTo73Zf-Bvo", "_blank");
});

/**
 * The "ls" command.
 */
const ls = new Command("ls", () =>
	TerminalUtils.printOutSingle(
		SpanUtils.command(
			"How_to_run_-_Slashy_Docs.zip      alphas-nudes_HIGH-RES.jpg       javadiscord.net.txt</span>"
		),
		80
	)
);

/**
 * The "clear" command. This simply clears the terminal.
 */
const clear = new Command("clear", () => $("#output").html(""));

/**
 * The "motd" command. This is printed once the terminal is loaded.
 */
const motd = new Command("motd", () =>
	TerminalUtils.printOut(
		[
			"<span id='highlight'>██╗     ██╗  ██╗██╗   ██╗███████╗██╗   ██╗████████╗██╗  ██╗</span>",
			"<span id='highlight'>██║     ╚██╗██╔╝██║   ██║██╔════╝╚██╗ ██╔╝╚══██╔══╝██║  ██║</span>",
			"<span id='highlight'>██║      ╚███╔╝ ██║   ██║███████╗ ╚████╔╝    ██║   ███████║ </span>",
			"<span id='highlight'>██║      ██╔██╗ ██║   ██║╚════██║  ╚██╔╝     ██║   ██╔══██║  </span>",
			"<span id='highlight'>███████╗██╔╝ ██╗╚██████╔╝███████║   ██║      ██║   ██║  ██║   </span>",
			"<span id='highlight'>╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝   </span>",
			"<br>",
			`<span class='typewriter'>Last login: ${new Intl.DateTimeFormat(
				"en",
				defaultDateFormat
			).format(CookieData.getLastLogin())}</span><br>`,
		],
		0,
		80
	)
);

/**
 * The "help" command. This lists all available commands.
 */
const help = new Command("help", () =>
	TerminalUtils.printOut(
		[
			`${SpanUtils.command(
				"help                "
			)} Shows a list with all commands`,
			`${SpanUtils.command("whois               ")} Who am I?`,
			`${SpanUtils.command(
				"social              "
			)} Lists all my social networks`,
			`${SpanUtils.command("theme [theme]       ")} Allows to change the theme`,
			`${SpanUtils.command("history (clear)     ")} Shows the command history`,
			`${SpanUtils.command("search [query]      ")} Search something!`,
			`${SpanUtils.command(
				"motd                "
			)} Displays the message of the day (banner)`,
			`${SpanUtils.command("clear               ")} Clears the terminal`,
			"<br>",
			"Use <span id='highlight'>sudo</span> for root privileges.",
		],
		0,
		80
	)
);

/**
 * The "social" command. This lists all my social networks.
 */
const social = new Command("social", () =>
	TerminalUtils.printOut(
		[
			`${SpanUtils.command("discord           ")} lxusyth`,
			`${SpanUtils.command(
				"twitter           "
			)} <a id='link' href='https://twitter.com/Lxusyth' target='_blank'>https://twitter.com/Lxusyth</a>`,
			`${SpanUtils.command(
				"reddit            "
			)} <a id='link' href='https://www.reddit.com/user/Lxusyth/' target='_blank'>https://www.reddit.com/user/Lxusyth/</a>`,
			`${SpanUtils.command(
				"github            "
			)} <a id='link' href='https://github.com/Lxusyth' target='_blank'>https://github.com/Lxusyth</a>`,
			`${SpanUtils.command(
				"steam             "
			)} <a id='link' href='https://steamcommunity.com/id/lxusyth/' target='_blank'>https://steamcommunity.com/id/lxusyth/</a>`,
		],
		0,
		80
	)
);

/**
 * The "whois" command. This displays information about me.
 */
const whois = new Command("whois", () =>
	TerminalUtils.printOut(
		[SpanUtils.highlight("Hey, I'm Emir 👋"), "Coming soon!"],
		0,
		80
	)
);

/**
 * The "theme" command. This allows to change the theme.
 */
const theme = new Command("theme", (args) => {
	const palette = getPalette(args[0]);
	if (palette === null) {
		let current = CookieData.getTheme();
		TerminalUtils.printOut(
			[
				`Current theme: ${SpanUtils.highlight(current.displayName)}`,
				`${SpanUtils.user("▉")} (${current.primaryColor}, Primary)`,
				`${SpanUtils.command("▉")} (${current.secondaryColor}, Secondary)`,
				`▉ (${current.textColor}, Text)`,
				`${SpanUtils.highlight("▉")} (${current.highlightColor}, Highlight)`,
				"<br>",
				`Available themes: [${palettes
					.map((p) =>
						p.shortName === current.shortName
							? SpanUtils.command(p.shortName)
							: SpanUtils.highlight(p.shortName)
					)
					.join("|")}]</span>`,
			],
			0,
			80
		);
		return;
	}
	ColorPalette.applyTerminalTheme(palette);
	TerminalUtils.printOut(
		[
			`Changed theme to: ${SpanUtils.highlight(palette.displayName)}`,
			`${SpanUtils.user("▉")} (${palette.primaryColor}, Primary)`,
			`${SpanUtils.command("▉")} (${palette.secondaryColor}, Secondary)`,
			`▉ (${palette.textColor}, Text)`,
			`${SpanUtils.highlight("▉")} (${palette.highlightColor}, Highlight)`,
		],
		0,
		80
	);
});

/**
 * The "history" command. This displays the current command history.
 * If the "clear" argument is given, the entire command history will be cleared.
 */
const history = new Command("history", (args) => {
	if (args && args[0] === "clear") {
		let amount = CookieData.getHistory().length;
		CookieData.updateHistory([]);
		commandHistory = [];
		TerminalUtils.printOutSingle(
			`Successfully cleared ${SpanUtils.highlight(amount)} commands`,
			80
		);
		return;
	}
	TerminalUtils.printOut(
		[
			...commandHistory.map((h) => `# ${SpanUtils.highlight(h)}`),
			"<br>",
			`Use ${SpanUtils.command(
				"history clear"
			)} to clear your command history.`,
		],
		0,
		80
	);
});

const search = new Command("search", (args) => {
	let query = args.join(" ");
	if (!query || query === "") {
		TerminalUtils.printOutSingle(
			`# Usage: ${SpanUtils.highlight("search")} [query]`,
			80
		);
		return;
	}
	let encoded = encodeURIComponent(query);
	TerminalUtils.printOut(
		[`Searching for \"${SpanUtils.highlight(query)}\"...`],
		0,
		80
	);
	setTimeout(() => {
		window.open(`https://www.google.com/search?q=${encoded}`, "_blank");
	}, 500);
});

const commands = [
	sudo,
	ls,
	clear,
	motd,
	help,
	social,
	whois,
	theme,
	history,
	search,
];

/**
 * @param {string} str The command's name.
 * @returns {Command?} The command.
 */
function getCommand(str) {
	for (const cmd of commands) {
		if (cmd.name === str) {
			return cmd;
		}
	}
	return null;
}