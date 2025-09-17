import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { generateToken } from "@/lib/jwt";
import { verifyPassword } from "@/lib/crypto";
import { BankingSecurity } from "@/middleware/security";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email e password obbligatori" },
        { status: 400 }
      );
    }

    const sanitizedEmail = BankingSecurity.sanitizeInput(email.toLowerCase());

    // Controllo rate limiting per prevenire attacchi brute force
    const rateLimitCheck = BankingSecurity.checkRateLimit(sanitizedEmail);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimitCheck.error },
        { status: 429 }
      );
    }
    const db = await connectToDatabase();

    // Controllo se l'utente è presente nel db
    const [users] = (await db.execute(
      "SELECT id, email, password_hash, first_name, last_name, phone, created_at FROM users WHERE email = ?",
      [sanitizedEmail]
    )) as any[];

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "Credenziali non valide" },
        { status: 401 }
      );
    }

    const user = users[0];

    if (!(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json(
        { success: false, error: "Credenziali non valide" },
        { status: 401 }
      );
    }

    // Reset rate limit in caso di login riuscito
    BankingSecurity.resetRateLimit(sanitizedEmail);

    const { password_hash, ...userWithoutPassword } = user;
    const token = generateToken(user.id, user.email);

    return NextResponse.json({
      success: true,
      data: { user: userWithoutPassword, token },
      message: "Login effettuato con successo",
    });
  } catch (error: any) {
    console.error("Errore login:", error);
    return NextResponse.json(
      { success: false, error: "Errore del server" },
      { status: 500 }
    );
  }
}
