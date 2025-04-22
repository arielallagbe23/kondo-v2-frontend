import React, { useEffect, useState } from "react";
import TransactionSummaryRiskAdjusted from "./TransactionSummaryRiskAdjusted";
import TransactionsummaryPieChart from "./transactionsummaryPieChart";
import TransactionSummaryCount from "./TransactionSummaryCount";
import TradingMetrics from "./TransactionSummaryTradingMetrics";
import TimeMetrics from "./TransationSummaryTimeMetrics";
import RiskManagementMetrics from "./TransactionSummaryRiskManagementMetrics";
import QuarterlyDoughnutChart from "./QuarterlyDoughnutChart";
import SemesterDoughnutChart from "./SemesterDoughnutChart";
import TryToTakeRiskAsYoungIAm from "./TryToTakeRiskAsYoungIAm";
import QuarterlyPNL from "./TryToTakeRiskAsYoungIAm";
import TradeFrequencyStats from "./newfile";
import IndiceFiabilite from "./IndiceFiabilité";
import ClassementActifsParPNL from "./newfile";

const TransactionSummary = () => {
  const [selectedTimeframes, setSelectedTimeframes] = useState([]);
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [minRrp, setMinRrp] = useState(""); // RRP minimum
  const [maxRrp, setMaxRrp] = useState(""); // RRP maximum
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [rawTransactions, setRawTransactions] = useState([]);
  const [groupedSessions, setGroupedSessions] = useState({});
  const [filteredTransactionsForTable, setFilteredTransactionsForTable] = useState([]);
  const [filteredTransactionsForMetrics, setFilteredTransactionsForMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredTransactionsForTable.length / itemsPerPage);

  const [selectedDays, setSelectedDays] = useState([]); // Jours de la semaine
  const [selectedMonths, setSelectedMonths] = useState([]); // Mois de l'année
  const [selectedHours, setSelectedHours] = useState([]); // Heures

  const paginatedTransactions = filteredTransactionsForTable.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const TIMEFRAME_LABELS = {
    1: "M5",
    2: "M15",
    3: "M30",
    4: "H1",
    5: "H4",
    6: "D1",
    7: "W1",
    8: "MN1",
  };

  // 🔁 Fetch initial
  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");
      if (!token) return console.error("❌ Aucun token trouvé.");

      try {
        const response = await fetch(
          "http://localhost:5001/api/transactions/valid-cloturees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok)
          throw new Error("Erreur de récupération des transactions");

        const data = await response.json();
        setRawTransactions(data);
      } catch (err) {
        console.error("⚠️ Erreur pendant le fetch :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    let filtered = rawTransactions;

    // Filtrer par timeframe
    if (selectedTimeframes.length) {
      filtered = filtered.filter((trx) =>
        selectedTimeframes.includes(trx.timeframe_id)
      );
    }

    // Filtrer par année
    if (startYear) {
      filtered = filtered.filter(
        (trx) => new Date(trx.date_entree).getFullYear() >= Number(startYear)
      );
    }
    if (endYear) {
      filtered = filtered.filter(
        (trx) => new Date(trx.date_entree).getFullYear() <= Number(endYear)
      );
    }

    // Filtrer par RRP
    if (minRrp) {
      filtered = filtered.filter((trx) => trx.rrp >= Number(minRrp));
    }
    if (maxRrp) {
      filtered = filtered.filter((trx) => trx.rrp <= Number(maxRrp));
    }

    // Filtrer par mois
    if (selectedMonths.length) {
      filtered = filtered.filter(
        (trx) => selectedMonths.includes(new Date(trx.date_entree).getMonth() + 1)
      );
    }

    // Filtrer par jour de la semaine
    if (selectedDays.length) {
      filtered = filtered.filter(
        (trx) => selectedDays.includes(new Date(trx.date_entree).getDay())
      );
    }

    // Filtrer par heure
    if (selectedHours.length) {
      filtered = filtered.filter(
        (trx) => selectedHours.includes(new Date(trx.date_entree).getHours())
      );
    }

    // Regrouper les sessions
    const sessionMap = {};
    filtered.forEach((trx) => {
      const actif = trx.nom_actif;
      const sessionId = trx.session_backtest_id;
      if (!sessionMap[actif]) sessionMap[actif] = [];
      if (!sessionMap[actif].some((s) => s.id === sessionId)) {
        sessionMap[actif].push({ id: sessionId, titre: trx.session_titre });
      }
    });
    setGroupedSessions(sessionMap);

    // Filtrer par sessions si sélectionnées
    if (selectedSessions.length) {
      filtered = filtered.filter((trx) =>
        selectedSessions.includes(trx.session_backtest_id)
      );
    }

    // Tri pour les indicateurs (ordre croissant)
    const performanceSortedTransactions = [...filtered].sort(
      (a, b) => new Date(a.date_entree) - new Date(b.date_entree)
    );
    setFilteredTransactionsForMetrics(performanceSortedTransactions);

    // Tri pour le tableau (ordre décroissant)
    filtered.sort((a, b) => new Date(b.date_entree) - new Date(a.date_entree));
    setFilteredTransactionsForTable(filtered);

    setCurrentPage(1); // Réinitialiser la pagination
  }, [
    rawTransactions,
    selectedTimeframes,
    startYear,
    endYear,
    selectedSessions,
    minRrp,
    maxRrp,
    selectedDays,
    selectedMonths,
    selectedHours,
  ]);

  if (loading) return <p className="text-white">Chargement...</p>;

  return (
    <div className="w-[95%]">
      {/* 🔘 Filtres */}
      <div className="mb-4 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mt-4">
        <h4 className="text-white mb-4 font-bold text-xl">Filtrer</h4>

        {/* Timeframes */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          {Object.entries(TIMEFRAME_LABELS).map(([id, label]) => (
            <button
              key={id}
              onClick={() =>
                setSelectedTimeframes((prev) =>
                  prev.includes(Number(id))
                    ? prev.filter((t) => t !== Number(id))
                    : [...prev, Number(id)]
                )
              }
              className={`px-4 py-2 text-sm rounded-md text-center font-medium transition-colors duration-200 ${
                selectedTimeframes.includes(Number(id))
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map((day, index) => (
            <button
              key={index}
              onClick={() =>
                setSelectedDays((prev) =>
                  prev.includes(index)
                    ? prev.filter((d) => d !== index)
                    : [...prev, index]
                )
              }
              className={`px-4 py-2 text-sm rounded-md text-center font-medium transition-colors duration-200 ${
                selectedDays.includes(index)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Mois de l'année */}
        <div className="grid grid-cols-12 gap-2 mb-4">
          {[...Array(12).keys()].map((month) => (
            <button
              key={month}
              onClick={() =>
                setSelectedMonths((prev) =>
                  prev.includes(month + 1)
                    ? prev.filter((m) => m !== month + 1)
                    : [...prev, month + 1]
                )
              }
              className={`px-4 py-2 text-sm rounded-md text-center font-medium transition-colors duration-200 ${
                selectedMonths.includes(month + 1)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {new Date(0, month).toLocaleString("fr", { month: "long" })}
            </button>
          ))}
        </div>

        {/* Heures de la journée */}
        <div className="grid grid-cols-12 gap-2 mb-4">
          {[...Array(24).keys()].map((hour) => (
            <button
              key={hour}
              onClick={() =>
                setSelectedHours((prev) =>
                  prev.includes(hour)
                    ? prev.filter((h) => h !== hour)
                    : [...prev, hour]
                )
              }
              className={`px-4 py-2 text-sm rounded-md text-center font-medium transition-colors duration-200 ${
                selectedHours.includes(hour)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {hour < 10 ? `0${hour}:00` : `${hour}:00`}
            </button>
          ))}
        </div>

        {/* Autres filtres : Année et RRP */}
        <div className="grid grid-cols-4 gap-4 mb-4 w-full">
          {/* Année Début */}
          <div className="flex flex-col">
            <label className="text-white text-sm mb-1">Année Début</label>
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-1 text-sm h-10"
              placeholder="ex: 2023"
            />
          </div>

          {/* Année Fin */}
          <div className="flex flex-col">
            <label className="text-white text-sm mb-1">Année Fin</label>
            <input
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-1 text-sm h-10"
              placeholder="ex: 2025"
            />
          </div>

          {/* RRP Min */}
          <div className="flex flex-col">
            <label className="text-white text-sm mb-1">RRP Min</label>
            <input
              type="number"
              value={minRrp}
              onChange={(e) => setMinRrp(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-1 text-sm h-10"
              placeholder="ex: 1.5"
            />
          </div>

          {/* RRP Max */}
          <div className="flex flex-col">
            <label className="text-white text-sm mb-1">RRP Max</label>
            <input
              type="number"
              value={maxRrp}
              onChange={(e) => setMaxRrp(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-1 text-sm h-10"
              placeholder="ex: 5.0"
            />
          </div>
        </div>
      </div>

      {/* 🎯 Sessions */}
      <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
        <h4 className="text-white mb-4 font-bold text-xl">
          Sessions Backtest Trouvées
        </h4>
        {Object.keys(groupedSessions).length === 0 ? (
          <p className="text-gray-400">Aucune session trouvée.</p>
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {Object.entries(groupedSessions).map(([actif, sessions]) => (
              <div key={actif} className="mb-6">
                <h5 className="text-lg text-white font-semibold mb-2">{actif}</h5>
                <div className="flex flex-col gap-2">
                  {sessions.map((session) => {
                    const isSelected = selectedSessions.includes(session.id);
                    return (
                      <button
                        key={session.id}
                        onClick={() =>
                          setSelectedSessions((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== session.id)
                              : [...prev, session.id]
                          )
                        }
                        className={`px-3 py-1 h-16 rounded-md text-sm transition-colors duration-200 ${
                          isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {session.titre}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🚫 Si aucune transaction filtrée */}
      {filteredTransactionsForTable.length === 0 ? (
        <div className="bg-gray-800 text-red-400 text-center p-6 rounded-xl font-bold text-lg mb-6">
          🚫 Aucune transaction à afficher
        </div>
      ) : (
        <>
          {/* Indicateurs et graphiques */}
          <div className="bg-gray-800 text-white rounded-xl flex space-x-4">
            <div className="bg-gray-900 text-white rounded-xl mt-4 w-3/12">
              <h4 className="text-xl font-bold p-4">
                📊 Répartition des résultats
              </h4>
              <TransactionsummaryPieChart
                transactionSummaryFilteredTransactions={filteredTransactionsForMetrics}
              />
            </div>
            <div className="bg-gray-900 text-white rounded-xl mt-4 w-7/12">
              <h4 className="text-xl font-bold mb-4 p-4">
                📊 Nombre de Transactions par actif
              </h4>
              <TransactionSummaryCount
                transactionSummaryFilteredTransactions={filteredTransactionsForMetrics}
              />
            </div>
            <div className="bg-gray-900 text-white rounded-xl mt-4 w-2/12">
              <h4 className="text-xl font-bold mb-4 p-4">
                Classement des PNL
              </h4>
              <ClassementActifsParPNL  transactionSummaryFilteredTransactions={filteredTransactionsForMetrics}
/>
            </div>
            
          </div>

          <div className="flex mb-4 mt-4 h-auto space-x-4">
            <div className="bg-gray-800 text-white rounded-xl w-full h-auto">
              <TransactionSummaryRiskAdjusted
                transactionSummaryFilteredTransactions={filteredTransactionsForMetrics}
              />
            </div>
          </div>

          <div className="mb-4 mt-4 bg-gray-900 rounded-xl">
              <h4 className="text-xl font-bold p-4">
                📊 Gestion du risque trimestrielle
              </h4>
            <QuarterlyPNL transactionSummaryFilteredTransactions={filteredTransactionsForMetrics}/>
          </div>

          <div className="flex mb-4 mt-4 h-auto space-x-4">
            <div className="bg-gray-800 text-white rounded-xl w-1/2 h-auto">
              <QuarterlyDoughnutChart
                transactionSummaryFilteredTransactions={filteredTransactionsForMetrics}
              />
            </div>
            <div className="bg-gray-800 text-white rounded-xl w-1/2 h-auto">
              <SemesterDoughnutChart
                transactionSummaryFilteredTransactions={filteredTransactionsForMetrics}
              />
            </div>
          </div>


          <div className="flex space-x-2 mb-4">
            <div className="bg-gray-800 text-white rounded-xl w-1/3">
              <TradingMetrics
                transactionSummaryFilteredTransactions={filteredTransactionsForMetrics}
              />
            </div>
            <div className="bg-gray-800 text-white rounded-xl w-1/3">
              <TimeMetrics
                transactionSummaryFilteredTransactions={filteredTransactionsForMetrics}
              />
            </div>
            <div className="bg-gray-800 text-white rounded-xl w-1/3">
              <RiskManagementMetrics
                transactionSummaryFilteredTransactions={filteredTransactionsForMetrics}
              />
            </div>
          </div>

          {/* Tableau */}
          <div className="bg-gray-900 text-white rounded-xl overflow-hidden w-full mb-20 px-4 py-4">
            <h4 className="text-lg font-bold mb-4">
              Transactions filtrées ({filteredTransactionsForTable.length})
            </h4>
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto text-sm border-collapse rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-2 py-4 border-b border-gray-700 text-left">
                      Actif
                    </th>
                    <th className="px-2 py-4 border-b border-gray-700 text-left">
                      Date entrée
                    </th>
                    <th className="px-2 py-4 border-b border-gray-700 text-left">
                      Session
                    </th>
                    <th className="px-2 py-4 border-b border-gray-700 text-left">
                      Timeframe
                    </th>
                    <th className="px-2 py-4 border-b border-gray-700 text-left">
                      Résultat
                    </th>
                    <th className="px-2 py-4 border-b border-gray-700 text-left">
                      RRP
                    </th>
                    <th className="px-2 py-4 border-b border-gray-700 text-left">
                      Bénéfice
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((trx, index) => (
                    <tr
                      key={trx.id}
                      className={index % 2 === 0 ? "bg-gray-700" : "bg-gray-600"}
                    >
                      <td className="px-2 py-4">{trx.nom_actif}</td>
                      <td className="px-2 py-4">
                        {new Date(trx.date_entree).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-2 py-4">{trx.session_titre}</td>
                      <td className="px-2 py-4">
                        {TIMEFRAME_LABELS[trx.timeframe_id] || trx.timeframe_id}
                      </td>
                      <td className="px-2 py-4">{trx.resultat}</td>
                      <td className="px-2 py-4">{trx.rrp}</td>
                      <td className="px-2 py-4">{trx.benefice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredTransactionsForTable.length > itemsPerPage && (
              <div className="flex justify-center items-center mt-4 gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="text-white">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );
};

export default TransactionSummary;
