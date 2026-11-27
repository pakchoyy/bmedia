import { NextResponse } from "next/server";

// Suara pembaca AI (ElevenLabs). Aktif bila ELEVENLABS_API_KEY diisi di Vercel.
// Respons di-cache CDN 1 tahun, jadi kalimat yang sama hanya dibuat sekali.
export const runtime = "edge";

export async function GET(req: Request) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return new NextResponse("off", { status: 404 });
  const url = new URL(req.url);
  const t = (url.searchParams.get("t") || "").trim().slice(0, 300);
  if (!t) return new NextResponse("kosong", { status: 400 });
  // hanya dari situs sendiri, supaya kuota tidak dipakai orang lain
  const ref = req.headers.get("referer") || "";
  if (ref && new URL(ref).host !== url.host) return new NextResponse("ditolak", { status: 403 });
  const voice = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text: t, model_id: process.env.ELEVENLABS_MODEL || "eleven_flash_v2_5", language_code: "id", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!r.ok) return new NextResponse("gagal", { status: 502 });
  return new NextResponse(r.body, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable" },
  });
}
