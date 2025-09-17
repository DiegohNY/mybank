import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { BankingSecurity } from "@/middleware/security";
import { createErrorResponse } from "@/utils/api";
import { extractUserIdFromToken } from "@/lib/jwt";

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

    // Sanitizzazione input
    const sanitizedBody = {
      account_id: BankingSecurity.sanitizeInput(body.account_id),
      amount: BankingSecurity.sanitizeInput(parseFloat(body.amount)),
      description: BankingSecurity.sanitizeInput(body.description),
    };

    // Validazione operazione bancaria
    const operationValidation = BankingSecurity.validateBankingOperation({
      ...sanitizedBody,
      transaction_type: "withdrawal",
    });
    if (!operationValidation.valid) {
      return NextResponse.json(
        { success: false, error: operationValidation.errors.join(", ") },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Validazione dati prelievo
    if (!sanitizedBody.account_id || !sanitizedBody.amount) {
      throw new Error("Dati prelievo mancanti");
    }

    if (sanitizedBody.amount <= 0) {
      throw new Error("Importo deve essere positivo");
    }

    // Verifica che il conto esista e appartenga all'utente
    const [accounts] = (await db.execute(
      "SELECT id, balance FROM accounts WHERE id = ? AND user_id = ?",
      [sanitizedBody.account_id, userId]
    )) as any[];

    if (accounts.length === 0) {
      throw new Error("Conto non trovato");
    }

    const account = accounts[0];
    const currentBalance = parseFloat(account.balance.toString());

    // Verifica saldo sufficiente
    if (currentBalance < sanitizedBody.amount) {
      throw new Error("Saldo insufficiente");
    }

    const newBalance = parseFloat((currentBalance - sanitizedBody.amount).toFixed(2));

    // Inserisci transazione prelievo
    const [result] = (await db.execute(
      "INSERT INTO transactions (account_id, transaction_type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?)",
      [
        sanitizedBody.account_id,
        "withdrawal",
        sanitizedBody.amount,
        newBalance,
        sanitizedBody.description || "Prelievo",
      ]
    )) as any[];

    // Aggiorna il saldo del conto
    await db.execute("UPDATE accounts SET balance = ? WHERE id = ?", [
      newBalance,
      sanitizedBody.account_id,
    ]);

    // Recupera transazione creata
    const [newTransaction] = (await db.execute(
      "SELECT id, account_id, transaction_type, amount, balance_after, description, created_at FROM transactions WHERE id = ?",
      [result.insertId]
    )) as any[];

    const transaction = newTransaction[0];

    return NextResponse.json({
      success: true,
      data: transaction,
      message: "Prelievo completato con successo",
    });
  } catch (error: any) {
    console.error("Errore POST withdrawal:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Errore nel prelievo" },
      { status: 500 }
    );
  }
}
