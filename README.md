# CineGraph AI — GraphRAG Movie Intelligence & Recommendation System

A state-of-the-art **GraphRAG** (Graph Retrieval-Augmented Generation) movie intelligence and recommendation system combining **Neo4j Knowledge Graphs**, **Pinecone Vector Search**, and **Google Gemini 3.7 Flash LLM / Embeddings**, packaged with a modern cinematic dark glassmorphism web interface.

---

## Overview

CineGraph AI unifies **structured knowledge graph traversal** and **dense vector similarity search** into a hybrid GraphRAG architecture:

-  Knowledge Graph (Neo4j)**: Maps rich relational facts between `Movie`, `Director`, `Actor`, `Genre`, `Theme`, and `Award` nodes.
-  Vector Database (Pinecone)**: Stores 3072-dimensional embeddings (`gemini-embedding-001`) of movie plots and thematic summaries for semantic taste matching.
-  Intelligent Pipeline (Gemini 3.7 Flash)**:
  1. Entity Resolution**: Automatically identifies and maps search terms to exact database nodes.
  2. Query Classification**: Routes questions to graph traversal (factual/relational queries) or vector similarity (recommendations).
  3. **Context Synthesis**: Executes safe, parameterized Cypher or hybrid vector filters and synthesizes natural language answers.
-  CineGraph UI: A responsive, dark glassmorphism web application with real-time pipeline telemetry, latency counters, clickable entity chips, and formatted conversational cards.

---

##  Architecture

```
User Query (e.g. "Movies directed by Christopher Nolan" or "Movies like Inception")
  │
  ▼
1. Entity Resolution (Gemini + Neo4j fuzzy/exact matching)
  │
  ▼
2. Query Classifier (Graph Cypher vs. Vector Similarity)
  │
  ├──► Graph Handler ──► Template Cypher Builder ──► Neo4j DB ──► Grounded Response
  │
  └──► Similarity Handler ──► Embeddings ──► Pinecone DB ──► Genre Filter ──► Ranked Top 10
```

---

##  Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Neo4j Aura Cloud](https://neo4j.com/cloud/aura/) instance
- [Pinecone Vector DB](https://www.pinecone.io/) index (dimension: `3072`, metric: `cosine`)
- [Google AI Studio](https://aistudio.google.com/) Gemini API key

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Equationeer/Movie-Recommendation-System.git
cd Movie-Recommendation-System
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory (based on `.env.example`):

```env
# Neo4j Aura Database Credentials
NEO4J_URI=neo4j+s://your-neo4j-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=movies-3072

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Port (Optional)
PORT=3000
```

---

##  Usage

### Test Connections
Verify that all 4 services (Neo4j, Pinecone, Gemini LLM, Gemini Embeddings) are connected:
```bash
npm run test
```

### Index Movie Dataset
Extract movie entities from `data/movies.pdf`, construct the Neo4j graph, and build Pinecone embeddings:
```bash
npm run index
```

### Start Web Application
Launch the CineGraph AI web server and open the interactive dashboard:
```bash
npm run web
```
Open your browser at:
```
http://localhost:3000
```

### Run CLI Query Mode
Interact with the system directly through your terminal:
```bash
npm run query
```

---

##  Project Structure

```
├── 1_testConnection.js     # Connection health-check for all 4 services
├── 2_config.js             # Centralized clients (Neo4j, Pinecone, Gemini)
├── 3_pdfParser.js          # Extracts text blocks from movie PDF
├── 4_entityExtractor.js    # Batched entity extraction via Gemini Files API
├── 5_graphBuilder.js       # Builds Neo4j nodes, relationships, and indexes
├── 6_vectorStore.js        # Generates embeddings and upserts to Pinecone
├── 7_runIndexing.js        # Complete pipeline runner for indexing
├── 8_cypherTemplates.js    # Whitelist-based Cypher generator (injection-safe)
├── 9_entityResolver.js     # Fuzzy & exact entity resolution against Neo4j
├── 10_queryClassifier.js   # Classifies queries into Graph vs. Similarity
├── 11_graphHandler.js      # Executes Cypher graph traversal & answer formatting
├── 12_similarityHandler.js # Hybrid Pinecone vector + Neo4j genre recommendation
├── 13_runQuery.js          # Interactive CLI interface
├── queryPipeline.js        # Unified query pipeline entrypoint
├── server.js               # HTTP server with CORS and REST API (/api/query)
├── public/                 # CineGraph AI modern web frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── data/                   # Movie dataset (PDF)
├── .env.example            # Environment template
└── package.json
```

---

##  License

MIT License. Feel free to use and adapt for your own GraphRAG projects!
