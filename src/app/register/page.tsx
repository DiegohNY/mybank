"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  sanitizeInput,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
} from "@/utils/validation";
import { apiRequest } from "@/utils/api";

export default function RegisterPage() {
  let [nomeUtente, setNomeUtente] = useState("");
  let [cognomeUtente, setCognomeUtente] = useState("");
  let [emailInput, setEmailInput] = useState("");
  let [passwordInput, setPasswordInput] = useState("");
  let [confermaPass, setConfermaPass] = useState("");
  let [erroreForm, setErroreForm] = useState("");
  let [loading, setLoading] = useState(false);

  const router = useRouter();

  // funzione per gestire submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErroreForm("");

    try {
      // Validazione campi obbligatori
      validateRequired(nomeUtente, "Nome");
      validateRequired(cognomeUtente, "Cognome");
      validateRequired(emailInput, "Email");
      validateRequired(passwordInput, "Password");
      validateRequired(confermaPass, "Conferma password");

      // Validazione formato email
      if (!validateEmail(emailInput)) {
        throw new Error("Formato email non valido");
      }

      // Validazione lunghezza password
      if (!validatePassword(passwordInput)) {
        throw new Error("Password troppo corta (minimo 6 caratteri)");
      }

      // Validazione corrispondenza password
      validatePasswordMatch(passwordInput, confermaPass);

      // Validazione nomi
      validateName(nomeUtente);
      validateName(cognomeUtente);

      setLoading(true);

      // Sanitizzazione input
      const cleanData = {
        email: sanitizeInput(emailInput.toLowerCase()),
        password: passwordInput,
        first_name: sanitizeInput(nomeUtente),
        last_name: sanitizeInput(cognomeUtente),
        phone: null,
      };

      // Chiamata API usando apiRequest util
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(cleanData),
      });

      // Redirect al login
      router.push("/login");
    } catch (error: any) {
      console.error("Errore registrazione:", error);
      setErroreForm(error.message || "Errore durante la registrazione");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* header logo - simile alle altre pagine */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">MyBank</h1>
          <p className="text-gray-600 mt-2">Crea il tuo nuovo account</p>
        </div>

        {/* card principale */}
        <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Registrazione
          </h2>

          {erroreForm && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm text-center font-medium">
              {erroreForm}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                value={nomeUtente}
                onChange={(e) => setNomeUtente(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Il tuo nome"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cognome
              </label>
              <input
                type="text"
                value={cognomeUtente}
                onChange={(e) => setCognomeUtente(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Il tuo cognome"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="esempio@email.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Crea una password sicura"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Conferma Password
              </label>
              <input
                type="password"
                value={confermaPass}
                onChange={(e) => setConfermaPass(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ripeti la password"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg font-semibold rounded-lg transition-all duration-200 ${
                loading
                  ? "bg-blue-400 text-gray-100 cursor-not-allowed opacity-50"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-100 border-t-transparent rounded-full animate-spin"></div>
                  Registrazione in corso...
                </span>
              ) : (
                "Crea Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Hai già un account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors underline decoration-2 underline-offset-2"
                disabled={loading}
              >
                Accedi qui
              </button>
            </p>
          </div>
        </div>

        {/* link home */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            disabled={loading}
          >
            ← Torna alla homepage
          </button>
        </div>
      </div>
    </div>
  );
}
