import { connectToDatabase } from "@/lib/database";
import { createErrorResponse } from "./api";

export const validateUserAccountOwnership = async (
  accountId: number, 
  userId: number
): Promise<any> => {
  const db = await connectToDatabase();
  
  const [accounts] = (await db.execute(
    "SELECT id, balance FROM accounts WHERE id = ? AND user_id = ?",
    [accountId, userId]
  )) as any[];

  if (accounts.length === 0) {
    throw new Error("Conto non trovato o non autorizzato");
  }

  return accounts[0];
};

export const updateAccountBalance = async (
  accountId: number, 
  newBalance: number
): Promise<void> => {
  const db = await connectToDatabase();
  
  await db.execute(
    "UPDATE accounts SET balance = ? WHERE id = ?",
    [newBalance, accountId]
  );
};

export const createTransaction = async (
  accountId: number,
  amount: number,
  transactionType: string,
  description: string,
  userId: number
): Promise<any> => {
  const db = await connectToDatabase();
  
  const [result] = await db.execute(
    `INSERT INTO transactions 
     (account_id, amount, transaction_type, description, user_id, created_at) 
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [accountId, amount, transactionType, description, userId]
  );

  // Ottieni la transazione appena creata
  const [newTransaction] = (await db.execute(
    "SELECT * FROM transactions WHERE id = ?",
    [(result as any).insertId]
  )) as any[];

  return newTransaction[0];
};