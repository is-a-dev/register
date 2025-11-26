// src/components/Main.tsx
import type { ReactNode } from "react";

type MainProps = {
	title: string;
	className?: string;
	children?: ReactNode;
	fProject?: string;
};

const Main = ({ title, className = "", children, fProject }: MainProps) => {
	return (
		<main role="main">
			{fProject ? (
				<h1 className={`${fProject}__h1`}>{title}</h1>
			) : (
				<h1>{title}</h1>
			)}
			<div className={`container ${className}`}>{children}</div>
		</main>
	);
};

export default Main;
