"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getToken, getUserData, clearAuthData } from "@/utils/localStorage";

export default function HomePage() {
  // stato loading
  let [caricamento, setCaricamento] = useState(true);

  const router = useRouter();

  // controlla se utente già loggato
  useEffect(() => {
    controllaLogin();
  });

  const controllaLogin = () => {
    try {
      const token = getToken();
      const user = getUserData();

      if (token && user && user.id) {
        // utente loggato, vai alla dashboard
        router.push("/dashboard");
        return;
      } else if (token || user) {
        // dati corrotti, pulizia
        clearAuthData();
      }
    } catch (error) {
      clearAuthData();
    } finally {
      setCaricamento(false);
    }
  };

  // funzione per navigare
  const goTo = (pagina: string) => {
    router.push(pagina);
  };

  // loading semplice
  if (caricamento) {
    return <LoadingSpinner />;
  }

  // homepage per visitatori non loggati
  return (
    <div className="min-h-screen bg-gray-50">
      <Header type="home" />

      <main className="relative">
        {/* sezione hero */}
        <section className="pt-32 pb-20 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8">
                <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                  Il Futuro del Banking è Qui
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="text-gray-800">Banking</span>
                <br />
                <span className="text-blue-600">Senza Limiti</span>
              </h1>

              <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-600 leading-relaxed">
                Sperimenta la libertà finanziaria con la nostra piattaforma di
                banking digitale.
                <span className="font-semibold text-blue-600 block mt-2">
                  Zero commissioni, massima sicurezza, controllo totale.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
                <button
                  onClick={() => goTo("/register")}
                  className="bg-blue-600 text-white font-semibold text-lg px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="flex items-center justify-center">
                    Inizia Gratis
                  </span>
                </button>
                <button
                  onClick={() => goTo("/login")}
                  className="border-2 border-gray-300 text-gray-700 font-semibold text-lg px-10 py-5 rounded-2xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                >
                  <span className="flex items-center justify-center">
                    Accedi
                  </span>
                </button>
              </div>

              {/* statistiche */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                <div className="p-8 bg-white bg-opacity-70 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="text-4xl font-bold mb-3 text-green-600">
                    0€
                  </div>
                  <p className="text-gray-600 font-medium">Commissioni</p>
                  <p className="text-sm text-gray-500 mt-1">per sempre</p>
                </div>
                <div className="p-8 bg-white bg-opacity-70 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="text-4xl font-bold mb-3 text-blue-600">
                    24/7
                  </div>
                  <p className="text-gray-600 font-medium">Disponibilità</p>
                  <p className="text-sm text-gray-500 mt-1">sempre attivo</p>
                </div>
                <div className="p-8 bg-white bg-opacity-70 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="text-4xl font-bold mb-3 text-purple-600">
                    &lt;1s
                  </div>
                  <p className="text-gray-600 font-medium">Trasferimenti</p>
                  <p className="text-sm text-gray-500 mt-1">istantanei</p>
                </div>
                <div className="p-8 bg-white bg-opacity-70 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="text-4xl font-bold mb-3 text-orange-600">
                    100%
                  </div>
                  <p className="text-gray-600 font-medium">Sicurezza</p>
                  <p className="text-sm text-gray-500 mt-1">garantita</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* sezione caratteristiche */}
        <section className="py-32 bg-gray-100 relative">
          <div className="max-w-7xl mx-auto px-4 relative">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold mb-8 text-gray-800">
                Perché scegliere
                <span className="block text-blue-600">MyBank</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Scopri le funzionalità principali che rendono MyBank la scelta
                ideale per il tuo futuro finanziario
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="group relative">
                <div className="relative bg-white border border-gray-200 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">
                      Due Tipi di Conto
                    </h3>
                    <div className="w-12 h-0.5 bg-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Scegli tra conto corrente e conto risparmio. Un conto per
                    ogni tipologia per organizzare al meglio le tue finanze
                    personali.
                  </p>
                  <div className="text-sm text-blue-600 font-medium">
                    Scopri di più →
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="relative bg-white border border-gray-200 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">
                      Trasferimenti Istantanei
                    </h3>
                    <div className="w-12 h-0.5 bg-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Invia e ricevi denaro in tempo reale, 24 ore su 24, 7 giorni
                    su 7. Velocità senza compromessi, sicurezza garantita.
                  </p>
                  <div className="text-sm text-blue-600 font-medium">
                    Scopri di più →
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="relative bg-white border border-gray-200 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">
                      Sicurezza Avanzata
                    </h3>
                    <div className="w-12 h-0.5 bg-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Protezione di livello bancario europeo con crittografia
                    end-to-end. I tuoi dati sono al sicuro, sempre e ovunque.
                  </p>
                  <div className="text-sm text-blue-600 font-medium">
                    Scopri di più →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
