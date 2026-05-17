import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productVariants } from "@interior/database";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const variantSchema = z.object({
  productId: z.string().uuid(),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  materialType: z.string().max(50).optional(),
  additionalPrice: z.coerce.number().min(0).default(0),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const variants = productId
      ? await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, productId))
      : await db.select().from(productVariants);

    return NextResponse.json(variants);
  } catch (error) {
    console.error("GET /api/product-variants error:", error);
    return NextResponse.json({ error: "Gagal memuat varian" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = variantSchema.parse(body);

    const [variant] = await db
      .insert(productVariants)
      .values({
        productId: parsed.productId,
        colorHex: parsed.colorHex ?? null,
        materialType: parsed.materialType ?? null,
        additionalPrice: String(parsed.additionalPrice),
      })
      .returning();

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return NextResponse.json({ error: messages.join("; ") }, { status: 400 });
    }
    console.error("POST /api/product-variants error:", error);
    return NextResponse.json({ error: "Gagal menambah varian" }, { status: 500 });
  }
}
