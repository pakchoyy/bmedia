export const THUMBNAIL_BUCKET = "thumbnails";

export function thumbnailPublicUrl(path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return path;
  return `${url}/storage/v1/object/public/${THUMBNAIL_BUCKET}/${path}`;
}

export function isStoredThumbnail(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes(`/object/public/${THUMBNAIL_BUCKET}/`);
}