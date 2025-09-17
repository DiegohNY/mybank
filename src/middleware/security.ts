import { verifyToken } from "@/lib/jwt";

interface RateLimitData {
  attempts: number;
  firstAttempt: number;
}

export class BankingSecurity {
  private static rateLimitStore: Map<string, RateLimitData> = new Map();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minuti

  // Rate limiting semplice per proteggere da attacchi brute force
  static checkRateLimit(identifier: string): {
    allowed: boolean;
    error?: string;
  } {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;

    let rateLimitData = this.rateLimitStore.get(key);

    if (!rateLimitData || now - rateLimitData.firstAttempt > this.WINDOW_MS) {
      rateLimitData = {
        attempts: 1,
        firstAttempt: now,
      };
      this.rateLimitStore.set(key, rateLimitData);
      return { allowed: true };
    }

    rateLimitData.attempts++;
    this.rateLimitStore.set(key, rateLimitData);

    if (rateLimitData.attempts > this.MAX_ATTEMPTS) {
      return {
        allowed: false,
        error: "Troppi tentativi falliti. Riprova tra qualche minuto",
      };
    }

    return { allowed: true };
  }

  // Reset del rate limit in caso di login riuscito
  static resetRateLimit(identifier: string): void {
    const key = `rate_limit_${identifier}`;
    this.rateLimitStore.delete(key);
  }

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
      return parseFloat(input.toFixed(2));
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
