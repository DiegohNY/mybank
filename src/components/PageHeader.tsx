"use client";

import { useRouter } from "next/navigation";

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
  actions 
}: PageHeaderProps) {
  const router = useRouter();

  const handleBackClick = () => {
    router.push(backPath);
  };

  return (
    <div className="bg-white/30 backdrop-blur-sm border-b border-slate-200/40">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleBackClick}
              className="group flex items-center space-x-3 px-4 py-2 text-slate-600 hover:text-slate-800 transition-all duration-200 hover:bg-slate-100/60 rounded-xl"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Dashboard</span>
            </button>
            
            <div className="border-l border-slate-300 h-8"></div>
            
            <div>
              <h1 className="text-2xl font-light tracking-tight text-slate-900 mb-1">
                {title}
              </h1>
              {subtitle && (
                <p className="text-slate-600 text-sm">{subtitle}</p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}