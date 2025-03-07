import React, { useEffect, useState } from "react";
import FilteredMemo from "./visualisation/FilteredMemo";
import FilteredPieChart from "./visualisation/FilteredPieChart";
import FilteredLineChart from "./visualisation/FilteredLineChart";
import FilteredBarChart from "./visualisation/FilteredBarChart";
import FilteredComments from "./visualisation/FilteredComments";
import { useNavigate } from "react-router-dom";

const Visualisation = ({ sessionBacktestId, transactions, refreshVisualisation, capital2 }) => {
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHours, setSelectedHours] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedOrderTypes, setSelectedOrderTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 1;
  const navigate = useNavigate(); // 🚀 Hook pour la navigation

    // ✅ Redirection automatique vers l'accueil en cas de retour en arrière
    useEffect(() => {
      const handleBackNavigation = () => {
        navigate("/"); // Redirige vers la page d'accueil
      };
  
      window.addEventListener("popstate", handleBackNavigation);
      
      return () => {
        window.removeEventListener("popstate", handleBackNavigation);
      };
    }, [navigate]);
  
  const orderTypes = [
    { id: 1, type_ordre: "buy" },
    { id: 2, type_ordre: "sell" },
    { id: 3, type_ordre: "buy limit" },
    { id: 4, type_ordre: "sell limit" },
    { id: 5, type_ordre: "buy stop" },
    { id: 6, type_ordre: "sell stop" }
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Utilisateur non authentifié");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5001/api/transactions/transactions/${sessionBacktestId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Erreur lors de la récupération des transactions");

        const data = await response.json();
        const formattedData = data.map(transaction => ({
          ...transaction,
          date_entree: new Date(transaction.date_entree),
        }));

        setFilteredTransactions(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionBacktestId) {
      fetchTransactions();
    }
  }, [sessionBacktestId, refreshVisualisation])

  const toggleHour = (hour) => {
    setSelectedHours(prev => prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]);
  };

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleOrderType = (typeId) => {
    setSelectedOrderTypes(prev => prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]);
  };

  const applyFilters = () => {
    let filtered = transactions;

    if (selectedHours.length > 0) {
      filtered = filtered.filter(trx => selectedHours.includes(trx.date_entree.getHours()));
    }

    if (selectedDays.length > 0) {
      const daysMap = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
      filtered = filtered.filter(trx => selectedDays.includes(daysMap[trx.date_entree.getDay()]));
    }

    if (selectedOrderTypes.length > 0) {
      filtered = filtered.filter(trx => trx.type_ordre_id && selectedOrderTypes.includes(trx.type_ordre_id));
    }

    setFilteredTransactions(filtered);
  };

  // **Pagination - Transactions affichées**
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // **Gestion des pages**
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  


  return (
    <div className={`flex flex-col ml-auto mr-auto w-full mb-20 transition-all duration-300 ${refreshVisualisation ? "blur-sm" : ""}`}>
    {/* ✅ Vérifie si aucune transaction n'est disponible */}
      {filteredTransactions.length === 0 ? (
        <div className="flex justify-center items-center h-[80vh] bg-gray-200 dark:bg-gray-900 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-300">
            🚫 No Data Found
          </h1>
        </div>
      ) : (
        <>
          <div className="flex w-full space-x-4">
            <div className="w-full bg-gray-100 dark:bg-gray-900 p-2 rounded-lg">
              {/* Sélections des jours */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((day, index) => (
                  <div
                    key={index}
                    className={`rounded text-center text-[8px] cursor-pointer font-light transition-colors
                      ${selectedDays.includes(day) ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-black dark:text-gray-500'}`}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
  
              {/* Sélection des heures */}
              <div className="grid grid-cols-12 gap-2">
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className={`rounded text-[8px] text-center cursor-pointer font-light transition-colors
                      ${selectedHours.includes(i) ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-black dark:text-gray-500'}`}
                    onClick={() => toggleHour(i)}
                  >
                    {i}:00 - {i + 1}:00
                  </div>
                ))}
              </div>
            </div>
          </div>
  
          {/* ✅ Affichage des graphiques et des transactions */}
          <div className="mt-2 flex flex-col">
            <div className="w-full h-64 flex space-x-2">
              <div className="w-[10%] flex flex-col space-y-2">
                <div className="h-auto">
                  <button
                    onClick={applyFilters}
                    className="p-4 w-full bg-gray-900 text-white font-extralight text-xs rounded-2xl"
                  >
                    Filtrer
                  </button>
                </div>
  
                <div className="bg-gray-900 text-gray-800 dark:text-gray-100 w-full flex-1 font-extralight text-sm p-4 rounded-2xl">
                  <FilteredMemo filteredTransactions={filteredTransactions} capital2={capital2} />
                </div>
              </div>
  
              <div className="bg-gray-900 rounded-2xl w-[20%] flex justify-center items-center p-4">
                <FilteredPieChart filteredTransactions={filteredTransactions} />
              </div>
              <div className="w-[70%]">
                <FilteredLineChart filteredTransactions={filteredTransactions} />
              </div>
            </div>
  
            {/* ✅ Tableau des transactions et commentaires */}
            <div className="h-64 flex mt-2 space-x-2">
              <div className="w-[70%] h-auto flex">
                <FilteredBarChart filteredTransactions={filteredTransactions} />
              </div>
  
              <div className="w-[30%] h-autoflex flex-col space-y-2">
                <div className="w-full h-[50%] p-2 bg-gray-200 dark:bg-gray-900 rounded-2xl flex flex-col justify-center items-center">
                  <table className="w-full h-[85%] border-collapse border border-gray-300 dark:border-gray-700 text-[8px] rounded-2xl overflow-hidden text-gray-800 dark:text-gray-100 font-extralight">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-gray-700">
                        <th className="p-2">Actif </th>
                        <th className="p-2">Date d'entrée</th>
                        <th className="p-2">Type d'ordre</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="bg-gray-100 dark:bg-gray-800">
                          <td className=" p-2 text-center">{transaction.nom_actif}</td>
                          <td className=" p-2 text-center">
                            {transaction.date_entree.toLocaleString()}
                          </td>
                          <td className=" p-2 text-center">
                            {orderTypes.find((o) => o.id === transaction.type_ordre_id)?.type_ordre || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
  
                  {/* 🚀 Pagination */}
                  {filteredTransactions.length > transactionsPerPage && (
                    <div className="flex text-[8px] justify-center space-x-4 h-[12%] mt-[2%] w-full">
                      <button
                        className={`p-2 rounded-lg ${
                          currentPage === 1 ? "bg-gray-400 flex justify-center items-center" : "bg-blue-500 hover:bg-blue-700 flex justify-center items-center"
                        } text-white flex justify-center items-center`}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        ◀
                      </button>
                      <span className="text-gray-900 dark:text-white flex justify-center items-center font-extralight text-[8px]">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        className={`p-2 rounded-lg ${
                          currentPage === totalPages ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"
                        } text-white flex justify-center items-center`}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        ▶
                      </button>
                    </div>
                  )}
                </div>
  
                {/* 📌 Zone des commentaires */}
                <div className="w-full h-[46%] bg-gray-200 dark:bg-gray-900 rounded-2xl">
                  <FilteredComments sessionBacktestId={sessionBacktestId} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
  
};

export default Visualisation;
