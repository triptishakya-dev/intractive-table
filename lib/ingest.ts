import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import rubeniusData from "@/data/company/rubenius.json";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

/**
 * Robust embedding helper: tries multiple model names in case of 404
 */
async function getEmbedding(text: string) {
  const models = ["text-embedding-004", "embedding-001"];
  
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err: any) {
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        console.warn(`[ingest] Model ${modelName} not found, trying next...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error("No supported embedding model found for this API key.");
}

export async function ingestRubeniusData(): Promise<{ upserted: number }> {
  const indexName = process.env.PINECONE_INDEX!;

  const existing = await pc.listIndexes();
  const names = (existing.indexes ?? []).map((i) => i.name);
  
  if (!names.includes(indexName)) {
    await pc.createIndex({
      name: indexName,
      dimension: 768,
      metric: "cosine",
      spec: { serverless: { cloud: "aws", region: "us-east-1" } },
    });
    await new Promise((r) => setTimeout(r, 10000)); // Wait for index initialization
  }

  const index = pc.index(indexName);

  const vectors = await Promise.all(
    rubeniusData.chunks.map(async (chunk) => {
      const embedding = await getEmbedding(chunk.text);
      return {
        id: chunk.id,
        values: embedding,
        metadata: { title: chunk.title, text: chunk.text },
      };
    })
  );

  await index.upsert({ records: vectors });
  return { upserted: vectors.length };
}
