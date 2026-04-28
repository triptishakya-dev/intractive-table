/**
 * HeyGen API utilities
 */

export async function getAccessToken(): Promise<string> {
  const res = await fetch("https://api.heygen.com/v1/streaming.create_token", {
    method: "POST",
    headers: { "x-api-key": process.env.HEYGEN_API_KEY! },
  });

  if (!res.ok) {
    throw new Error(`HeyGen token error: ${res.status} ${res.statusText}`);
  }

  const { data } = await res.json();
  return data.token;
}
