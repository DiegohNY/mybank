import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { extractUserIdFromToken } from "@/lib/jwt";
import { createErrorResponse } from "@/utils/api";
import { BankingSecurity } from "@/middleware/security";

export const dynamic = "force-dynamic";

// GET - Recupera storico transazioni dell'utente con filtri
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("account_id");
    const transactionType = searchParams.get("transaction_type");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const limit = searchParams.get("limit");

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

    const db = await connectToDatabase();

    // Query per storico transazioni con filtri
    let query = `
      SELECT t.id, t.account_id, t.transaction_type, t.amount, t.balance_after, 
             t.description, t.created_at, a.account_number
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE a.user_id = ?
    `;

    const params: any[] = [userId];

    // Filtro per account specifico
    if (accountId && accountId.trim() !== "") {
      query += " AND t.account_id = ?";
      params.push(parseInt(accountId));
    }

    // Non applicare il filtro transaction_type nella query SQL
    // Lo faremo dopo la mappatura per gestire correttamente i bonifici

    // Filtro per data inizio
    if (dateFrom && dateFrom.trim() !== "") {
      query += " AND DATE(t.created_at) >= ?";
      params.push(dateFrom);
    }

    // Filtro per data fine
    if (dateTo && dateTo.trim() !== "") {
      query += " AND DATE(t.created_at) <= ?";
      params.push(dateTo);
    }

    const limitValue = limit ? parseInt(limit) : 50;
    query += ` ORDER BY t.created_at DESC LIMIT ${limitValue}`;

    const [transactions] = (await db.execute(query, params)) as any[];

    console.log("trovate", transactions.length, "transazioni");

    // Mappa le transazioni per correggere i tipi in base alla descrizione
    const mappedTransactions = transactions.map((transaction: any) => {
      let correctedType = transaction.transaction_type;

      // Se è un deposit ma la descrizione indica un bonifico ricevuto, cambia il tipo
      if (
        transaction.transaction_type === "deposit" &&
        transaction.description &&
        (transaction.description.includes("Trasferimento da ") ||
          transaction.description.includes("Bonifico da ") ||
          transaction.description.includes("da conto "))
      ) {
        correctedType = "transfer_in";
      }

      // Se è un withdrawal ma la descrizione indica un bonifico inviato, cambia il tipo
      if (
        transaction.transaction_type === "withdrawal" &&
        transaction.description &&
        (transaction.description.includes("Trasferimento a ") ||
          transaction.description.includes("Bonifico a ") ||
          transaction.description.includes("a conto "))
      ) {
        correctedType = "transfer_out";
      }

      return {
        ...transaction,
        transaction_type: correctedType,
        original_type: transaction.transaction_type,
      };
    });

    // Se c'è un filtro per transaction_type, rifiltra con i tipi corretti
    let filteredTransactions = mappedTransactions;
    if (transactionType && transactionType.trim() !== "") {
      filteredTransactions = mappedTransactions.filter(
        (t: any) => t.transaction_type === transactionType
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredTransactions,
      message: "Transazioni recuperate con successo",
      filters: {
        account_id: accountId,
        transaction_type: transactionType,
        date_from: dateFrom,
        date_to: dateTo,
        limit: limitValue,
      },
    });
  } catch (error: any) {
    console.error("Errore GET transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Errore nel recupero transazioni",
      },
      { status: 500 }
    );
  }
}
