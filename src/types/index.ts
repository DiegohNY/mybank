export interface Transazione {
  id: number;
  account_id: number;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
}

// Account base con informazioni essenziali per la lista
export interface Account {
  id: number;
  account_number: string;
  account_type: string;
  status: string;
  created_at: string;
  balance?: number;
}

// Account completo con dettagli e statistiche (da /api/accounts/[id])
export interface AccountDetails extends Account {
  balance: number;
  user_id?: number;
  statistics?: {
    transaction_count: number;
    last_transaction_date?: string;
    monthly_income: number;
    monthly_expenses: number;
    monthly_transactions: number;
  };
}

export interface Utente {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}
