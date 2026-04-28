export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch("https://api.heygen.com/v1/liveavatar/answer", {
    method: "POST",
    headers: {
      "x-api-key": process.env.HEYGEN_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data);
}