import "dotenv/config";
import { db } from "./db";
import { adminUsers } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@interior.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = "Super Admin";

async function seedAdmin() {
  const existing = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, ADMIN_EMAIL));

  if (existing.length > 0) {
    console.log("Admin already exists, updating password...");
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await db
      .update(adminUsers)
      .set({ passwordHash: hash })
      .where(eq(adminUsers.email, ADMIN_EMAIL));
    console.log(`Admin password updated: ${ADMIN_EMAIL}`);
    process.exit(0);
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await db.insert(adminUsers).values({
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    passwordHash: hash,
    role: "admin",
  });

  console.log(`Admin created: ${ADMIN_EMAIL}`);
  process.exit(0);
}

seedAdmin().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
