import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT ?? 4000;

// CSP desactivada: la pagina carga la libreria de QR desde un CDN y
// usa <script> inline (un solo archivo, sin build step de frontend).
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL ?? "*" }));

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", service: "quickqr", timestamp: new Date().toISOString() });
});

app.use(express.static(path.join(__dirname, "..", "public")));

app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.listen(PORT, () => {
  console.log(`[quickqr] Escuchando en el puerto ${PORT}`);
});
