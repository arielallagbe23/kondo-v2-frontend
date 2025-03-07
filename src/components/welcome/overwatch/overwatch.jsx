import React, { useState, useEffect } from "react";
import OverwatchPieChart from "./OverwatchPiechart";
import OverwatchRiskAdjusted from "./OverwatchRiskAdjusted";
import OverwatchExplication from "./OverwatchExplication";

const Overwatch = () => {
  const [userTransactions, setUserTransactions] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;
  const [startDate, setStartDate] = useState(""); // État pour la date de début
  const [endDate, setEndDate] = useState(""); // État pour la date de fin

  // ✅ États des filtres
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [filters, setFilters] = useState({
    selectedHours: [],
    selectedDays: [],
    selectedMonths: [],
    selectedSessions: [],
  });

  const [isDragging, setIsDragging] = useState(false); // Activation du drag selection

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ Aucun token trouvé.");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5001/api/transactions/transactions/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des transactions.");
        }

        const data = await response.json();
        const formattedData = data
          .map((trx) => ({
            ...trx,
            date_entree: new Date(trx.date_entree),
          }))
          .sort((a, b) => b.date_entree - a.date_entree);

        setUserTransactions(formattedData);
      } catch (error) {
        console.error("⚠️ Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSessions = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ Aucun token trouvé.");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5001/api/users/sessions-backtest",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok)
          throw new Error("Erreur lors de la récupération des sessions");

        const data = await response.json();

        // ✅ Grouper les sessions par actifs
        const groupedSessions = data.reduce((acc, session) => {
          if (!acc[session.nom_actif]) acc[session.nom_actif] = [];
          acc[session.nom_actif].push(session);
          return acc;
        }, {});

        setUserSessions(groupedSessions);
      } catch (err) {
        console.error("⚠️ Erreur récupération sessions:", err);
      }
    };

    fetchTransactions();
    fetchSessions();
  }, []);

  const handleToggle = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((v) => v !== value)
        : [...prev[filterType], value],
    }));
  };

  const filteredTransactions = userTransactions.filter((trx) => {
    const trxDate = new Date(trx.date_entree); // Convertir la date de la transaction en objet Date

    const trxYear = trxDate.getFullYear();
    const trxMonth = trxDate.getMonth();
    const trxHour = trxDate.getHours();
    const trxDay = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ][trxDate.getDay()];

    // Filtrage par année
    const isWithinYearRange =
      (!startYear || trxYear >= parseInt(startYear)) &&
      (!endYear || trxYear <= parseInt(endYear));

    // Filtrage par dates de début et de fin
    const isWithinDateRange =
      (!startDate || trxDate >= new Date(startDate)) &&
      (!endDate || trxDate <= new Date(endDate)); // Comparer les dates

    // Autres filtres : heures, jours, mois, sessions
    const matchHour =
      filters.selectedHours.length === 0 ||
      filters.selectedHours.includes(trxHour);
    const matchDay =
      filters.selectedDays.length === 0 ||
      filters.selectedDays.includes(trxDay);
    const matchMonth =
      filters.selectedMonths.length === 0 ||
      filters.selectedMonths.includes(trxMonth);
    const matchSession =
      filters.selectedSessions.length === 0 ||
      filters.selectedSessions.includes(trx.session_backtest_id);

    return (
      isWithinYearRange &&
      isWithinDateRange && // Assurez-vous que la transaction est dans la plage de dates
      matchHour &&
      matchDay &&
      matchMonth &&
      matchSession
    );
  });

  // ✅ Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  const nextPage = () => {
    if (
      currentPage < Math.ceil(filteredTransactions.length / transactionsPerPage)
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="mr-8 rounded-lg mb-20">

      {/* 📌 Filtres */}
      <div className="rounded-lg bg-gray-100 dark:bg-gray-900 py-4 px-2 mb-4">
        <h3 className="text-white font-bold">Filtres</h3>

        {/* Filtre par Mois (Effet de glissement) */}
        <div
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          className="grid grid-cols-12 gap-2 mt-2"
        >
          {[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ].map((month, index) => (
            <button
              key={index}
              className={`p-2 text-xs rounded-md ${
                filters.selectedMonths.includes(index)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
              onMouseDown={() => handleToggle("selectedMonths", index)}
              onMouseEnter={() =>
                isDragging && handleToggle("selectedMonths", index)
              }
            >
              {month}
            </button>
          ))}
        </div>

        {/* Filtre par Jours */}
        <div className="grid grid-cols-7 gap-2 mt-2">
          {[
            "Lundi",
            "Mardi",
            "Mercredi",
            "Jeudi",
            "Vendredi",
            "Samedi",
            "Dimanche",
          ].map((day) => (
            <button
              key={day}
              className={`p-2 text-xs rounded-md ${
                filters.selectedDays.includes(day)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
              onMouseDown={() => handleToggle("selectedDays", day)}
              onMouseEnter={() =>
                isDragging && handleToggle("selectedDays", day)
              }
            >
              {day}
            </button>
          ))}
        </div>

        {/* Filtre par Heures */}
        <div className="grid grid-cols-12 gap-2 mt-2">
          {Array.from({ length: 24 }, (_, i) => (
            <button
              key={i}
              className={`p-2 text-xs rounded-md ${
                filters.selectedHours.includes(i)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
              onMouseDown={() => handleToggle("selectedHours", i)}
              onMouseEnter={() =>
                isDragging && handleToggle("selectedHours", i)
              }
            >
              {i}:00
            </button>
          ))}
        </div>
        {/* Filtre par Sessions */}

        {/* Filtre par Année */}
        <div className="flex space-x-6 mt-2 w-full">
          <div className="flex flex-col">
            <label className="text-gray-300 text-xs mb-2">Année Début</label>
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="p-1 border rounded text-xs bg-gray-700 text-white"
              placeholder="2020"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 text-xs mb-2">Année Fin</label>
            <input
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className="p-1 border rounded text-xs bg-gray-700 text-white"
              placeholder="2022"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 text-xs mb-2">Date Début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1 border rounded text-xs bg-gray-700 text-white"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 text-xs mb-2">Date Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1 border rounded text-xs bg-gray-700 text-white"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <h4 className="text-white font-semibold">Sessions</h4>

          {userSessions && Object.keys(userSessions).length > 0 ? (
            Object.keys(userSessions).map((nomActif) => (
              <div key={nomActif}>
                <h5 className="text-gray-300">{nomActif}</h5>
                <div className="gap-2 mt-2">
                  {userSessions[nomActif].map((session) => (
                    <button
                      key={session.id}
                      className={`p-2 text-xs rounded-md mr-2 ${
                        filters.selectedSessions.includes(session.id)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-700 text-gray-400"
                      }`}
                      onClick={() =>
                        handleToggle("selectedSessions", session.id)
                      }
                    >
                      {session.titre}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">Aucune session disponible</p>
          )}
        </div>
      </div>

      {/* 📌 Tableau des transactions filtrées */}
      <div className="overflow-x-auto mt-8 rounded-lg  py-4">
        <h3 className="text-white font-bold mb-4 text-2xl">
          Transactions Filtrées
        </h3>

        {filteredTransactions.length === 0 ? (
          <p className="text-gray-400">Aucune transaction trouvée.</p>
        ) : (
          <>
            <div className="flex mt-4rounded-lg space-x-4">
              <div className="w-full">
                <OverwatchRiskAdjusted
                  overwatchFilteredTransactions={filteredTransactions}
                />
              </div>
            </div>
            <div className="flex space-x-4">
            <div className="w-[30%] h-auto flex items-center justify-center bg-gray-100 dark:bg-gray-900 mt-4 rounded-lg">
                <OverwatchPieChart
                  overwatchFilteredTransactions={filteredTransactions}
                />
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 py-8 px-2 rounded-lg mt-4 w-[70%]">
                <table className="w-full text-sm text-left text-gray-400 rounded-lg overflow-hidden">
                  <thead className="text-xs uppercase bg-gray-800 text-gray-300 rounded-t-lg">
                    <tr>
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Actif</th>
                      <th className="px-4 py-2">Date Entrée</th>
                      <th className="px-4 py-2">Résultat</th>
                      <th className="px-4 py-2">Risque (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="bg-gray-700 border-b border-gray-600"
                      >
                        <td className="px-4 py-2">{transaction.id}</td>
                        <td className="px-4 py-2">{transaction.nom_actif}</td>
                        <td className="px-4 py-2">
                          {transaction.date_entree.toLocaleString("fr-FR")}
                        </td>
                        <td
                          className={`px-4 py-2 font-semibold ${
                            transaction.resultat_id === 2
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {transaction.resultat_id === 2
                            ? "Perte (SL)"
                            : "Gain (TP/BE)"}
                        </td>
                        <td className="px-4 py-2">{transaction.risque}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ✅ Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    Précédent
                  </button>

                  <span className="text-white">
                    Page {currentPage} /{" "}
                    {Math.ceil(
                      filteredTransactions.length / transactionsPerPage
                    )}
                  </span>

                  <button
                    onClick={nextPage}
                    disabled={
                      currentPage ===
                      Math.ceil(
                        filteredTransactions.length / transactionsPerPage
                      )
                    }
                    className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${
                      currentPage ===
                      Math.ceil(
                        filteredTransactions.length / transactionsPerPage
                      )
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    Suivant
                  </button>
                </div>
              </div>

            </div>

            <div className="bg-gray-100 dark:bg-gray-900 py-8 px-2 rounded-lg mt-4">
              <OverwatchExplication />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Overwatch;
