import { runMovieQuery } from "../queryPipeline.js";

export const maxDuration = 60; // 60s timeout for GraphRAG execution on Vercel

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const result = await runMovieQuery(payload?.query);
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      error: err.message || "Something went wrong while answering.",
    });
  }
}
