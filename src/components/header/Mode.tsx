import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const Sun = (): JSX.Element => (
	<>
		<circle cx="12" cy="12" r="5" />
		<line x1="1" y1="12" x2="3" y2="12" />
		<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
		<line x1="12" y1="1" x2="12" y2="3" />
		<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
		<line x1="21" y1="12" x2="23" y2="12" />
		<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
		<line x1="12" y1="21" x2="12" y2="23" />
		<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
	</>
);

const Moon = (): JSX.Element => (
	<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
);

const Mode = () => {
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="p-0"
			aria-label="Toggle theme"
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				className="w-6 h-6"
			>
				{theme === "light" ? <Sun /> : <Moon />}
			</svg>
		</Button>
	);
};

export default Mode;
