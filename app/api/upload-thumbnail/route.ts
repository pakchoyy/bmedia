import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

const BUCKET = "media";
const MAX_SIZE = 3 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  forcePathStyle: true,
});

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }
  const ext = EXT_BY_MIME[file.type];
  if (!ext) return NextResponse.json({ error: "Format gambar tidak didukung." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Gambar terlalu besar." }, { status: 413 });

  const key = `thumbnails/thumb-${crypto.randomUUID()}.${ext}`;
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: new Uint8Array(await file.arrayBuffer()),
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
  } catch (e) {
    console.error("upload-thumbnail error:", e);
    return NextResponse.json({ error: "Gagal menyimpan gambar." }, { status: 500 });
  }
  return NextResponse.json({ url: `${process.env.AWS_ENDPOINT_URL_S3}/${BUCKET}/${key}` });
}
