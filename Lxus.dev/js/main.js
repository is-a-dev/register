window.onkeyup = keyup;
window.onload = loaded;

let historyPointer = 0;
let commandHistory = [];

let isPrinting = false;

const json = document.cookie;
/**
 * @type {CookieData?}
 */
let cookie;
if (json && json !== "") {
	cookie = CookieData.fromJSON(json);
	console.table(cookie);
	ColorPalette.applySavedTerminalTheme();
	commandHistory.push(...CookieData.getHistory());
}

/**
 * Called when the page is loaded.
 */
function loaded() {
	motd.callback();
	CookieData.updateLastLogin(new Date());
	TerminalUtils.requestFocus();
}

function keyup(e) {
	TerminalUtils.requestFocus();
	let sanitizedInput = e.target.value
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
	let split = sanitizedInput.split(/\s+/g);
	if (split.length == 0 || isPrinting) return;
	let first = split[0];
	if (e.keyCode == 38 || e.keyCode == 40) {
		handleHistory(e);
	} else if (e.keyCode == 13 && first && first !== "") {
		handleCommand(split, sanitizedInput);
	}
}

function handleHistory(e) {
	let keyVal = e.keyCode == 38 ? -1 : 1;
	let element = commandHistory.length - historyPointer + keyVal;
	if (commandHistory[element]) {
		$("#input").val(commandHistory[element]);
		historyPointer += keyVal * -1;
	}
}

/**
 * Handles the given command.
 *
 * @param {string[]} split
 * @param {string} sanitizedInput
 */
function handleCommand(split, sanitizedInput) {
	commandHistory.push(sanitizedInput);
	historyPointer = 0;
	$("#output").append(
		`${SpanUtils.user("user@jasonlessenich.dev")}:${SpanUtils.command(
			"~ $"
		)} ${sanitizedInput}<br>`
	);
	$("#input").val("");
	const first = split.shift().toLowerCase();
	const cmd = getCommand(first);
	if (cmd === null) {
		$("#output").append(
			`Command \'${SpanUtils.command(
				first
			)}\' not found. For a list of commands, type '${SpanUtils.command(
				"help"
			)}'.<br>`
		);
	} else {
		cmd.callback(split);
	}
	CookieData.updateHistory(commandHistory);
}