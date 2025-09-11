"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUserData, setToken, setUserData, clearAuthData } from "@/utils/localStorage";

export default function LoginPage() {
  let [emailUtente, setEmailUtente] = useState("");
  let [passwordUtente, setPasswordUtente] = useState("");
  let [errore, setErrore] = useState("");
  let [caricamento, setCaricamento] = useState(false);

  const router = useRouter();

  useEffect(() => {
    try {
      const user = getUserData();
      const token = getToken();

      if (user && token && user.id) {
        router.push("/");
      }
    } catch (error) {
      clearAuthData();
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrore("");


    if (!emailUtente || !passwordUtente) {
      setErrore("Inserisci email e password");
      return;
    }

    setCaricamento(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailUtente.toLowerCase().trim(),
          password: passwordUtente,
        }),
      });

      // controllo response
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Risposta del server non valida");
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrore(data.error || "Credenziali non valide");
        setCaricamento(false);
        return;
      }

      // salvataggio dati utente
      setToken(data.data.token);
      setUserData(data.data.user);

      // vai alla dashboard
      router.push("/");
    } catch (error) {
      console.error("Errore login:", error);
      setErrore("Errore di connessione. Riprova più tardi.");
      setCaricamento(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* header logo - simile alle altre pagine */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">MyBank</h1>
          <p className="text-gray-600 mt-2">Accedi al tuo account</p>
        </div>

        {/* card principale */}
        <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Bentornato
          </h2>

          {errore && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm text-center font-medium">
              {errore}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={emailUtente}
                onChange={(e) => setEmailUtente(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="esempio@email.com"
                disabled={caricamento}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={passwordUtente}
                onChange={(e) => setPasswordUtente(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Inserisci la tua password"
                disabled={caricamento}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={caricamento}
              className={`w-full py-4 text-lg font-semibold rounded-lg transition-all duration-200 ${
                caricamento
                  ? "bg-blue-400 text-gray-100 cursor-not-allowed opacity-50"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
              }`}
            >
              {caricamento ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-100 border-t-transparent rounded-full animate-spin"></div>
                  Accesso in corso...
                </span>
              ) : (
                "Accedi"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Non hai ancora un account?{" "}
              <button
                onClick={() => router.push("/register")}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors underline decoration-2 underline-offset-2"
                disabled={caricamento}
              >
                Registrati ora
              </button>
            </p>
          </div>
        </div>

        {/* link home */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            disabled={caricamento}
          >
            ← Torna alla homepage
          </button>
        </div>
      </div>
    </div>
  );
}
