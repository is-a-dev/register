// src/routes.tsx
import type { ReactElement } from "react";
import { PageWrapper } from "./components/PageWrapper";
import { PROJECTS } from "@/data/projects";

const modules = import.meta.glob("./pages/**/*.tsx", { eager: true });

type RouteItem = {
	path: string;
	element: ReactElement;
	title: string;
};

export const routes: RouteItem[] = Object.entries(modules).map(
	([filePath, module]) => {
		const parts = filePath.split("/");

		const file = parts.pop()!.replace(".tsx", "");
		const folder = parts.pop()!;

		let routePath = "/";
		let title = "Fuis18 - Web";

		// 1. HOME -> /
		if (folder === "pages" && file === "home") {
			routePath = "/";
			title = "Fuis18 - Home";
		}

		// 2. Páginas normales como news.tsx, about.tsx
		else if (folder === "pages" && file !== "page") {
			routePath = `/${file.toLowerCase()}`;
			title = `Fuis18 - ${file.charAt(0).toUpperCase() + file.slice(1)}`;
		}

		// 3. Carpetas numéricas -> proyectos /pages/0, /pages/1, etc.
		else if (!isNaN(Number(folder)) && file === "page") {
			const id = Number(folder);
			routePath = `/pages/${id}`;
			title = PROJECTS[id] ? `Fuis18 - ${PROJECTS[id]}` : "Fuis18 - Proyecto";
		}

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
