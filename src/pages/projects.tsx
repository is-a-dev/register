// src/pages/home.tsx
import Main from "@/components/main/Main";
import Project from "@/components/main/Project-input";
import { PROJECTS } from "@/data/projects";

export default function Projects() {
	return (
		<Main title="All Projects" className="cont__flex">
			{PROJECTS.map((title, i) => (
				<Project key={i} id={i} title={title} />
			))}
		</Main>
	);
}
