import React from "react";

const WelcomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white">
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-8 max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-cyan-500">Bienvenue</h1>
        <p className="mt-4 text-lg">
          Testez vos stratégies de trading avec précision avant de les exécuter en réel. 
        </p>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Accédez aux performances passées de vos stratégies et optimisez votre prise de décision.
        </p>
        <div className="mt-6">
          <button className="px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-600 transition">
            Commencer le Backtest
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
