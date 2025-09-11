import { Account, Transazione } from "@/types";

export const calculateTotalBalance = (accounts: Account[]): number => {
  return accounts.reduce((total, account) => {
    const balance = account.balance;
    if (typeof balance === 'number') return total + balance;
    if (typeof balance === 'string') return total + (parseFloat(balance) || 0);
    return total;
  }, 0);
};

export const calculateMonthlyIncome = (transactions: Transazione[]): number => {
  return transactions
    .filter(t => ['deposit', 'transfer_in'].includes(t.transaction_type))
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
};

export const calculateMonthlyExpenses = (transactions: Transazione[]): number => {
  return transactions
    .filter(t => ['withdrawal', 'transfer_out'].includes(t.transaction_type))
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
};