import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import BackTestingSession from "./backtestingsession/BackTestingSession";
import AutreChose from "./autrechose/AutreChose";

const Home = () => {
  const [selectedBox, setSelectedBox] = useState("yellow");
  const [menuOpen, setMenuOpen] = useState(false); // Gérer l'ouverture/fermeture du menu

  return (
    <div className="h-full w-full flex flex-col bg-gray-100 dark:bg-gray-800 relative">

      <div className="flex">

        <div className="">
        {/*
        <button
          className="p-4 ml-10 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md text-xl hover:bg-gray-300 dark:hover:bg-gray-900 transition-transform"
          onClick={() => setMenuOpen(!menuOpen)} // Basculer l'état du menu
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              fill="currentColor"
              className="bi bi-x"
              viewBox="0 0 16 16"
            >
              <path
                d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
              />
            </svg>
          ) : (
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
          )}
        </button>
        */}

        </div>

    
        <div
          className={`flex space-x-16 ml-24 transform transition-all duration-500 ease-in-out ${
            menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-24 pointer-events-none"
          }`}
        >
          <button
            className={`p-4 rounded-lg transition-all duration-500 cursor-pointer 
              hover:bg-cyan-600 hover:text-white 
              ${
                selectedBox === "yellow"
                  ? "bg-cyan-600 dark:bg-cyan-600 text-white shadow-xl"
                  : "bg-white dark:bg-gray-900 text-black dark:text-white"
              }`}
            onClick={() => setSelectedBox("yellow")}
          >
            Backtesting Session
          </button>

          <button
            className={`p-4 rounded-lg transition-all duration-500 cursor-pointer 
              hover:bg-cyan-500 hover:text-white 
              ${
                selectedBox === "red"
                  ? "bg-cyan-600 dark:bg-cyan-600 text-white shadow-xl"
                  : "bg-white dark:bg-gray-900 text-black dark:text-white"
              }`}
            onClick={() => setSelectedBox("red")}
          >
            Calcul taille de la position
          </button>

          <button
            className={`p-4 rounded-lg transition-all duration-500 cursor-pointer 
              hover:bg-cyan-600 hover:text-white 
              ${
                selectedBox === "green"
                  ? "bg-cyan-600 dark:bg-cyan-600 text-white shadow-xl"
                  : "bg-white dark:bg-gray-900 text-black dark:text-white"
              }`}
            onClick={() => setSelectedBox("green")}
          >
            Encore Autre
          </button>
        </div>

      </div>


      <div className="flex">
        {selectedBox === "yellow" && (
          <div className="w-full h-full text-black text-lg font-bold">
            <BackTestingSession />
          </div>
        )}

        {selectedBox === "red" && (
          <div className="w-full h-full text-black text-lg font-bold">
            <AutreChose />
          </div>
        )}

        {selectedBox === "green" && (
          <div className="w-96 h-96 bg-cyan-600 flex items-center justify-center text-black text-lg font-bold rounded-lg shadow-lg">
            Contenu Vert
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
