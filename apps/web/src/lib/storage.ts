import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, unlink, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { existsSync } from "node:fs";

const STORAGE_TYPE = process.env.STORAGE_TYPE || "local";
const STORAGE_LOCAL_DIR = process.env.STORAGE_LOCAL_DIR || join(process.cwd(), "storage", "models");

function generateKey(filename: string): string {
  const ext = extname(filename);
  const name = filename.replace(ext, "").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 60);
  return `interior/models/${Date.now()}-${name}${ext}`;
}

function normalizeKey(keyOrUrl: string): string {
  let key = keyOrUrl;
  try {
    const url = new URL(keyOrUrl);
    key = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
    const bucketPrefix = (process.env.S3_BUCKET || "") + "/";
    if (key.startsWith(bucketPrefix)) {
      key = key.slice(bucketPrefix.length);
    }
  } catch {
    // Not a URL, use as-is
  }
  return key.replace(/\/{2,}/g, "/");
}

// ---- S3 Client ----
let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT
        ? `https://${process.env.S3_ENDPOINT}`
        : undefined,
      region: process.env.S3_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "",
        secretAccessKey: process.env.S3_SECRET_KEY || "",
      },
      forcePathStyle: true,
    });
  }
  return _s3Client;
}

// ---- Upload ----
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ key: string; url: string }> {
  const key = generateKey(originalName);

  if (STORAGE_TYPE === "s3") {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ContentLength: buffer.length,
      })
    );
    const url = await getPresignedUrl(key);
    return { key, url };
  }

  // Local storage
  await mkdir(STORAGE_LOCAL_DIR, { recursive: true });
  const filePath = join(STORAGE_LOCAL_DIR, key.replace("interior/models/", ""));
  const dir = filePath.substring(0, filePath.lastIndexOf("\\"));
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(filePath, buffer);

  return { key, url: `/api/models/${encodeURIComponent(key)}` };
}

// ---- Presigned URL (S3 only) ----
export async function getPresignedUrl(keyOrUrl: string): Promise<string> {
  const key = normalizeKey(keyOrUrl);

  if (STORAGE_TYPE !== "s3") {
    return `/api/models/${encodeURIComponent(key)}`;
  }

  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

// ---- Serve / Get file URL ----
export async function getFileUrl(keyOrUrl: string): Promise<string> {
  const key = normalizeKey(keyOrUrl);

  if (STORAGE_TYPE === "s3") {
    return getPresignedUrl(key);
  }
  return `/api/models/${encodeURIComponent(key)}`;
}

// ---- Get file buffer (for serving local files) ----
export async function getFileBuffer(key: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
  if (STORAGE_TYPE !== "local") return null;

  const normalized = key.replace("interior/models/", "");
  const filePath = join(STORAGE_LOCAL_DIR, normalized);

  if (!existsSync(filePath)) return null;

  const { readFile } = await import("node:fs/promises");
  const buffer = await readFile(filePath);
  const ext = extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  return { buffer, mimeType: mimeTypes[ext] || "application/octet-stream" };
}

// ---- Delete ----
export async function deleteFile(keyOrUrl: string): Promise<void> {
  const key = normalizeKey(keyOrUrl);

  if (STORAGE_TYPE === "s3") {
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
      })
    );
    return;
  }

  const filePath = join(STORAGE_LOCAL_DIR, key.replace("interior/models/", ""));
  try {
    await unlink(filePath);
  } catch {
    // File may not exist
  }
}
