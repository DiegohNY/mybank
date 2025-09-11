import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { BankingSecurity } from "@/middleware/security";
import {
  validateAmount,
  validateAccountId,
  validateRequired,
  sanitizeInput,
} from "@/utils/validation";
import { createApiResponse, createErrorResponse } from "@/utils/api";
import {
  validateUserAccountOwnership,
  updateAccountBalance,
  createTransaction,
} from "@/utils/banking";

// Forza il rendering dinamico per questa route API
export const dynamic = "force-dynamic";

// POST - Elabora deposito
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

    const userId = tokenValidation.userId!;
    const body = await request.json();

    // Validazione e sanitizzazione input usando utils
    let sanitizedBody;
    try {
      validateRequired(body.account_id?.toString(), "ID conto");
      validateRequired(body.amount?.toString(), "Importo");

      sanitizedBody = {
        account_id: validateAccountId(body.account_id),
        amount: validateAmount(body.amount),
        description: body.description
          ? sanitizeInput(body.description)
          : "Deposito",
      };
    } catch (validationError: any) {
      return createErrorResponse(validationError.message, 400);
    }

    // Verifica che il conto esista e appartenga all'utente
    const account = await validateUserAccountOwnership(
      sanitizedBody.account_id,
      userId
    );

    // Calcola nuovo saldo
    const currentBalance = parseFloat(account.balance.toString());
    const newBalance = currentBalance + sanitizedBody.amount;

    // Crea la transazione
    const transaction = await createTransaction(
      sanitizedBody.account_id,
      sanitizedBody.amount,
      "deposit",
      sanitizedBody.description || "Deposito",
      newBalance
    );

    // Aggiorna il saldo del conto
    await updateAccountBalance(sanitizedBody.account_id, newBalance);

    return createApiResponse({
      transaction,
      message: "Deposito completato con successo",
    });
  } catch (error: any) {
    console.error("Errore POST deposit:", error);
    return createErrorResponse(error.message || "Errore nel deposito", 500);
  }
}
