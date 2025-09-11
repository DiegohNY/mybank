"use client";

export default function Footer() {
  return (
    <footer className="bg-white border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Logo e brand */}
          <div className="flex items-center space-x-3">
            <div className="text-left">
              <span className="font-semibold text-gray-800 text-lg">
                MyBank
              </span>
              <p className="text-xs text-gray-500 mt-0.5">Digital Banking</p>
            </div>
          </div>

          {/* Informazioni */}
          <div className="text-center md:text-right">
            <p className="text-gray-500">© 2024 MyBank</p>
            <p className="text-xs text-gray-400">Progetto Universitario</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center max-w-4xl mx-auto leading-relaxed">
            MyBank è un progetto universitario. Non è un istituto bancario reale
            e non gestisce fondi o transazioni reali.
          </p>
        </div>
      </div>
    </footer>
  );
}
