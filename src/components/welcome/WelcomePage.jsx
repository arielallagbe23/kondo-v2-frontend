import React from "react";
import { Link } from "react-router-dom";

const WelcomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl px-10 py-12 max-w-3xl text-center transition-all duration-300">
        <h1 className="text-5xl font-extrabold text-cyan-500 mb-4 tracking-tight">
          Bienvenue sur Kondo
        </h1>

        <p className="mt-4 text-lg leading-relaxed">
          Testez vos <span className="font-semibold text-cyan-600">stratégies de trading</span> avec précision avant de passer au réel.
        </p>

        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
          Analysez vos performances, améliorez votre gestion du risque et boostez votre prise de décision avec nos outils.
        </p>

        <div className="mt-8">
          <Link to="/session">
            <button className="px-8 py-3 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 hover:scale-105 transform transition duration-300 shadow-lg">
              🚀 Commencer le Backtest
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
