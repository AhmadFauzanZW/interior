import { NextResponse } from "next/server";
import { getFileBuffer } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await context.params;
    const decoded = decodeURIComponent(key);
    const result = await getFileBuffer(decoded);

    if (!result) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
    }

    const body = result.buffer as unknown as BodyInit;
    return new Response(body, {
      headers: {
        "Content-Type": result.mimeType,
        "Content-Length": String(result.buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/models/[key] error:", error);
    return NextResponse.json({ error: "Gagal memuat file" }, { status: 500 });
  }
}
