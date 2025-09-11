"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  type: "home" | "dashboard" | "sub-dashboard";
  userName?: string;
  userInitials?: string;
  onLogout?: () => void;
}

export default function Header({
  type,
  userName,
  userInitials,
  onLogout,
}: HeaderProps) {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleRegisterClick = () => {
    router.push("/register");
  };

  return (
    <header className="relative bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-navy/5 via-transparent to-secondary-gold/5"></div>
      <div className="relative max-w-7xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo e Badge */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-light tracking-tight text-slate-900 font-serif">
              MyBank
            </h1>
            <span className="text-xs font-medium text-secondary-gold uppercase tracking-widest">
              {type === "home" ? "Digital Banking" : "Private Banking"}
            </span>
          </div>

          {/* Sezione destra - varia in base al tipo */}
          <div className="flex items-center space-x-6">
            {type === "home" && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
                >
                  Accedi
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="px-6 py-2 bg-gradient-to-r from-primary-navy to-primary-teal text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  Registrati
                </button>
              </div>
            )}

            {(type === "dashboard" || type === "sub-dashboard") &&
              userName &&
              userInitials &&
              onLogout && (
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-navy to-primary-teal rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-medium text-sm">
                        {userInitials}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-800 font-medium text-lg">
                        {userName}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="group flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-all duration-200 hover:bg-slate-100/60 rounded-xl"
                  >
                    <svg
                      className="w-4 h-4 group-hover:rotate-3 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="font-medium">Esci</span>
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Separatore elegante */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
    </header>
  );
}
