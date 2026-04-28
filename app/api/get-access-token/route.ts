// export async function POST() {
//   const apiKey = process.env.HEYGEN_API_KEY!;
  
//   try {
//     // Attempt 1: Standard x-api-key header (Official for Streaming Avatar)
//     let res = await fetch("https://api.heygen.com/v1/streaming.create_token", {
//       method: "POST",
//       headers: { 
//         "x-api-key": apiKey,
//         "Content-Type": "application/json"
//       },
//       // Some versions of the API require an empty body for POST
//       body: JSON.stringify({}), 
//     });

//     let body = await res.json().catch(() => null);

//     // If 401/403, try the newer Authorization: Bearer header (used in some v2 keys)
//     if (!res.ok && (res.status === 401 || res.status === 403)) {
//       console.warn(`[get-access-token] Retrying with Authorization header (status was ${res.status})`);
//       res = await fetch("https://api.heygen.com/v1/streaming.create_token", {
//         method: "POST",
//         headers: { 
//           "Authorization": `Bearer ${apiKey}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({}),
//       });
//       body = await res.json().catch(() => null);
//     }

//     if (!res.ok) {
//       console.error("[get-access-token] HeyGen error:", res.status, body);
//       return Response.json(
//         { error: body?.error?.message || `HeyGen API error ${res.status}` },
//         { status: res.status }
//       );
//     }

//     const token = body?.data?.token;
//     if (!token) {
//       console.error("[get-access-token] Missing token in response:", body);
//       return Response.json({ error: "No token in HeyGen response" }, { status: 502 });
//     }

//     return Response.json({ token });
//   } catch (err: any) {
//     console.error("[get-access-token] Unexpected error:", err);
//     return Response.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

export async function POST() {
  const apiKey = process.env.HEYGEN_API_KEY!;

  try {
    const res = await fetch("https://api.heygen.com/v2/liveavatar/session", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avatar_id: process.env.NEXT_PUBLIC_AVATAR_ID,
      }),
    });

    const raw = await res.text();
    console.log("STATUS:", res.status);
    console.log("RAW:", raw);

    const body = JSON.parse(raw);

    if (!res.ok) {
      return Response.json(
        { error: body?.message || `HeyGen API error ${res.status}` },
        { status: res.status }
      );
    }

    return Response.json({
      session_id: body.session_id,
      offer: body.offer,
    });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}