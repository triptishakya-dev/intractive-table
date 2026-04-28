import { queryRAG } from "@/lib/rag";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return Response.json({ error: "question is required" }, { status: 400 });
    }

    const answer = await queryRAG(question);
    return Response.json({ answer });
  } catch (err) {
    console.error("[chat route]", err);
    return Response.json(
      { error: "Failed to generate answer" },
      { status: 500 }
    );
  }
}
