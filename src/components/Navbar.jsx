import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isNavbarOpen, setIsNavbarOpen }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/connexion");
    } else {
      setIsLoggedIn(true);
    }
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, [navigate]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
    setIsLoggedIn(false);
    navigate("/connexion");
  };

  return (

    <>
      {/* Icône de menu toujours visible */}
      <button
        className="flex items-center text-4xl fixed left-6 z-50 text-cyan-600 gap-2 mt-4"
        onClick={toggleNavbar}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          fill="currentColor"
          className="bi bi-list"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
          />
        </svg>
        <span className="text-3xl font-bold">KONDO</span>
      </button>


      {/* Overlay pour fermer la navbar quand on clique à côté */}
      {isNavbarOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40"
          onClick={toggleNavbar}
        ></div>
      )}

      {/* Navbar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 dark:bg-gray-800 text-white w-64 transform transition-transform duration-300 ${
          isNavbarOpen ? "translate-x-0" : "-translate-x-64"
        } shadow-lg z-50 p-4`}
      >
        <button className="text-white text-2xl absolute top-4 right-4" onClick={toggleNavbar}>
          ✖
        </button>
        <nav className="flex flex-col space-y-4 mt-10">
          <Link to="/home" className="text-lg hover:text-cyan-400" onClick={toggleNavbar}>Accueil</Link>
          <Link to="/overwatch" className="text-lg hover:text-cyan-400" onClick={toggleNavbar}>OverWatch</Link>
          <Link to="/journaltrading" className="text-lg hover:text-cyan-400" onClick={toggleNavbar}>Journal trading</Link>
          <Link to="/transactionsumary" className="text-lg hover:text-cyan-400" onClick={toggleNavbar}>Transaction Summary</Link>



          
          {isLoggedIn && (
            <button onClick={handleLogout} className="text-lg hover:text-red-400">
              Déconnexion
            </button>
          )}
        </nav>
        <div className="absolute bottom-6 left-6">
          <div className="w-20 h-12 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 cursor-pointer" onClick={toggleDarkMode}>
            <div
              className={`bg-cyan-600 w-10 h-10 rounded-full shadow-md transform transition-transform duration-700 ${
                isDarkMode ? "translate-x-8" : "translate-x-0"
              }`}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
