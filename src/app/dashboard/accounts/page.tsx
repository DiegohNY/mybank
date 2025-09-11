"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { checkUserLogin, handleLogout, getUserInitials } from "@/utils/auth";
import { formatCurrency } from "@/utils/currency";
import { getAccountTypeLabel } from "@/utils/account";
import { apiRequest } from "@/utils/api";
import {
  IoAdd,
  IoCard,
  IoCheckmarkCircle,
  IoClose,
  IoEye,
  IoSettings,
  IoCopy,
  IoTime,
  IoCheckmark,
  IoAlert,
  IoBarChart,
} from "react-icons/io5";
import { IoSync } from "react-icons/io5";
import { Account, AccountDetails, Utente } from "@/types";

export default function AccountsPage() {
  // Lista basilare degli accounts (da /api/accounts)
  const [accounts, setAccounts] = useState<Account[]>([]);
  // Dettagli completi per ID specifico (da /api/accounts/[id])
  const [accountDetails, setAccountDetails] = useState<
    Record<number, AccountDetails>
  >({});
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>(
    {}
  );

  const [userData, setUserData] = useState<Utente | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccountType, setNewAccountType] = useState("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  const router = useRouter();

  useEffect(() => {
    const user = checkUserLogin(router);
    if (user) {
      setUserData(user);
      loadAccountsList();
    }
  }, [router]);

  // Carica solo le informazioni basilari dei conti
  const loadAccountsList = async () => {
    try {
      const data = await apiRequest("/api/accounts");
      if (data.success && data.data) {
        setAccounts(data.data);
      }
    } catch (error) {
      console.error("Errore nel caricamento lista conti:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carica i dettagli completi di un conto specifico
  const loadAccountDetails = async (accountId: number) => {
    // Evita chiamate duplicate se i dettagli sono già stati caricati
    if (accountDetails[accountId] || loadingDetails[accountId]) {
      return;
    }

    // Imposta loading state per questo specifico account
    setLoadingDetails((prev) => ({ ...prev, [accountId]: true }));

    try {
      const data = await apiRequest(`/api/accounts/${accountId}`);
      if (data.success && data.data) {
        setAccountDetails((prev) => ({
          ...prev,
          [accountId]: data.data,
        }));
      }
    } catch (error) {
      console.error(
        `Errore nel caricamento dettagli account ${accountId}:`,
        error
      );
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [accountId]: false }));
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setErrorMessage("");
    setNewAccountType("checking");
    setCreatingAccount(false);
  };

  const createAccount = async () => {
    if (creatingAccount) return; // Previene doppi click

    setErrorMessage("");
    setCreatingAccount(true);

    try {
      const data = await apiRequest("/api/accounts", {
        method: "POST",
        body: JSON.stringify({
          account_type: newAccountType,
        }),
      });

      if (data.success) {
        resetForm(); // Reset tutto il form
        loadAccountsList();
      } else {
        setErrorMessage(data.error || "Errore nella creazione del conto");
      }
    } catch (error) {
      console.error("Errore nella creazione del conto:", error);
      setErrorMessage("Errore di connessione");
    } finally {
      setCreatingAccount(false);
    }
  };

  const openDetailsModal = async (account: Account) => {
    setSelectedAccount(account);
    setShowDetailsModal(true);

    // Carica i dettagli del conto se non sono già stati caricati
    await loadAccountDetails(account.id);
  };

  const openManageModal = (account: Account) => {
    setSelectedAccount(account);
    setShowManageModal(true);
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowManageModal(false);
    setSelectedAccount(null);
    setCopySuccess("");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess("Copiato!");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      console.error("Errore nella copia:", err);
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "checking":
        return "Conto Corrente";
      case "savings":
        return "Conto Risparmio";
      case "investment":
        return "Conto Investimenti";
      default:
        return type;
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

      <PageHeader
        title="Gestione Conti"
        subtitle="Amministra i tuoi prodotti bancari"
        actions={
          <button
            onClick={() => setShowCreateForm(true)}
            className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-navy to-primary-teal text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <IoAdd className="w-5 h-5" />
            <span className="font-medium">Nuovo Conto</span>
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Form Creazione Conto */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg mb-8">
            <h3 className="text-xl font-light text-slate-900 mb-6">
              Crea Nuovo Conto
            </h3>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Tipo di Conto
                </label>
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  disabled={creatingAccount}
                  className={`w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all ${
                    creatingAccount
                      ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                      : "bg-white"
                  }`}
                >
                  <option value="checking">Conto Corrente</option>
                  <option value="savings">Conto Risparmio</option>
                </select>
              </div>
              <div className="flex items-end space-x-3">
                <button
                  onClick={createAccount}
                  disabled={creatingAccount}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                    creatingAccount
                      ? "bg-slate-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-primary-navy to-primary-teal text-white hover:shadow-lg"
                  }`}
                >
                  {creatingAccount && (
                    <IoSync className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  )}
                  <span>{creatingAccount ? "Creando..." : "Crea Conto"}</span>
                </button>
                <button
                  onClick={() => resetForm()}
                  disabled={creatingAccount}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    creatingAccount
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista Conti */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accounts.map((account) => (
            <div key={account.id} className="group">
              <div className="relative p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-navy/10 to-primary-teal/10 rounded-2xl flex items-center justify-center">
                    <IoCard className="w-7 h-7 text-primary-navy" />
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      account.status === "active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          account.status === "active"
                            ? "bg-emerald-400"
                            : "bg-slate-400"
                        }`}
                      ></div>
                      <span>
                        {account.status === "active" ? "Operativo" : "Inattivo"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {getAccountTypeLabel(account.account_type)}
                  </h3>
                  <p className="text-sm text-slate-500 font-mono tracking-wider">
                    IT60 **** **** *****{account.account_number.slice(-4)}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-slate-600 mb-2">
                    {getAccountTypeLabel(account.account_type)}
                  </p>
                  <p className="text-lg font-mono text-slate-900 mb-1">
                    IT60 X054 {account.account_number}
                  </p>
                  <p className="text-xs text-slate-500">
                    Creato il{" "}
                    {new Date(account.created_at).toLocaleDateString("it-IT")}
                  </p>
                  <div className="mt-3 flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        account.status === "active"
                          ? "bg-emerald-400"
                          : "bg-red-400"
                      }`}
                    ></div>
                    <span
                      className={`text-xs font-medium ${
                        account.status === "active"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {account.status === "active" ? "Operativo" : "Inattivo"}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => openDetailsModal(account)}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                  >
                    <IoEye className="w-4 h-4" />
                    <span>Dettagli</span>
                  </button>
                  <button
                    onClick={() => openManageModal(account)}
                    className="flex-1 px-4 py-2 bg-primary-navy/10 text-primary-navy rounded-xl hover:bg-primary-navy/20 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                  >
                    <IoSettings className="w-4 h-4" />
                    <span>Gestisci</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
              <IoAdd className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-light text-slate-900 mb-2">
              Nessun prodotto attivo
            </h3>
            <p className="text-slate-600 mb-8">
              Apri il tuo primo conto per iniziare
            </p>
          </div>
        )}
      </main>

      {/* Modal Dettagli Account */}
      {showDetailsModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-light text-slate-900">
                  Dettagli Conto
                </h2>
                <p className="text-slate-600">
                  {getAccountTypeLabel(selectedAccount.account_type)}
                </p>
              </div>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <IoClose className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Loading indicator se i dettagli stanno caricando */}
            {loadingDetails[selectedAccount.id] && (
              <div className="flex items-center justify-center py-12">
                <IoSync className="w-8 h-8 text-primary-navy animate-spin" />
                <span className="ml-3 text-slate-600">
                  Caricamento dettagli...
                </span>
              </div>
            )}

            {/* Contenuto solo se i dettagli non stanno caricando */}
            {!loadingDetails[selectedAccount.id] && (
              <div className="space-y-6">
                {/* Informazioni Base */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                    <IoCard className="w-5 h-5 mr-2 text-primary-navy" />
                    Informazioni Account
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">
                        Numero Conto
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-mono text-slate-900">
                          IT60 X054 {selectedAccount.account_number}
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `IT60 X054 ${selectedAccount.account_number}`
                            )
                          }
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <IoCopy className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">
                        Tipo Conto
                      </label>
                      <p className="text-slate-900 mt-1">
                        {getAccountTypeLabel(selectedAccount.account_type)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Stato</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            selectedAccount.status === "active"
                              ? "bg-emerald-400"
                              : "bg-red-400"
                          }`}
                        ></div>
                        <span
                          className={`text-sm font-medium ${
                            selectedAccount.status === "active"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {selectedAccount.status === "active"
                            ? "Operativo"
                            : "Inattivo"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">
                        Data Apertura
                      </label>
                      <p className="text-slate-900 mt-1">
                        {new Date(
                          selectedAccount.created_at
                        ).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Saldo - Solo se i dettagli sono stati caricati */}
                {accountDetails[selectedAccount.id] ? (
                  <>
                    <div className="bg-gradient-to-br from-primary-navy/5 to-primary-teal/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-slate-900 mb-2">
                        Saldo Disponibile
                      </h3>
                      <p className="text-4xl font-light text-slate-900 mb-2">
                        {formatCurrency(
                          accountDetails[selectedAccount.id].balance
                        )}
                      </p>
                      <p className="text-sm text-slate-600">
                        Ultimo aggiornamento:{" "}
                        {new Date().toLocaleDateString("it-IT")}
                      </p>
                    </div>

                    {/* Statistiche Aggiuntive */}
                    {accountDetails[selectedAccount.id]?.statistics && (
                      <div className="bg-slate-50 rounded-2xl p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                          <IoBarChart className="w-5 h-5 mr-2 text-primary-navy" />
                          Statistiche
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-light text-slate-900">
                              {accountDetails[selectedAccount.id]?.statistics
                                ?.transaction_count || 0}
                            </p>
                            <p className="text-sm text-slate-600">
                              Transazioni Totali
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-light text-emerald-600">
                              +
                              {formatCurrency(
                                accountDetails[selectedAccount.id]?.statistics
                                  ?.monthly_income || 0
                              )}
                            </p>
                            <p className="text-sm text-slate-600">
                              Entrate Mensili
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-light text-red-500">
                              -
                              {formatCurrency(
                                accountDetails[selectedAccount.id]?.statistics
                                  ?.monthly_expenses || 0
                              )}
                            </p>
                            <p className="text-sm text-slate-600">
                              Uscite Mensili
                            </p>
                          </div>
                        </div>
                        {accountDetails[selectedAccount.id]?.statistics
                          ?.last_transaction_date && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-sm text-slate-600">
                              Ultima transazione:{" "}
                              {(() => {
                                const lastDate =
                                  accountDetails[selectedAccount.id]?.statistics
                                    ?.last_transaction_date;
                                return lastDate
                                  ? new Date(lastDate).toLocaleDateString(
                                      "it-IT"
                                    )
                                  : "N/A";
                              })()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-gradient-to-br from-primary-navy/5 to-primary-teal/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Saldo Disponibile
                    </h3>
                    {selectedAccount.balance !== undefined ? (
                      <p className="text-4xl font-light text-slate-900 mb-2">
                        {formatCurrency(selectedAccount.balance)}
                      </p>
                    ) : (
                      <p className="text-slate-600 text-center py-8">
                        Dettagli del saldo in caricamento...
                      </p>
                    )}
                    <p className="text-sm text-slate-600">
                      {selectedAccount.balance !== undefined
                        ? `Ultimo aggiornamento: ${new Date().toLocaleDateString(
                            "it-IT"
                          )}`
                        : "Caricamento statistiche avanzate..."}
                    </p>
                  </div>
                )}

                {/* Informazioni Aggiuntive */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                    <IoAlert className="w-5 h-5 mr-2 text-secondary-gold" />
                    Note Importanti
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Le operazioni sono disponibili 24/7</li>
                    <li>• Commissioni bonifici: €0,00 per bonifici SEPA</li>
                    <li>• Estratto conto mensile disponibile online</li>
                    <li>
                      • Supporto clienti disponibile dal lunedì al venerdì
                    </li>
                  </ul>
                </div>

                {copySuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-emerald-700">
                      <IoCheckmark className="w-5 h-5" />
                      <span className="font-medium">{copySuccess}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Gestisci Account */}
      {showManageModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-light text-slate-900">
                  Gestisci Conto
                </h2>
                <p className="text-slate-600">
                  {getAccountTypeLabel(selectedAccount.account_type)}
                </p>
              </div>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <IoClose className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Azioni Rapide */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                  <IoSettings className="w-5 h-5 mr-2 text-primary-navy" />
                  Azioni Rapide
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push("/dashboard/operations")}
                    className="p-6 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-teal/10 rounded-full flex items-center justify-center">
                        <IoCard className="w-6 h-6 text-primary-teal" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">
                          Operazioni
                        </h4>
                        <p className="text-sm text-slate-600">
                          Versamenti, prelievi e bonifici
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/dashboard/transactions")}
                    className="p-6 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-500/10 rounded-full flex items-center justify-center">
                        <IoEye className="w-6 h-6 text-slate-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">
                          Movimenti
                        </h4>
                        <p className="text-sm text-slate-600">
                          Cronologia e estratto conto
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Info Supporto */}
              <div className="bg-primary-navy/5 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Hai bisogno di aiuto?
                </h3>
                <p className="text-slate-600 mb-4">
                  Il nostro team è sempre disponibile per assisterti
                </p>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-primary-navy text-white rounded-xl hover:bg-primary-navy/90 transition-colors text-sm font-medium">
                    Contatta Supporto
                  </button>
                  <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium">
                    FAQ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
