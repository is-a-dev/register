// src/routes.ts

import type { ReactElement } from "react";
import { PageWrapper } from "./components/PageWrapper";

const modules = import.meta.glob("./pages/**/*.tsx", { eager: true });

type RouteItem = {
	path: string;
	element: ReactElement;
	title: string;
};

const titles: Record<string, string> = {
	"/": "Fuis18 - Projects",
	"/news": "Fuis18 - News",
	"/pages/0": "Fuis18 - Yanaira",
};

export const routes: RouteItem[] = Object.entries(modules).map(
	([filePath, module]) => {
		const segments = filePath.split("/");
		const fileName = segments.pop()!.replace(".tsx", "");
		const folderName = segments.pop()!;

		console.log(segments);
		console.log(folderName);
		console.log(fileName);

		let routePath = "/";

		if (folderName === "pages" && fileName !== "home") {
			routePath = `/${fileName.toLowerCase()}`;
		} else if (folderName !== "pages") {
			routePath = `/pages/${folderName.toLowerCase()}`;
		}

		const title = titles[routePath] || "Fuis18 - Projects";

		const Component = (module as any).default;

		return {
			path: routePath,
			title,
			element: (
				<PageWrapper title={title}>
					<Component />
				</PageWrapper>
			),
		};
	}
);
