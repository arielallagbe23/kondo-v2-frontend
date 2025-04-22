import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isNavbarOpen, setIsNavbarOpen }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

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
      {/* Header top-left logo + menu burger alignés proprement */}
      <div className="fixed top-4 left-6 z-50 flex items-center gap-4">
        {/* Burger icon */}
        <button
          onClick={toggleNavbar}
          className="text-cyan-500 hover:text-cyan-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="currentColor"
            className="bi bi-list"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
            />
          </svg>
        </button>
        {/* KONDO logo */}
        <Link
          to="/"
          className="text-cyan-500 text-3xl font-extrabold tracking-wide"
        >
          KONDO
        </Link>
      </div>

      {/* Overlay */}
      {isNavbarOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40"
          onClick={toggleNavbar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 dark:bg-gray-800 text-white w-64 transform transition-transform duration-300 ${
          isNavbarOpen ? "translate-x-0" : "-translate-x-64"
        } shadow-lg z-50 p-4`}
      >
        <button
          className="text-white text-2xl absolute top-4 right-4"
          onClick={toggleNavbar}
        >
          ✖
        </button>

        <nav className="flex flex-col space-y-4 mt-10">
          {!isLoggedIn ? (
            <>
              <Link
                to="/connexion"
                onClick={toggleNavbar}
                className="text-lg hover:text-blue-400"
              >
                Connexion
              </Link>
              <Link
                to="/inscription"
                onClick={toggleNavbar}
                className="text-lg hover:text-green-400"
              >
                Inscription
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/home"
                className="text-lg hover:text-cyan-400"
                onClick={toggleNavbar}
              >
                Accueil
              </Link>
              <Link
                to="/overwatch"
                className="text-lg hover:text-cyan-400"
                onClick={toggleNavbar}
              >
                OverWatch
              </Link>
              <Link
                to="/journaltrading"
                className="text-lg hover:text-cyan-400"
                onClick={toggleNavbar}
              >
                Journal trading
              </Link>
              <Link
                to="/transactionsumary"
                className="text-lg hover:text-cyan-400"
                onClick={toggleNavbar}
              >
                Transaction Summary
              </Link>
              <button
                onClick={handleLogout}
                className="text-lg hover:text-red-400"
              >
                Déconnexion
              </button>
            </>
          )}
        </nav>

        <div className="absolute bottom-6 left-6">
          <div
            className="w-20 h-12 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 cursor-pointer"
            onClick={toggleDarkMode}
          >
            <div
              className={`bg-cyan-600 w-10 h-10 rounded-full shadow-md transform transition-transform duration-700 ${
                isDarkMode ? "translate-x-8" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
