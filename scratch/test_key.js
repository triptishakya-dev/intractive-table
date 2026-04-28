const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testListModels() {
  const apiKey = "AIzaSyCsPjLfEhMbTYL77u0MG-KfhrxDUch6ZQg";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There is no listModels in the genAI object directly, we need to use fetch or the underlying client
    // But we can try a simple generateContent to see if the key is even working
    console.log("Testing gemini-1.5-flash content generation...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hi");
    console.log("✅ Success with gemini-1.5-flash:", result.response.text());
  } catch (err) {
    console.error("❌ Key verification failed:", err.message);
  }
}

testListModels();
