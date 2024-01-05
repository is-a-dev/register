/**
 * The default date format.
 */
const defaultDateFormat = {
	weekday: "short",
	month: "short",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	year: "numeric",
};

class TerminalUtils {
	/**
	 * Requests the focus for the input element.
	 */
	static requestFocus() {
		document.getElementById("input").focus();
	}

	/**
	 * Prints out the given array with a typewriter effect.
	 *
	 * @param {string[]} arr The array to print out.
	 * @param {number} index The current index.
	 * @param {number} interval The interval between each item.
	 */
	static printOut(arr, index, interval) {
		if (index < arr.length) {
			isPrinting = true;
			$("#output").append(arr[index++] + "<br>");
			$("html,body").animate({ scrollTop: document.body.scrollHeight }, "fast");
			setTimeout(function () {
				TerminalUtils.printOut(arr, index, interval);
			}, interval);
		} else {
			isPrinting = false;
		}
	}

	static printOutSingle(str, interval) {
		return this.printOut([str], 0, interval);
	}
}

class SpanUtils {
	static user(str) {
		return this._span(str, "user");
	}

	static highlight(str) {
		return this._span(str, "highlight");
	}

	static command(str) {
		return this._span(str, "command");
	}

	static _span(str, id) {
		return `<span id='${id}'>${str}</span>`;
	}
}