import { fetchTarimaData } from "../src/tarimaData.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const rows = await fetchTarimaData();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json({ rows });
  } catch (e) {
    console.error("Error en /api/tarima:", e);
    res.status(500).json({ error: e.message || "Error al cargar los datos." });
  }
}
