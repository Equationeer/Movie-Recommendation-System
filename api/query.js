import { runMovieQuery } from "../queryPipeline.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const result = await runMovieQuery(req.body?.query);
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      error: err.message || "Something went wrong while answering.",
    });
  }
}
