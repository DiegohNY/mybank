"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { Utente } from "@/types";
import { checkUserLogin, handleLogout, getUserInitials } from "@/utils/auth";
import { getToken, getUserData, clearAuthData } from "@/utils/localStorage";
import {
  IoAdd,
  IoArrowForward,
  IoSwapHorizontal,
  IoStatsChart,
  IoBarChart,
} from "react-icons/io5";

interface ChartData {
  soldiVersati: number; // Money deposited
  soldiSpesi: number; // Money spent/withdrawn
  bonificiTotali: number; // Total transfers
}

export default function AnalyticsPage() {
  const [userData, setUserData] = useState<Utente | null>(null);
  const [chartData, setChartData] = useState<ChartData>({
    soldiVersati: 0,
    soldiSpesi: 0,
    bonificiTotali: 0,
  });
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = () => {
    try {
      const token = getToken();
      const userData = getUserData();

      if (!token || !userData) {
        router.push("/login");
        return;
      }

      if (!userData || !userData.id) {
        router.push("/login");
        return;
      }

      setUserData(userData);
      loadAnalyticsData();
    } catch (error) {
      console.log("Errore parsing dati utente");
      clearAuthData();
      router.push("/login");
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const token = getToken();
      const response = await fetch("/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          calculateStats(data.data);
        }
      }
    } catch (error) {
      console.error("Errore caricamento dati:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions: any[]) => {
    const stats = {
      soldiVersati: 0, // Soldi messi nel conto
      soldiSpesi: 0, // Soldi tolti dal conto
      bonificiTotali: 0, // Bonifici inviati e ricevuti
    };

    transactions.forEach((transazione) => {
      const importo = parseFloat(transazione.amount);

      if (transazione.transaction_type === "deposit") {
        stats.soldiVersati += importo;
      } else if (transazione.transaction_type === "withdrawal") {
        stats.soldiSpesi += importo;
      } else if (transazione.transaction_type.includes("transfer")) {
        stats.bonificiTotali += importo;
      }
    });

    setChartData(stats);
  };

  if (loading) {
    return LoadingSpinner();
  }

  if (!userData) {
    return null;
  }

  const fullName = `${userData.first_name} ${userData.last_name}`;
  const initials = `${userData.first_name.charAt(0)}${userData.last_name.charAt(
    0
  )}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Header
        type="sub-dashboard"
        userName={fullName}
        userInitials={initials}
        onLogout={() => handleLogout(router)}
      />

      <PageHeader
        title="Analisi Finanziaria"
        subtitle="Statistiche dei tuoi movimenti"
      />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Le Mie Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {(() => {
            // Valori semplici da capire
            const soldiMessi = chartData.soldiVersati || 0;
            const soldiTolti = chartData.soldiSpesi || 0;
            const bonifici = chartData.bonificiTotali || 0;
            const totaleMovimenti = soldiMessi + soldiTolti + bonifici;

            // Percentuali per le barre di progresso
            const percentualeMessi =
              totaleMovimenti > 0
                ? ((soldiMessi / totaleMovimenti) * 100).toFixed(0)
                : "0";
            const percentualeTolti =
              totaleMovimenti > 0
                ? ((soldiTolti / totaleMovimenti) * 100).toFixed(0)
                : "0";
            const percentualeBonifici =
              totaleMovimenti > 0
                ? (
                    100 -
                    (soldiMessi / totaleMovimenti) * 100 -
                    (soldiTolti / totaleMovimenti) * 100
                  ).toFixed(0)
                : "0";

            return (
              <>
                <div className="group">
                  <div className="relative p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-2xl flex items-center justify-center">
                        <IoAdd className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <span>Entrate</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        Soldi Versati
                      </h3>
                      <p className="text-sm text-slate-500">
                        Quanto hai messo nel conto
                      </p>
                    </div>

                    <div className="mb-6">
                      <p className="text-3xl font-light text-slate-900 mb-2">
                        {new Intl.NumberFormat("it-IT", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(soldiMessi)}
                      </p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${percentualeMessi}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="relative p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl flex items-center justify-center">
                        <IoArrowForward className="w-7 h-7 text-red-600" />
                      </div>
                      <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span>Uscite</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        Soldi Spesi
                      </h3>
                      <p className="text-sm text-slate-500">
                        Quanto hai prelevato dal conto
                      </p>
                    </div>

                    <div className="mb-6">
                      <p className="text-3xl font-light text-slate-900 mb-2">
                        {new Intl.NumberFormat("it-IT", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(soldiTolti)}
                      </p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${percentualeTolti}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="relative p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl flex items-center justify-center">
                        <IoSwapHorizontal className="w-7 h-7 text-blue-600" />
                      </div>
                      <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Bonifici</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        Bonifici Totali
                      </h3>
                      <p className="text-sm text-slate-500">
                        Quanto hai trasferito ad altri
                      </p>
                    </div>

                    <div className="mb-6">
                      <p className="text-3xl font-light text-slate-900 mb-2">
                        {new Intl.NumberFormat("it-IT", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(bonifici)}
                      </p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${percentualeBonifici}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Grafico delle Mie Spese */}
        <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-light text-slate-900 mb-1">
                Come Spendo i Miei Soldi
              </h2>
              <p className="text-slate-600">
                Una panoramica semplice delle tue operazioni
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primary-navy/10 to-primary-teal/10 rounded-2xl flex items-center justify-center">
              <IoStatsChart className="w-6 h-6 text-primary-navy" />
            </div>
          </div>

          {(() => {
            // Calcoli semplici per il grafico a torta
            const messi = chartData.soldiVersati || 0;
            const spesi = chartData.soldiSpesi || 0;
            const bonifici = chartData.bonificiTotali || 0;
            const tuttoInsieme = messi + spesi + bonifici;

            if (tuttoInsieme === 0) {
              return (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <IoBarChart className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-light text-slate-900 mb-2">
                    Non hai ancora fatto operazioni
                  </h3>
                  <p className="text-slate-600">
                    Inizia a usare il tuo conto per vedere le statistiche qui
                  </p>
                </div>
              );
            }

            // Percentuali per il grafico a torta
            const percentualeMessi = (messi / tuttoInsieme) * 100;
            const percentualeSpesi = (spesi / tuttoInsieme) * 100;
            const percentualeBonifici =
              100 - (percentualeMessi + percentualeSpesi);

            const coloreTorta = `conic-gradient(#10b981 0% ${percentualeMessi}%, #ef4444 ${percentualeMessi}% ${
              percentualeMessi + percentualeSpesi
            }%, #3b82f6 ${percentualeMessi + percentualeSpesi}% 100%)`;

            return (
              <>
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <div
                      className="w-56 h-56 rounded-full shadow-lg"
                      style={{
                        background: coloreTorta,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg mx-auto mb-3 shadow-sm"></div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Soldi Versati
                    </p>
                    <p className="text-2xl font-light text-slate-900 mb-1">
                      {percentualeMessi.toFixed(0)}%
                    </p>
                    <p className="text-xs text-emerald-600">Nel conto</p>
                  </div>
                  <div className="text-center p-6 bg-red-50/50 rounded-2xl border border-red-100">
                    <div className="w-6 h-6 bg-red-500 rounded-lg mx-auto mb-3 shadow-sm"></div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Soldi Spesi
                    </p>
                    <p className="text-2xl font-light text-slate-900 mb-1">
                      {percentualeSpesi.toFixed(0)}%
                    </p>
                    <p className="text-xs text-red-600">Dal conto</p>
                  </div>
                  <div className="text-center p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="w-6 h-6 bg-blue-500 rounded-lg mx-auto mb-3 shadow-sm"></div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Bonifici Fatti
                    </p>
                    <p className="text-2xl font-light text-slate-900 mb-1">
                      {percentualeBonifici.toFixed(0)}%
                    </p>
                    <p className="text-xs text-blue-600">Trasferiti</p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
