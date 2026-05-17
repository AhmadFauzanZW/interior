import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@interior/database";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const productSchema = z.object({
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

export async function GET() {
  try {
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        basePrice: products.basePrice,
        glbUrl: products.glbUrl,
        thumbnailUrl: products.thumbnailUrl,
        dimensions: products.dimensions,
        categoryId: products.categoryId,
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(desc(products.createdAt));

    return NextResponse.json(allProducts);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Gagal memuat produk" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = productSchema.parse(body);

    const [product] = await db
      .insert(products)
      .values({
        categoryId: parsed.categoryId,
        name: parsed.name,
        description: parsed.description ?? null,
        basePrice: String(parsed.basePrice),
        glbUrl: parsed.glbUrl ?? "",
        thumbnailUrl: parsed.thumbnailUrl ?? null,
        dimensions: parsed.dimensions ?? null,
      })
      .returning();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      console.error("Zod validation error:", messages);
      return NextResponse.json({ error: messages.join("; ") }, { status: 400 });
    }
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Gagal menambah produk" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
