import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { extractUserIdFromToken } from "@/utils/auth";

// GET - Dettagli di un account specifico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: "Token mancante",
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const userId = extractUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Token non valido",
        },
        { status: 401 }
      );
    }

    const accountId = params.id;

    // Controllo semplice che sia un numero
    if (!accountId || isNaN(Number(accountId))) {
      return NextResponse.json(
        {
          success: false,
          error: "ID account non valido",
        },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Prendo dettagli completi dell'account (controllo proprietà)
    const [accounts] = (await db.execute(
      "SELECT id, account_number, account_type, balance, status, created_at FROM accounts WHERE id = ? AND user_id = ?",
      [accountId, userId]
    )) as any[];

    if (accounts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Conto non trovato",
        },
        { status: 404 }
      );
    }

    const account = accounts[0];

    // Statistiche aggiuntive: conteggio transazioni e ultima transazione
    const [transactionStats] = (await db.execute(
      "SELECT COUNT(*) as transaction_count, MAX(created_at) as last_transaction_date FROM transactions WHERE account_id = ?",
      [accountId]
    )) as any[];

    // Statistiche mensili: entrate e uscite del mese corrente
    const [monthlyStats] = (await db.execute(`
      SELECT 
        SUM(CASE WHEN transaction_type IN ('deposit', 'transfer_in') THEN amount ELSE 0 END) as monthly_income,
        SUM(CASE WHEN transaction_type IN ('withdrawal', 'transfer_out') THEN amount ELSE 0 END) as monthly_expenses,
        COUNT(*) as monthly_transactions
      FROM transactions 
      WHERE account_id = ? 
        AND YEAR(created_at) = YEAR(CURRENT_DATE()) 
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `, [accountId])) as any[];

    // Combina tutti i dati
    const enrichedAccount = {
      ...account,
      statistics: {
        transaction_count: transactionStats[0]?.transaction_count || 0,
        last_transaction_date: transactionStats[0]?.last_transaction_date,
        monthly_income: parseFloat(monthlyStats[0]?.monthly_income || 0),
        monthly_expenses: parseFloat(monthlyStats[0]?.monthly_expenses || 0),
        monthly_transactions: monthlyStats[0]?.monthly_transactions || 0,
      }
    };

    return NextResponse.json({
      success: true,
      data: enrichedAccount,
    });
  } catch (error) {
    console.log("Errore GET account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Errore nel recupero conto",
      },
      { status: 500 }
    );
  }
}
