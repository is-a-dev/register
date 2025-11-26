// src/App.tsx
import type { ReactNode } from "react";
import "./App.css";
import Header from "@/components/header/Header";
import { ThemeProvider } from "./components/theme-provider";

function App({ children }: { children?: ReactNode }) {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<Header></Header>
			{children}
		</ThemeProvider>
	);
}

export default App;
