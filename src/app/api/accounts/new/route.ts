import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { BankingSecurity } from "@/middleware/security";
import { createErrorResponse } from "@/utils/api";
import { extractUserIdFromToken } from "@/lib/jwt";

// POST - Crea nuovo conto bancario
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return createErrorResponse("Token mancante", 401);
    }

    const token = authHeader.replace("Bearer ", "");

    // Validazione token con controlli sicurezza
    const tokenValidation = BankingSecurity.validateAuthToken(token);
    if (!tokenValidation.valid) {
      return createErrorResponse("Token non valido", 401);
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return createErrorResponse("Invalid user", 400);
    }

    const body = await request.json();
    const { account_type } = body;

    if (!account_type || !["savings", "checking"].includes(account_type)) {
      return NextResponse.json(
        { success: false, error: "Tipo conto non valido" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Controlla se l'utente ha già un conto di questo tipo
    const [existing] = (await db.execute(
      "SELECT id FROM accounts WHERE user_id = ? AND account_type = ?",
      [userId, account_type]
    )) as any[];

    if (existing.length > 0) {
      const tipoItaliano =
        account_type === "savings" ? "risparmio" : "corrente";
      return NextResponse.json(
        { success: false, error: `Hai già un conto ${tipoItaliano}` },
        { status: 400 }
      );
    }

    // Genera numero conto
    const accountNumber = `${Date.now().toString().slice(-9)}${Math.floor(
      Math.random() * 1000
    )
      .toString()
      .padStart(3, "0")}`;

    // Crea nuovo conto
    const [result] = (await db.execute(
      "INSERT INTO accounts (user_id, account_number, account_type, balance, status) VALUES (?, ?, ?, 0, 'active')",
      [userId, accountNumber, account_type]
    )) as any[];

    // Recupera conto creato
    const [newAccount] = (await db.execute(
      "SELECT id, account_number, account_type, balance, status, created_at FROM accounts WHERE id = ?",
      [result.insertId]
    )) as any[];

    return NextResponse.json({
      success: true,
      data: newAccount[0],
      message: "Conto creato con successo",
    });
  } catch (error: any) {
    console.error("Errore POST accounts/new:", error);
    return NextResponse.json(
      { success: false, error: "Errore nella creazione conto" },
      { status: 500 }
    );
  }
}
