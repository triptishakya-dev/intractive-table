const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  try {
    const apiKey = "AIzaSyCsPjLfEhMbTYL77u0MG-KfhrxDUch6ZQg";
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log("Testing text-embedding-004 with v1...");
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" }, { apiVersion: "v1" });
    const result = await model.embedContent("test");
    console.log("✅ Success with text-embedding-004 (v1)");
  } catch (err) {
    console.error("❌ Failed with text-embedding-004 (v1):", err.message);
    
    try {
        const genAI = new GoogleGenerativeAI("AIzaSyCsPjLfEhMbTYL77u0MG-KfhrxDUch6ZQg");
        console.log("Testing text-embedding-004 with v1beta...");
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" }, { apiVersion: "v1beta" });
        const result = await model.embedContent("test");
        console.log("✅ Success with text-embedding-004 (v1beta)");
    } catch (err2) {
        console.error("❌ Failed with text-embedding-004 (v1beta):", err2.message);
    }
  }
}

listModels();
