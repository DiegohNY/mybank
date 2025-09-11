import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { generateToken } from "@/lib/jwt";
import { hashPassword, validatePasswordStrength } from "@/lib/crypto";
import { BankingSecurity } from "@/middleware/security";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, phone } = body;

    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, error: "Tutti i campi sono obbligatori" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.errors.join(", ") },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Controlla se email esiste già
    const [existing] = (await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [sanitizedEmail]
    )) as any[];

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "Email già registrata" },
        { status: 400 }
      );
    }

    const sanitizedEmail = BankingSecurity.sanitizeInput(email.toLowerCase());
    const sanitizedFirstName = BankingSecurity.sanitizeInput(first_name);
    const sanitizedLastName = BankingSecurity.sanitizeInput(last_name);
    
    const passwordHash = await hashPassword(password);

    // Inserimento nuovo utente
    const [result] = (await db.execute(
      "INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)",
      [sanitizedEmail, passwordHash, sanitizedFirstName, sanitizedLastName, phone || null]
    )) as any[];

    // Recupera utente creato
    const [newUser] = (await db.execute(
      "SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = ?",
      [result.insertId]
    )) as any[];

    const user = newUser[0];
    const token = generateToken(user.id, user.email);

    return NextResponse.json({
      success: true,
      data: { user, token },
      message: "Registrazione completata con successo",
    });
  } catch (error: any) {
    console.error("Errore registrazione:", error);
    return NextResponse.json(
      { success: false, error: "Errore del server" },
      { status: 500 }
    );
  }
}
