"use client";

import { useRouter } from "next/navigation";
import { IoChevronBack } from "react-icons/io5";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backPath?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  backPath = "/dashboard",
  actions,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBackClick = () => {
    router.push(backPath);
  };

  return (
    <div className="bg-white/30 backdrop-blur-sm border-b border-slate-200/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <button
              onClick={handleBackClick}
              className="group flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 text-slate-600 hover:text-slate-800 transition-all duration-200 hover:bg-slate-100/60 rounded-xl"
            >
              <IoChevronBack className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium hidden sm:inline">Dashboard</span>
            </button>

            <div className="border-l border-slate-300 h-6 sm:h-8 hidden sm:block"></div>

            <div>
              <h1 className="text-xl sm:text-2xl font-light tracking-tight text-slate-900 mb-1">
                {title}
              </h1>
              {subtitle && (
                <p className="text-slate-600 text-xs sm:text-sm">{subtitle}</p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
