import { ingestRubeniusData } from "@/lib/ingest";

export async function POST() {
  try {
    const result = await ingestRubeniusData();
    return Response.json({
      success: true,
      message: `Ingested ${result.upserted} chunks into Pinecone`,
    });
  } catch (err: any) {
    console.error("[ingest route error]", err);
    // Return the actual error message for debugging
    return Response.json({ 
      error: err.message || "Ingestion failed",
      details: err.stack
    }, { status: 500 });
  }
}
