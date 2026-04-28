import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

async function getEmbedding(text: string) {
  const models = ["text-embedding-004", "embedding-001"];
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err: any) {
      if (err.message?.includes("404") || err.message?.includes("not found")) continue;
      throw err;
    }
  }
  throw new Error("No supported embedding model found.");
}

async function generateWithFallback(prompt: string) {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err: any) {
      if (err.message?.includes("404") || err.message?.includes("not found")) continue;
      throw err;
    }
  }
  throw new Error("No supported generative model found.");
}

export async function queryRAG(question: string): Promise<string> {
  const questionVector = await getEmbedding(question);
  const index = pc.index(process.env.PINECONE_INDEX!);
  const queryResult = await index.query({
    vector: questionVector,
    topK: 5,
    includeMetadata: true,
  });

  const context = queryResult.matches
    .map((m) => {
      const title = m.metadata?.title as string | undefined;
      const text = m.metadata?.text as string | undefined;
      return title && text ? `## ${title}\n${text}` : text ?? "";
    })
    .filter(Boolean)
    .join("\n\n");

  const prompt = `You are a knowledgeable Rubenius brand ambassador AI assistant. 
Answer the following question based ONLY on the provided Rubenius company context below. 
Keep your answer conversational, concise (2-4 sentences), and suitable for speech delivery by an AI avatar. 
Do NOT mention that you are an AI or that you are using context.

Company Context:
${context}

Question: ${question}

Answer:`;

  return await generateWithFallback(prompt);
}
