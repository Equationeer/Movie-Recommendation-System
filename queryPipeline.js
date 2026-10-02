import { resolveQueryEntities } from "./9_entityResolver.js";
import { classifyQuery } from "./10_queryClassifier.js";
import { handleGraphQuery } from "./11_graphHandler.js";
import { handleSimilarityQuery } from "./12_similarityHandler.js";

function now() {
  return Date.now();
}

async function timedStep(name, timings, fn) {
  const startedAt = now();
  const value = await fn();
  timings[name] = now() - startedAt;
  return value;
}

async function runMovieQuery(query) {
  const normalizedQuery = String(query || "").trim();

  if (!normalizedQuery) {
    throw new Error("Please enter a movie question.");
  }

  const startedAt = now();
  const timings = {};

  const resolved = await timedStep("entityResolution", timings, () =>
    resolveQueryEntities(normalizedQuery)
  );

  const classification = await timedStep("classification", timings, () =>
    classifyQuery(normalizedQuery, resolved)
  );

  const handler =
    classification?.type === "similarity"
      ? handleSimilarityQuery
      : handleGraphQuery;

  const answer = await timedStep("answerGeneration", timings, () =>
    handler(normalizedQuery, resolved)
  );

  timings.total = now() - startedAt;

  return {
    query: normalizedQuery,
    resolved,
    classification,
    answer,
    timings,
  };
}

export { runMovieQuery };
