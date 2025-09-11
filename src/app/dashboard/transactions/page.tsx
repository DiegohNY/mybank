"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import {
  getTransactionTitle,
  formatTransactionDescription,
  isPositiveTransaction,
} from "@/utils/transaction";
import { checkUserLogin, handleLogout, getUserInitials } from "@/utils/auth";
import { getToken } from "@/utils/localStorage";
import {
  IoArrowUp,
  IoArrowDown,
  IoWallet,
  IoDownload,
  IoClipboard,
  IoRefresh,
  IoSearch,
} from "react-icons/io5";
import { getAccountTypeLabel } from "@/utils/account";
import { getTransactionIcon } from "@/utils/icons";
import { formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";
import { Account, Transazione, Utente } from "@/types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transazione[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userData, setUserData] = useState<Utente | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    account_id: "",
    transaction_type: "",
    date_from: "",
    date_to: "",
  });

  const today = new Date().toISOString().split("T")[0];
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const router = useRouter();

  useEffect(() => {
    const user = checkUserLogin(router);
    if (user) {
      setUserData(user);
      loadAccounts();
      loadTransactions();
    }
  }, [router]);

  const [appliedFilters, setAppliedFilters] = useState({
    account_id: "",
    transaction_type: "",
    date_from: "",
    date_to: "",
  });
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [exportPeriod, setExportPeriod] = useState<string>("month");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [exportAccount, setExportAccount] = useState<string>("");

  useEffect(() => {
    loadTransactions();
  }, [appliedFilters]);

  const applyFilters = () => {
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      account_id: "",
      transaction_type: "",
      date_from: "",
      date_to: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const getExportDateRange = (period: string) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    switch (period) {
      case "month":
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
        return {
          from: startOfMonth.toISOString().split("T")[0],
          to: endOfMonth.toISOString().split("T")[0],
          label: "Mensile",
        };
      case "semester":
        const semesterStart = currentMonth < 6 ? 0 : 6;
        const startOfSemester = new Date(currentYear, semesterStart, 1);
        const endOfSemester = new Date(currentYear, semesterStart + 6, 0);
        return {
          from: startOfSemester.toISOString().split("T")[0],
          to: endOfSemester.toISOString().split("T")[0],
          label: "Semestrale",
        };
      case "year":
        const startOfYear = new Date(selectedYear, 0, 1);
        const endOfYear = new Date(selectedYear, 11, 31);
        return {
          from: startOfYear.toISOString().split("T")[0],
          to: endOfYear.toISOString().split("T")[0],
          label: `Annuale ${selectedYear}`,
        };
      default:
        return {
          from: "",
          to: "",
          label: "Periodo Selezionato",
        };
    }
  };

  const loadAccounts = async () => {
    try {
      const token = getToken();
      const response = await fetch("/api/accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAccounts(data.data);
        }
      }
    } catch (error) {
      console.error("Errore nel caricamento conti:", error);
    }
  };

  const loadTransactions = async () => {
    try {
      const token = getToken();
      const queryParams = new URLSearchParams();

      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/api/transactions?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTransactions(data.data);
        }
      } else {
        console.error("Errore API:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Errore nel caricamento transazioni:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return LoadingSpinner();
  }

  if (!userData) {
    return null;
  }

  const fullName = `${userData.first_name} ${userData.last_name}`;
  const initials = getUserInitials(userData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Header
        type="sub-dashboard"
        userName={fullName}
        userInitials={initials}
        onLogout={() => handleLogout(router)}
      />

      <PageHeader title="Storico Transazioni" subtitle="Storico operazioni" />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Filtri */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg mb-8">
          <h3 className="text-xl font-light text-slate-900 mb-6">
            Filtri di Ricerca
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Conto
              </label>
              <select
                value={filters.account_id}
                onChange={(e) =>
                  setFilters({ ...filters, account_id: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
              >
                <option value="">Tutti i conti</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {getAccountTypeLabel(account.account_type)} - ***
                    {account.account_number.slice(-4)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Tipo Operazione
              </label>
              <select
                value={filters.transaction_type}
                onChange={(e) =>
                  setFilters({ ...filters, transaction_type: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
              >
                <option value="">Tutti i tipi</option>
                <option value="deposit">Depositi</option>
                <option value="withdrawal">Pagamenti</option>
                <option value="transfer_in">Bonifici Ricevuti</option>
                <option value="transfer_out">Bonifici Inviati</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Data Inizio
              </label>
              <input
                type="date"
                value={filters.date_from}
                min={oneYearAgo}
                max={filters.date_to || today}
                onChange={(e) =>
                  setFilters({ ...filters, date_from: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Data Fine
              </label>
              <input
                type="date"
                value={filters.date_to}
                min={filters.date_from || oneYearAgo}
                max={today}
                onChange={(e) =>
                  setFilters({ ...filters, date_to: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Pulsanti di controllo filtri */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={resetFilters}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium flex items-center space-x-2"
              title="Reset filtri"
            >
              <IoRefresh className="w-4 h-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={applyFilters}
              className="px-6 py-3 bg-primary-navy hover:bg-primary-navy/90 text-white rounded-xl transition-colors font-medium flex items-center space-x-2"
              title="Applica filtri"
            >
              <IoSearch className="w-4 h-4" />
              <span>Cerca</span>
            </button>
          </div>
        </div>

        {/* Lista Transazioni */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
          <div className="p-8 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-light text-slate-900 mb-1">
                  Attività Recente
                </h3>
                <p className="text-slate-600">
                  {transactions.length} movimenti trovati
                </p>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-xs text-slate-600 font-medium">
                  Aggiornato in tempo reale
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="group hover:bg-slate-50/50 transition-all duration-200"
                >
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {getTransactionTitle(
                            transaction.transaction_type,
                            transaction.description
                          )}
                        </h4>
                        <div className="flex items-center space-x-3">
                          <p className="text-sm text-slate-500">
                            {formatDate(transaction.created_at)}
                          </p>
                          {formatTransactionDescription(
                            transaction.description
                          ) && (
                            <>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <p className="text-sm text-slate-600">
                                {formatTransactionDescription(
                                  transaction.description
                                )}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-xl font-light mb-1 ${
                          isPositiveTransaction(transaction.transaction_type)
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {isPositiveTransaction(transaction.transaction_type)
                          ? "+"
                          : "-"}
                        {formatCurrency(
                          parseFloat(transaction.amount.toString())
                        )}
                      </p>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="text-xs text-slate-500 hover:text-slate-700">
                          Dettagli →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <IoClipboard className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-light text-slate-900 mb-2">
                  Nessuna transazione trovata
                </h3>
                <p className="text-slate-600 mb-6">
                  Modifica i filtri di ricerca per visualizzare altre
                  transazioni
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
