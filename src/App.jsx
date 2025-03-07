import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import WelcomePage from "./components/welcome/WelcomePage";
import Connexion from "./components/auth/Connexion";
import Home from "./components/welcome/Home";
import AddTransaction from "./components/welcome/backtestingsession/AddTransaction";
import BackTestingSession from "./components/welcome/backtestingsession/BackTestingSession";
import Overwatch from "./components/welcome/overwatch/overwatch";
import JournalTrading from "./components/welcome/journaltrading/JournalTrading";

function App() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  return (
    <Router>
      {/* Conteneur principal qui prend toute la hauteur de l'écran */}
      <div className="h-screen flex bg-gray-100 dark:bg-gray-800">

        
        {/* Navbar - Toujours présente mais peut se cacher */}
        <Navbar isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} />

        {/* 🔥 Contenu principal qui ajuste sa largeur */}
        <main
          className={`${
            isNavbarOpen ? "ml-64" : "ml-0"
          } flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-all duration-300 ml-8 w-full mt-16`}
        >
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/home" element={<Home />} />
            <Route path="/session" element={<BackTestingSession /> } />
            <Route path="/welcomeHome" element={<WelcomePage />} />
            <Route path="/overwatch" element={<Overwatch />} />
            <Route path="/journaltrading" element={<JournalTrading />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
