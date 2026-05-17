import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@interior/database";
import { z } from "zod";

export const dynamic = "force-dynamic";

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
});

export async function GET() {
  try {
    const allCategories = await db.select().from(categories).orderBy(categories.name);
    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Gagal memuat kategori" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = categorySchema.parse(body);

    const [category] = await db
      .insert(categories)
      .values({ name: parsed.name, slug: parsed.slug })
      .returning();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return NextResponse.json({ error: messages.join("; ") }, { status: 400 });
    }
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: "Gagal menambah kategori" }, { status: 500 });
  }
}
