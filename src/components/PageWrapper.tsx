// src/components/PageWrapper.tsx
import { useEffect } from "react";
import type { ReactNode } from "react";

type PageWrapperProps = {
	title: string;
	children: ReactNode;
};

export const PageWrapper = ({ title, children }: PageWrapperProps) => {
	useEffect(() => {
		document.title = title;
	}, [title]);

	return <>{children}</>;
};
