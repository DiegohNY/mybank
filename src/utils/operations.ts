import { Account } from "@/types";
import {
  validateAmount,
  validateRequired,
  sanitizeInput,
} from "@/utils/validation";
import { formatCurrency } from "@/utils/currency";
import { getToken } from "@/utils/localStorage";

interface FormData {
  account_id: string;
  amount: string;
  description: string;
  recipient_account: string;
}

interface OperationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const validateOperationForm = (
  selectedOperation: string,
  formData: FormData,
  accounts: Account[]
): { amount: number; selectedAccount: Account } => {
  validateRequired(selectedOperation, "Tipo operazione");
  validateRequired(formData.account_id, "Conto");
  validateRequired(formData.amount, "Importo");

  const amount = validateAmount(formData.amount);
  const selectedAccount = accounts.find(
    (acc) => acc.id === parseInt(formData.account_id)
  );

  if (!selectedAccount) {
    throw new Error("Conto non trovato");
  }

  return { amount, selectedAccount };
};

export const validateBalance = (
  operation: string,
  amount: number,
  account: Account,
  recipientAccount?: string
): void => {
  const balance = account.balance || 0;

  if (
    (operation === "withdrawal" || operation === "transfer_out") &&
    amount > balance
  ) {
    throw new Error(
      `Saldo insufficiente. Disponibile: ${formatCurrency(balance)}`
    );
  }

  if (operation === "transfer_out" && !recipientAccount?.trim()) {
    throw new Error("Inserisci l'IBAN del destinatario");
  }
};

export const executeTransfer = async (
  formData: FormData,
  amount: number
): Promise<OperationResult> => {
  const token = getToken();
  const response = await fetch("/api/transactions/transfer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from_account_id: parseInt(formData.account_id),
      to_account_id: formData.recipient_account,
      amount: amount,
      description: formData.description
        ? sanitizeInput(formData.description)
        : "Bonifico",
    }),
  });

  const data = await response.json();

  if (response.ok && data.success) {
    return { success: true, message: data.message };
  } else {
    return { success: false, error: data.error || "Errore nel bonifico" };
  }
};

export const executeDepositWithdrawal = async (
  operation: string,
  formData: FormData,
  amount: number
): Promise<OperationResult> => {
  const token = getToken();
  const endpoint =
    operation === "deposit"
      ? "/api/transactions/deposit"
      : "/api/transactions/withdrawal";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_id: parseInt(formData.account_id),
      amount: amount,
      description: formData.description
        ? sanitizeInput(formData.description)
        : operation === "deposit"
        ? "Deposito"
        : "Prelievo",
    }),
  });

  const data = await response.json();

  if (response.ok && data.success) {
    return { success: true, message: data.message };
  } else {
    return { success: false, error: data.error || `Errore nel ${operation}` };
  }
};
