import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { extractUserIdFromToken } from "@/lib/jwt";

// Forza il rendering dinamico per questa route API
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { from_account_id, to_account_id, amount, description } = body;

    if (!from_account_id || !to_account_id || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Account mittente, destinatario e importo sono obbligatori",
        },
        { status: 400 }
      );
    }

    if (from_account_id === to_account_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Non puoi trasferire sullo stesso conto",
        },
        { status: 400 }
      );
    }

    const importo = parseFloat(amount);
    if (importo <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Importo deve essere positivo",
        },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    try {
      await db.beginTransaction();

      if (importo <= 0) throw new Error("Importo deve essere positivo");
      if (from_account_id === to_account_id)
        throw new Error("Non puoi trasferire sullo stesso conto");

      const [fromAccounts] = (await db.execute(
        "SELECT id, balance FROM accounts WHERE id = ? AND user_id = ?",
        [from_account_id, userId]
      )) as any[];

      if (fromAccounts.length === 0)
        throw new Error("Conto mittente non trovato");

      const fromAccount = fromAccounts[0];
      if (fromAccount.balance < importo) throw new Error("Saldo insufficiente");

      // Verifica conto destinatario (può essere ID numerico o IBAN)
      let toAccountQuery = "SELECT id, balance FROM accounts WHERE id = ?";
      let toAccountParam = to_account_id;

      if (
        typeof to_account_id === "string" &&
        to_account_id.includes("IT60 X054 ")
      ) {
        const accountNumber = to_account_id.replace("IT60 X054 ", "");
        toAccountQuery =
          "SELECT id, balance FROM accounts WHERE account_number = ?";
        toAccountParam = accountNumber;
      } else if (
        typeof to_account_id === "string" &&
        to_account_id.length > 10
      ) {
        const accountNumber = to_account_id.slice(-12);
        toAccountQuery =
          "SELECT id, balance FROM accounts WHERE account_number = ?";
        toAccountParam = accountNumber;
      }

      const [toAccountRows] = (await db.execute(toAccountQuery, [
        toAccountParam,
      ])) as any[];

      if (toAccountRows.length === 0)
        throw new Error("Conto destinatario non trovato");

      const toAccount = toAccountRows[0];
      const actualToAccountId = toAccount.id; // Usa l'ID numerico del database

      const newFromBalance = fromAccount.balance - importo;
      const newToBalance = toAccount.balance + importo;

      // Inserisci transazioni con descrizioni più leggibili
      const [outResult] = (await db.execute(
        "INSERT INTO transactions (account_id, transaction_type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?)",
        [
          from_account_id,
          "withdrawal",
          importo,
          newFromBalance,
          `Bonifico inviato${description ? ": " + description : ""}`,
        ]
      )) as any[];

      const [inResult] = (await db.execute(
        "INSERT INTO transactions (account_id, transaction_type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?)",
        [
          actualToAccountId,
          "deposit",
          importo,
          newToBalance,
          `Bonifico ricevuto${description ? ": " + description : ""}`,
        ]
      )) as any[];

      // Aggiorna i saldi di entrambi i conti
      const updateFromResult = await db.execute(
        "UPDATE accounts SET balance = ? WHERE id = ?",
        [newFromBalance, from_account_id]
      );

      const updateToResult = await db.execute(
        "UPDATE accounts SET balance = ? WHERE id = ?",
        [newToBalance, actualToAccountId]
      );

      // Verifica che gli aggiornamenti siano andati a buon fine
      if (updateFromResult[0].affectedRows === 0) {
        throw new Error("Errore nell'aggiornamento del conto mittente");
      }

      if (updateToResult[0].affectedRows === 0) {
        throw new Error("Errore nell'aggiornamento del conto destinatario");
      }

      await db.commit();

      return NextResponse.json({
        success: true,
        data: {
          from_account: from_account_id,
          to_account: actualToAccountId,
          amount: importo,
          new_from_balance: newFromBalance,
          new_to_balance: newToBalance,
        },
        message: "Trasferimento completato",
      });
    } catch (dbError) {
      // Rollback in caso di errore
      await db.rollback();
      console.log("Errore specifico trasferimento:", dbError);

      const errorMessage =
        dbError instanceof Error ? dbError.message : "Errore nel trasferimento";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log("Errore trasferimento:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Errore nel trasferimento",
      },
      { status: 500 }
    );
  }
}
