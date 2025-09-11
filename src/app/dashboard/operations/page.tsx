"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { Account, Utente } from "@/types";
import { formatCurrency } from "@/utils/currency";
import { getAccountTypeLabel } from "@/utils/account";
import { checkUserLogin, handleLogout, getUserInitials } from "@/utils/auth";
import { getToken } from "@/utils/localStorage";
import {
  validateOperationForm,
  validateBalance,
  executeTransfer,
  executeDepositWithdrawal,
} from "@/utils/operations";
import {
  IoAdd,
  IoArrowForward,
  IoSwapHorizontal,
  IoCheckmark,
  IoClose,
} from "react-icons/io5";

export default function OperationsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userData, setUserData] = useState<Utente | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<string>("");
  const [formData, setFormData] = useState({
    account_id: "",
    amount: "",
    description: "",
    recipient_account: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    const user = checkUserLogin(router);
    if (user) {
      setUserData(user);
      loadAccounts();
    }
    loadAccounts();
  }, []);

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
    } finally {
      setInitialLoading(false);
    }
  };

  const handleOperation = async () => {
    setErrorMessage("");

    try {
      const { amount, selectedAccount } = validateOperationForm(
        selectedOperation,
        formData,
        accounts
      );

      validateBalance(
        selectedOperation,
        amount,
        selectedAccount,
        formData.recipient_account
      );

      setLoading(true);

      let result;
      if (selectedOperation === "transfer_out") {
        result = await executeTransfer(formData, amount);
      } else {
        result = await executeDepositWithdrawal(
          selectedOperation,
          formData,
          amount
        );
      }

      if (result.success) {
        setFormData({
          account_id: "",
          amount: "",
          description: "",
          recipient_account: "",
        });
        setSelectedOperation("");
        alert(result.message || "Operazione completata");
        await loadAccounts();
        router.push("/dashboard");
      } else {
        setErrorMessage(result.error || "Errore nell'operazione");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  const operations = [
    {
      value: "deposit",
      label: "Deposito",
      description: "Aggiungi denaro al tuo conto",
      icon: <IoAdd className="w-6 h-6" />,
      color: "emerald",
    },
    {
      value: "withdrawal",
      label: "Prelievo",
      description: "Preleva denaro dal tuo conto",
      icon: <IoArrowForward className="w-6 h-6" />,
      color: "red",
    },
    {
      value: "transfer_out",
      label: "Bonifico",
      description: "Trasferisci denaro ad altro conto",
      icon: <IoSwapHorizontal className="w-6 h-6" />,
      color: "blue",
    },
  ];

  if (initialLoading) {
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

      <PageHeader
        title="Operazioni Bancarie"
        subtitle="Bonifici e trasferimenti istantanei"
      />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Selezione Operazione */}
        <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-lg mb-8">
          <h3 className="text-xl font-light text-slate-900 mb-8">
            Tipologie di Operazione
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {operations.map((operation) => (
              <button
                key={operation.value}
                onClick={() => {
                  setSelectedOperation(operation.value);
                  setErrorMessage(""); // pulisci errori quando cambi operazione
                }}
                className={`group relative p-8 text-center border rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                  selectedOperation === operation.value
                    ? "border-primary-navy/30 bg-primary-navy/5 shadow-banking"
                    : "border-slate-200/60 hover:border-slate-300 hover:shadow-lg bg-white/50"
                }`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    operation.color === "emerald"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : operation.color === "red"
                      ? "bg-red-500/10 text-red-600"
                      : "bg-blue-500/10 text-blue-600"
                  } ${
                    selectedOperation === operation.value
                      ? "scale-105"
                      : "group-hover:scale-105"
                  }`}
                >
                  {operation.icon}
                </div>

                <h4 className="font-semibold text-slate-900 mb-2 text-lg">
                  {operation.label}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {operation.description}
                </p>

                {selectedOperation === operation.value && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-primary-navy rounded-full flex items-center justify-center">
                      <IoCheckmark className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Operazione */}
        {selectedOperation && (
          <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-light text-slate-900 mb-1">
                  {
                    operations.find((op) => op.value === selectedOperation)
                      ?.label
                  }
                </h3>
                <p className="text-slate-600">
                  Completa i dettagli dell'operazione
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedOperation("");
                  setErrorMessage(""); // pulisci errori quando chiudi
                }}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>

            {/* Messaggio di errore */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Conto *
                </label>
                <select
                  value={formData.account_id}
                  onChange={(e) => {
                    setFormData({ ...formData, account_id: e.target.value });
                    setErrorMessage(""); // pulisci errori quando cambi valore
                  }}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
                >
                  <option value="">Seleziona conto</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {getAccountTypeLabel(account.account_type)} - ***
                      {account.account_number.slice(-4)}(
                      {account.balance !== undefined
                        ? formatCurrency(account.balance)
                        : "N/A"}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Importo * (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    setErrorMessage(""); // pulisci errori quando cambi importo
                  }}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Descrizione
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
                  placeholder="Descrizione dell'operazione"
                />
              </div>

              {selectedOperation === "transfer_out" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    IBAN Destinatario *
                  </label>
                  <div className="mb-2 text-xs text-gray-500">
                    💡 Esempio IBAN: IT60 X054 2811 1010 0000 0123 456
                  </div>
                  <input
                    type="text"
                    value={formData.recipient_account}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        recipient_account: e.target.value,
                      });
                      setErrorMessage(""); // pulisci errori quando cambi IBAN
                    }}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
                    placeholder="IT60 X054 2811 1010 0000 0123 456"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setSelectedOperation("")}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-medium"
              >
                Annulla
              </button>
              <button
                onClick={handleOperation}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-primary-navy to-primary-teal text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Elaborazione..." : "Conferma Operazione"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
