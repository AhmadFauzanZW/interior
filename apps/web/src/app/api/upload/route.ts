import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "File diperlukan" }, { status: 400 });
    }

    const validExtensions = [".glb", ".gltf", ".jpg", ".jpeg", ".png", ".webp"];
    const fileName = file.name.toLowerCase();
    const ext = fileName.substring(fileName.lastIndexOf("."));
    if (!validExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `Format file tidak didukung. Gunakan: ${validExtensions.join(", ")}` },
        { status: 400 }
      );
    }

    const maxSize = ext === ".glb" || ext === ".gltf" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = folder ? `${folder}/${file.name}` : file.name;
    const result = await uploadFile(buffer, name, file.type || "application/octet-stream");

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Upload gagal" }, { status: 500 });
  }
}
