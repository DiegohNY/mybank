import { verifyToken } from '@/lib/jwt';

export class BankingSecurity {
  
  // Controllo autenticazione JWT standard
  static validateAuthToken(token: string): {
    valid: boolean;
    userId?: number;
    error?: string;
  } {
    try {
      if (!token) {
        return { valid: false, error: "Token mancante" };
      }

      const payload = verifyToken(token);
      if (!payload) {
        return { valid: false, error: "Token non valido o scaduto" };
      }

      return { valid: true, userId: payload.userId };
    } catch (error) {
      return { valid: false, error: "Errore validazione token" };
    }
  }

  // Sanitizza input base
  static sanitizeInput(input: any): any {
    if (typeof input === "string") {
      return input
        .replace(/[<>'"%;()&+]/g, "")
        .trim()
        .slice(0, 255);
    }

    if (typeof input === "number") {
      if (isNaN(input) || input < 0) {
        throw new Error("Importo non valido");
      }
      return Math.round(input * 100) / 100;
    }

    return input;
  }

  // Validazione operazioni bancarie semplice
  static validateBankingOperation(operation: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (operation.amount !== undefined) {
      const amount = parseFloat(operation.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push("Importo deve essere positivo");
      }
      if (amount > 50000) {
        errors.push("Importo troppo alto (max €50,000)");
      }
    }

    if (operation.account_id !== undefined) {
      const accountId = parseInt(operation.account_id);
      if (isNaN(accountId) || accountId <= 0) {
        errors.push("ID conto non valido");
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // Controllo proprietà del conto
  static async validateAccountOwnership(
    accountId: number,
    userId: number,
    db: any
  ): Promise<boolean> {
    try {
      const [accounts] = await db.execute(
        "SELECT id FROM accounts WHERE id = ? AND user_id = ?",
        [accountId, userId]
      );
      return accounts.length > 0;
    } catch (error) {
      return false;
    }
  }
}