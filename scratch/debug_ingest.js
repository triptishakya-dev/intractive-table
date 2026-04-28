const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pinecone } = require("@pinecone-database/pinecone");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testIngest() {
  console.log("Starting debug ingest...");
  console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
  console.log("PINECONE_API_KEY:", process.env.PINECONE_API_KEY ? "Present" : "Missing");
  console.log("PINECONE_INDEX:", process.env.PINECONE_INDEX);

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

    console.log("Listing indexes...");
    const existing = await pc.listIndexes();
    console.log("Existing indexes:", JSON.stringify(existing, null, 2));

    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    console.log("Testing Gemini embedding...");
    const result = await model.embedContent("Hello world");
    console.log("Gemini embedding successful.");

    console.log("Debug ingest complete.");
  } catch (err) {
    console.error("DEBUG INGEST ERROR:", err);
  }
}

testIngest();
