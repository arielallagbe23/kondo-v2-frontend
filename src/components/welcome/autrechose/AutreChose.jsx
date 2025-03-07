import React from "react";

const AutreChose = () => {
  return (
    <div className="ml-10 mt-10">
      <div className="h-auto w-[50%] bg-white dark:bg-gray-900 p-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Outils de calcul de taille de position
        </h1>
        <div className="space-y-8 flex flex-col">
          {/* Bouton vers CashbackForex */}
          <a
            href="https://www.cashbackforex.com/fr/tools/position-size-calculator?s=[DE40]"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition"
          >
            Calculateur CashbackForex
          </a>

          {/* Bouton vers MyFxBook */}
          <a
            href="https://www.myfxbook.com/forex-calculators/position-size"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition"
          >
            Calculateur MyFxBook
          </a>
        </div>
      </div>
    </div>
  );
};

export default AutreChose;
