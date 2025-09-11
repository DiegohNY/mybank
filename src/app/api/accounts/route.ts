import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { extractUserIdFromToken } from "@/lib/jwt";
import { createErrorResponse } from "@/utils/api";
import { BankingSecurity } from "@/middleware/security";

export const dynamic = "force-dynamic";

// GET - Recupera tutti i conti dell'utente
export async function GET(request: NextRequest) {
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
      return createErrorResponse("User non valido", 400);
    }

    const db = await connectToDatabase();
    // Query basilare con balance (necessario per dashboard principale)
    const [rows] = (await db.execute(
      "SELECT id, account_number, account_type, balance, status, created_at FROM accounts WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    )) as any[];

    return NextResponse.json({
      success: true,
      data: rows,
      message: "Conti recuperati con successo",
    });
  } catch (error: any) {
    console.error("Errore GET accounts:", error);
    return NextResponse.json(
      { success: false, error: "Errore nel recupero conti" },
      { status: 500 }
    );
  }
}
