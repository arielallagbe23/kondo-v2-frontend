import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="w-full h-full text-white">

      <main className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Optimise ta stratégie <br /> avec précision
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
          Visualise ton PNL, maîtrise ton risk management, et passe à la vitesse supérieure grâce à notre outil de backtest dédié.
        </p>
        <Link to="/connexion">
          <button className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-6 py-3 rounded-xl transition duration-200">
            Commencer maintenant
          </button>
        </Link>
      </main>
    </div>
  );
};

export default LandingPage;
