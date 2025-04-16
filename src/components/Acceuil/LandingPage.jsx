import React from "react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-700">
        <div className="text-xl font-bold tracking-tight">KONDO</div>

      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Optimise ta stratégie <br /> avec la précision d'un prop trader
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
          Visualise ton PNL, maîtrise ton risk management, et passe à la vitesse supérieure grâce à notre outil de backtest dédié.
        </p>

      </main>
    </div>
  );
};

export default LandingPage;
