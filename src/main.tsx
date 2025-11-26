// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import { routes } from "./routes";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<App>
				<Routes>
					{routes.map(({ path, element }) => (
						<Route key={path} path={path} element={element} />
					))}
				</Routes>
			</App>
		</BrowserRouter>
	</StrictMode>
);
