import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers } from "@interior/database";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createToken, setSessionCookie } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib" }, { status: 400 });
    }

    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email));

    if (!admin) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const token = await createToken({
      userId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ error: "Gagal login" }, { status: 500 });
  }
}
