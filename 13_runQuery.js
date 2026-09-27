// =====================================================================
// 13_runQuery.js - INTERACTIVE QUERY CLI
// =====================================================================
//
// The CLI now uses the same query pipeline as the web server:
// user query -> entity resolution -> classification -> graph/similarity
// handler -> answer.
//
// Run with:
//   npm run query
// =====================================================================

import readline from "readline";
import { closeConnections } from "./2_config.js";
import { runMovieQuery } from "./queryPipeline.js";

async function processQuery(query) {
  console.log("\n===========================================");
  console.log("ENTITY RESOLUTION -> CLASSIFICATION -> ANSWER");
  console.log("===========================================\n");

  const result = await runMovieQuery(query);

  console.log("\nClassification");
  console.log(
    `Type: ${result.classification.type} | Reason: ${result.classification.reasoning}`
  );

  console.log("\nAnswer:\n");
  console.log(result.answer);
  console.log("\n===========================================\n");
}

async function startCLI() {
  console.log("===========================================");
  console.log("   GraphRAG Movie Query System");
  console.log("===========================================");
  console.log('Type your question. Type "exit" to quit.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = () => {
    rl.question("Movie question: ", async (input) => {
      const query = input.trim();

      if (query.toLowerCase() === "exit") {
        console.log("\nGoodbye!");
        rl.close();
        await closeConnections();
        process.exit(0);
      }

      if (!query) {
        ask();
        return;
      }

      try {
        await processQuery(query);
      } catch (err) {
        console.error("\nError:", err.message);
      }

      ask();
    });
  };

  ask();
}

startCLI();
