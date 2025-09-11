"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getTransactionTitle,
  formatTransactionDescription,
  isPositiveTransaction,
} from "@/utils/transaction";
import { getToken } from "@/utils/localStorage";
import {
  IoCash,
  IoTrendingUp,
  IoTrendingDown,
  IoCard,
  IoSwapHorizontal,
  IoDocument,
  IoBarChart,
  IoChevronForward,
  IoAdd,
} from "react-icons/io5";
import { formatCurrency } from "@/utils/currency";
import { getAccountTypeLabel } from "@/utils/account";
import { getTransactionIcon } from "@/utils/icons";
import { formatDate } from "@/utils/date";
import { checkUserLogin, handleLogout, getUserInitials } from "@/utils/auth";
import { calculateTotalBalance, calculateMonthlyIncome, calculateMonthlyExpenses } from "@/utils/financial";
import { Account, Transazione, Utente } from "@/types";

export default function DashboardPage() {
  const [userData, setUserData] = useState<Utente | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transazione[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const user = checkUserLogin(router);
    if (user) {
      setUserData(user);
    }
  }, [router]);

  useEffect(() => {
    if (userData) {
      loadUserAccounts();
      loadRecentTransactions();
    }
  }, [userData]);

  const loadUserAccounts = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const token = getToken();
      const response = await fetch("/api/transactions?limit=5", {
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
      }
    } catch (error) {
      console.error("Errore nel caricamento transazioni:", error);
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
        type="dashboard"
        userName={fullName}
        userInitials={initials}
        onLogout={() => handleLogout(router)}
      />

      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Panoramica Finanziaria */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Card Patrimonio Totale */}
            <div className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/60 shadow-banking hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-navy/10 to-primary-teal/10 rounded-2xl flex items-center justify-center">
                    <IoCash className="w-7 h-7 text-primary-navy" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-light text-slate-900 mb-1">
                    Patrimonio Totale
                  </h3>
                  <p className="text-3xl font-light text-slate-900 mb-2">
                    {formatCurrency(calculateTotalBalance(accounts))}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-sm text-slate-600">
                      {accounts.length}{" "}
                      {accounts.length === 1
                        ? "prodotto attivo"
                        : "prodotti attivi"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Entrate Mensili */}
            <div className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/60 shadow-banking hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 11l5-5m0 0l5 5m-5-5v12"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-light text-slate-900 mb-1">
                    Entrate Mensili
                  </h3>
                  <p className="text-3xl font-light text-emerald-600 mb-2">
                    +{formatCurrency(calculateMonthlyIncome(transactions))}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-sm text-slate-600">
                      {
                        transactions.filter((t) =>
                          isPositiveTransaction(t.transaction_type)
                        ).length
                      }{" "}
                      accrediti
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Uscite Mensili */}
            <div className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/60 shadow-banking hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl flex items-center justify-center">
                    <IoTrendingDown className="w-7 h-7 text-red-600" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-light text-slate-900 mb-1">
                    Uscite Mensili
                  </h3>
                  <p className="text-3xl font-light text-red-600 mb-2">
                    -{formatCurrency(calculateMonthlyExpenses(transactions))}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-sm text-slate-600">
                      {
                        transactions.filter(
                          (t) => !isPositiveTransaction(t.transaction_type)
                        ).length
                      }{" "}
                      operazioni
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Centro Operazioni Raffinato */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl font-light text-slate-900 mb-2">
                Operazioni
              </h2>
              <p className="text-slate-600">Gestisci il tuo conto</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Gestione Conti */}
              <button
                onClick={() => router.push("/dashboard/accounts")}
                className="group relative p-8 text-center border border-slate-200/60 rounded-2xl hover:border-primary-navy/30 hover:shadow-banking transition-all duration-300 hover:-translate-y-1 bg-white/50 hover:bg-white/80"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-navy/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-navy/10 to-primary-teal/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <IoCard className="w-8 h-8 text-primary-navy group-hover:text-primary-teal transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">
                    Gestione Conti
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Amministra i tuoi prodotti bancari
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-6 h-6 bg-primary-navy/10 rounded-full flex items-center justify-center">
                    <IoChevronForward className="w-3 h-3 text-primary-navy" />
                  </div>
                </div>
              </button>

              {/* Operazioni */}
              <button
                onClick={() => router.push("/dashboard/operations")}
                className="group relative p-8 text-center border border-slate-200/60 rounded-2xl hover:border-primary-teal/30 hover:shadow-banking transition-all duration-300 hover:-translate-y-1 bg-white/50 hover:bg-white/80"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-teal/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-teal/10 to-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <IoSwapHorizontal className="w-8 h-8 text-primary-teal group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">
                    Operazioni
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Bonifici e trasferimenti istantanei
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-6 h-6 bg-primary-teal/10 rounded-full flex items-center justify-center">
                    <IoChevronForward className="w-3 h-3 text-primary-teal" />
                  </div>
                </div>
              </button>

              {/* Storico */}
              <button
                onClick={() => router.push("/dashboard/transactions")}
                className="group relative p-8 text-center border border-slate-200/60 rounded-2xl hover:border-secondary-gold/30 hover:shadow-banking transition-all duration-300 hover:-translate-y-1 bg-white/50 hover:bg-white/80"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-gold/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary-gold/10 to-amber-500/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <IoDocument className="w-8 h-8 text-secondary-gold group-hover:text-amber-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">
                    Storico
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Storico movimenti
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-6 h-6 bg-secondary-gold/10 rounded-full flex items-center justify-center">
                    <IoChevronForward className="w-3 h-3 text-secondary-gold" />
                  </div>
                </div>
              </button>

              {/* Analisi */}
              <button
                onClick={() => router.push("/dashboard/analytics")}
                className="group relative p-8 text-center border border-slate-200/60 rounded-2xl hover:border-emerald-500/30 hover:shadow-banking transition-all duration-300 hover:-translate-y-1 bg-white/50 hover:bg-white/80"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <IoBarChart className="w-8 h-8 text-emerald-600 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">
                    Analisi
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Report e statistiche avanzate
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <IoChevronForward className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* I Miei Conti */}
          <section>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-light text-slate-900 mb-1">
                    I Tuoi Prodotti
                  </h2>
                  <p className="text-slate-600 text-sm">I tuoi conti</p>
                </div>
                <button
                  onClick={() => router.push("/dashboard/accounts")}
                  className="group flex items-center space-x-2 px-4 py-2 text-primary-navy hover:bg-primary-navy/5 rounded-xl transition-all duration-200"
                >
                  <span className="font-medium text-sm">Gestisci</span>
                  <IoChevronForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="space-y-6">
                {accounts.length > 0 ? (
                  accounts.map((account, index) => (
                    <div key={account.id} className="group">
                      <div className="relative p-6 bg-gradient-to-r from-slate-50/50 to-white/50 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-navy/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary-navy/10 to-primary-teal/10 rounded-2xl flex items-center justify-center">
                              <IoCard className="w-7 h-7 text-primary-navy" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 text-lg">
                                {getAccountTypeLabel(account.account_type)}
                              </h3>
                              <p className="text-sm text-slate-500 font-mono tracking-wider">
                                IT60 **** **** *****
                                {account.account_number.slice(-4)}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-xs text-slate-600 font-medium">
                                  {account.status === "active"
                                    ? "Operativo"
                                    : account.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-light text-slate-900 mb-1">
                              {account.balance !== undefined
                                ? formatCurrency(account.balance)
                                : "Caricamento..."}
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  router.push("/dashboard/accounts")
                                }
                                className="text-xs px-3 py-1 bg-primary-navy/10 text-primary-navy rounded-full hover:bg-primary-navy/20 transition-colors"
                              >
                                Gestisci
                              </button>
                              <button
                                onClick={() =>
                                  router.push(`/dashboard/transactions`)
                                }
                                className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                              >
                                Movimenti
                              </button>
                              <button
                                onClick={() =>
                                  router.push("/dashboard/operations")
                                }
                                className="text-xs px-3 py-1 bg-secondary-gold/10 text-secondary-gold rounded-full hover:bg-secondary-gold/20 transition-colors"
                              >
                                Bonifico
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <IoAdd className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-slate-600 mb-6 text-lg">
                      Nessun prodotto attivo
                    </p>
                    <button
                      onClick={() => router.push("/dashboard/accounts")}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-navy to-primary-teal text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <span className="font-medium">
                        Apri il tuo primo conto
                      </span>
                      <IoChevronForward className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Transazioni Recenti Evolute */}
          <section>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-light text-slate-900 mb-1">
                    Attività Recente
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Ultimi movimenti del conto
                  </p>
                </div>
                <button
                  onClick={() => router.push("/dashboard/transactions")}
                  className="group flex items-center space-x-2 px-4 py-2 text-primary-navy hover:bg-primary-navy/5 rounded-xl transition-all duration-200"
                >
                  <span className="font-medium text-sm">Vedi Tutto</span>
                  <IoChevronForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className="group hover:bg-slate-50/50 -mx-4 px-4 py-4 rounded-2xl transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getTransactionIcon(transaction.transaction_type)}
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {getTransactionTitle(
                                transaction.transaction_type,
                                transaction.description
                              )}
                            </h3>
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
                            className={`text-xl font-light ${
                              isPositiveTransaction(
                                transaction.transaction_type
                              )
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
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1">
                            <button className="text-xs text-slate-500 hover:text-slate-700">
                              Dettagli →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-600 text-lg">
                      Nessuna transazione recente
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      Le tue operazioni appariranno qui
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
