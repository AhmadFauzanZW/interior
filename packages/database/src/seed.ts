import "dotenv/config";
import { db } from "./db";
import { categories, products, productVariants } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const existingCategories = await db.select().from(categories);
  if (existingCategories.length > 0) {
    console.log("Database already seeded, skipping.");
    process.exit(0);
  }

  const [chairs] = await db
    .insert(categories)
    .values([
      { name: "Kursi", slug: "kursi" },
      { name: "Meja", slug: "meja" },
      { name: "Sofa", slug: "sofa" },
      { name: "Lemari", slug: "lemari" },
      { name: "Tempat Tidur", slug: "tempat-tidur" },
      { name: "Dekorasi", slug: "dekorasi" },
    ])
    .returning();

  const [officeChair] = await db
    .insert(products)
    .values([
      {
        categoryId: chairs.id,
        name: "Kursi Kantor Modern",
        description: "Kursi kantor ergonomis dengan desain minimalis untuk ruang kerja modern.",
        basePrice: "2499000",
        glbUrl: "https://models.interior.local/models/office-chair.glb",
        thumbnailUrl: "/placeholder-chair.png",
        dimensions: { width: 0.65, height: 1.1, depth: 0.6 },
      },
      {
        categoryId: chairs.id,
        name: "Kursi Makan Kayu Jati",
        description: "Kursi makan premium dari kayu jati solid dengan finishing natural.",
        basePrice: "1599000",
        glbUrl: "https://models.interior.local/models/dining-chair.glb",
        thumbnailUrl: "/placeholder-chair-wood.png",
        dimensions: { width: 0.5, height: 0.95, depth: 0.5 },
      },
    ])
    .returning();

  await db.insert(productVariants).values([
    {
      productId: officeChair.id,
      colorHex: "#222222",
      materialType: "Mesh Hitam",
      additionalPrice: "0",
    },
    {
      productId: officeChair.id,
      colorHex: "#F5F5F5",
      materialType: "Kulit Putih",
      additionalPrice: "350000",
    },
    {
      productId: officeChair.id,
      colorHex: "#1E3A5F",
      materialType: "Fabric Navy",
      additionalPrice: "150000",
    },
  ]);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
