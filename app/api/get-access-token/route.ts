export async function POST() {
const res = await fetch("https://api.heygen.com/v1/streaming.create_token", {
method: "POST",
headers: { "x-api-key": process.env.HEYGEN_API_KEY! },
});
const { data } = await res.json();
return Response.json({ token: data.token });
}