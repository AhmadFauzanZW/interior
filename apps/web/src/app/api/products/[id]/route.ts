import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@interior/database";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional().default(""),
  basePrice: z.coerce.number().min(0),
  glbUrl: z.string().optional().default(""),
  thumbnailUrl: z.string().optional().default(""),
  dimensions: z
    .object({
      width: z.coerce.number().positive(),
      height: z.coerce.number().positive(),
      depth: z.coerce.number().positive(),
    })
    .optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { category: true, variants: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "Gagal memuat produk" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const [updated] = await db
      .update(products)
      .set({
        categoryId: parsed.categoryId,
        name: parsed.name,
        description: parsed.description || null,
        basePrice: String(parsed.basePrice),
        glbUrl: parsed.glbUrl || "",
        thumbnailUrl: parsed.thumbnailUrl || null,
        dimensions: parsed.dimensions || null,
      })
      .where(eq(products.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return NextResponse.json({ error: messages.join("; ") }, { status: 400 });
    }
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengupdate produk" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
