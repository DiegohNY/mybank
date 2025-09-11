"use client";

import { useRouter } from "next/navigation";
import { IoLogOut } from "react-icons/io5";

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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo e Badge */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900 font-serif">
              MyBank
            </h1>
            <span className="text-xs font-medium text-secondary-gold uppercase tracking-widest">
              {type === "home" ? "Digital Banking" : "Private Banking"}
            </span>
          </div>

          {/* Sezione destra - varia in base al tipo */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {type === "home" && (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={handleLoginClick}
                  className="px-3 sm:px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200 text-sm sm:text-base"
                >
                  Accedi
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-primary-navy to-primary-teal text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  Registrati
                </button>
              </div>
            )}

            {(type === "dashboard" || type === "sub-dashboard") &&
              userName &&
              userInitials &&
              onLogout && (
                <div className="flex items-center space-x-3 sm:space-x-6">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-navy to-primary-teal rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-medium text-xs sm:text-sm">
                        {userInitials}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-slate-800 font-medium text-lg">
                        {userName}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-slate-600 hover:text-slate-800 transition-all duration-200 hover:bg-slate-100/60 rounded-xl"
                  >
                    <IoLogOut className="w-4 h-4 group-hover:rotate-3 transition-transform" />
                    <span className="font-medium text-sm sm:text-base">
                      Esci
                    </span>
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
