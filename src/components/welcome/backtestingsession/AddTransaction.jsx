import React, { useState, useEffect } from "react";
import axios from "axios";
import AddPhotos from "./addFolder/AddPhotos";
import AddComments from "./addFolder/AddComments";
import FilteredMemo from "./visualisation/FilteredMemo";
import FilteredPieChart from "./visualisation/FilteredPieChart";
import FilteredLineChart from "./visualisation/FilteredLineChart";
import FilteredBarChart from "./visualisation/FilteredBarChart";
import FilteredComments from "./visualisation/FilteredComments";
import FilteredRadarChart from "./visualisation/FilteredRadarChart";
import FilteredTransactionsPhotos from "./visualisation/FilteredTransactionsPhotos";
import DollarValue from "./visualisation/DollarValue";
import Quote from "./visualisation/Quote";
import TradingMetrics1 from "./visualisation/TradingMetrics1";
import TimeMetrics from "./visualisation/TimeMetrics";
import RiskManagementMetrics from "./visualisation/RiskManagementMetrics";
import RiskAdjustedProjection from "./visualisation/RiskAdjustedProjection";
import SecondFilteredBarChart from "./visualisation/SecondFilteredBarChart";
import UpdateDecision from "./addFolder/UpdateDecision";

const AddTransaction = ({
  sessionBacktestId,
  actifId,
  capital2,
  sessionBacktestTitre,
}) => {
  console.log("📢 Valeur de `capital2` dans AddTransaction :", capital2);
  const [loading, setLoading] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [rrp1, setRrp1] = useState("");
  const [rrp2, setRrp2] = useState("");
  const [isBlurred, setIsBlurred] = useState(false);
  const [isRefreshingTable, setIsRefreshingTable] = useState(false);
  const [isEmptyData, setIsEmptyData] = useState(false);
  const [refreshComments, setRefreshComments] = useState(false);
  const [benefice, setBenefice] = useState(0); // ✅ Stocker le bénéfice calculé
  const [beneficeData, setBeneficeData] = useState([]);

  const [transactions, setTransactions] = useState([
    {
      resultat_id: "",
      date_entree: "",
      rrp: "",
    },
  ]);

  const [commonFields, setCommonFields] = useState({
    actif_id: actifId,
    strategie_id: "",
    timeframe_id: "",
    risque: "0.5", // Valeur par défaut
  });

  const [alert, setAlert] = useState({ message: "", type: "" });
  const [options, setOptions] = useState({
    actifs: [],
    timeframes: [],
    resultats: [],
  });
  const [strategies, setStrategies] = useState([]);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert({ message: "", type: "" });
    }, 5000);
  };

  const [refreshVisualisation, setRefreshVisualisation] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [actifs, timeframes, resultats] = await Promise.all([
          axios.get("http://localhost:5001/api/actifs"),
          axios.get("http://localhost:5001/api/timeframes"),
          axios.get("http://localhost:5001/api/resultats"),
        ]);

        setOptions({
          actifs: actifs.data,
          timeframes: timeframes.data,
          resultats: resultats.data,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des options :", error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ Erreur : Jeton non disponible !");
          return;
        }

        const response = await axios.get(
          "http://localhost:5001/api/users/strategies",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          setStrategies(response.data);
        } else {
          console.error(
            "❌ Erreur lors de la récupération des stratégies :",
            response.status
          );
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des stratégies :",
          error
        );
      }
    };

    fetchStrategies();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ Utilisateur non authentifié !");
          return;
        }

        const response = await axios.get(
          `http://localhost:5001/api/transactions/transactions/${sessionBacktestId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          const formattedData = response.data.map((trx) => ({
            ...trx,
            date_entree: new Date(trx.date_entree), // Convertir en Date
          }));

          // 🔥 TRIER PAR DATE (ordre décroissant)
          formattedData.sort((a, b) => b.date_entree - a.date_entree);

          setAllTransactions(formattedData);
        }
      } catch (error) {
        console.error("❌ Erreur de récupération des transactions :", error);
      }
    };

    if (sessionBacktestId) {
      fetchTransactions();
    }
  }, [sessionBacktestId, refreshVisualisation]);

  // ✅ Calculer le bénéfice total
  useEffect(() => {
    if (allTransactions.length === 0) return;

    let totalBeneficePourcentage = 0;

    allTransactions.forEach((transaction) => {
      const { resultat_id, risque, rrp } = transaction;
      const risquePourcentage = parseFloat(risque) / 100 || 0;
      const rrpFloat = parseFloat(rrp) || 1;

      let beneficePourcentage = 0;

      switch (resultat_id) {
        case 1: // Break Even (BE)
          beneficePourcentage = 0;
          break;
        case 2: // Stop Loss (SL)
          beneficePourcentage = -risquePourcentage;
          break;
        case 3: // Take Profit (TP)
        case 4: // SL->TP
          beneficePourcentage = risquePourcentage * rrpFloat;
          break;
        default:
          beneficePourcentage = 0;
      }

      totalBeneficePourcentage += beneficePourcentage;
    });

    setBenefice((totalBeneficePourcentage * 100).toFixed(2)); // ✅ Stocker en pourcentage
  }, [allTransactions]);

  // ✅ Mettre à jour la session via API
  useEffect(() => {
    if (sessionBacktestId && benefice !== 0) {
      const updateSessionBenefice = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("❌ Aucun token trouvé. Authentification requise.");
            return;
          }

          await axios.put(
            `http://localhost:5001/api/sessions/updateSession/${sessionBacktestId}`,
            { benefice },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log(
            `✅ Session ${sessionBacktestId} mise à jour avec un bénéfice de ${benefice}%`
          );
        } catch (error) {
          console.error(
            "❌ Erreur lors de la mise à jour du bénéfice de la session :",
            error
          );
        }
      };

      updateSessionBenefice();
    }
  }, [benefice, sessionBacktestId]); // ✅ Exécute la requête dès que `benefice` change

  const [filters, setFilters] = useState({
    selectedHours: [],
    selectedDays: [],
    selectedOrderTypes: [],
    selectedMonths: [], // 🔥 Ajout du filtre des mois
  });

  const [isDragging, setIsDragging] = useState(false); // 👈 Ajoute cette ligne ici

  const handleToggleHour = (hour) => {
    setFilters((prev) => ({
      ...prev,
      selectedHours: prev.selectedHours.includes(hour)
        ? prev.selectedHours.filter((h) => h !== hour)
        : [...prev.selectedHours, hour],
    }));
  };

  const handleToggleDay = (day) => {
    setFilters((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  const handleToggleOrderType = (typeId) => {
    setFilters((prev) => ({
      ...prev,
      selectedOrderTypes: prev.selectedOrderTypes.includes(typeId)
        ? prev.selectedOrderTypes.filter((t) => t !== typeId)
        : [...prev.selectedOrderTypes, typeId],
    }));
  };

  const handleToggleMonth = (monthIndex) => {
    setFilters((prev) => ({
      ...prev,
      selectedMonths: prev.selectedMonths.includes(monthIndex)
        ? prev.selectedMonths.filter((m) => m !== monthIndex)
        : [...prev.selectedMonths, monthIndex],
    }));
  };

  const filteredTransactions = allTransactions.filter((trx) => {
    const trxYear = trx.date_entree.getFullYear();
    const trxMonth = trx.date_entree.getMonth(); // 🔥 0 = Janvier, 11 = Décembre
    const trxHour = trx.date_entree.getHours();
    const trxDay = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ][trx.date_entree.getDay()];

    const rrp = parseFloat(trx.rrp);

    const isWithinYearRange =
      (!startYear || trxYear >= parseInt(startYear)) &&
      (!endYear || trxYear <= parseInt(endYear));

    const matchHour =
      filters.selectedHours.length === 0 ||
      filters.selectedHours.includes(trxHour);
    const matchDay =
      filters.selectedDays.length === 0 ||
      filters.selectedDays.includes(trxDay);
    const matchOrderType = filters.selectedOrderTypes.length === 0;
    const matchMonth =
      filters.selectedMonths.length === 0 ||
      filters.selectedMonths.includes(trxMonth);

    const matchRrp =
      (!rrp1 && !rrp2) ||
      (rrp1 && !rrp2 && rrp >= parseFloat(rrp1)) ||
      (!rrp1 && rrp2 && rrp <= parseFloat(rrp2)) ||
      (rrp1 && rrp2 && rrp >= parseFloat(rrp1) && rrp <= parseFloat(rrp2));

    return (
      isWithinYearRange &&
      matchHour &&
      matchDay &&
      matchOrderType &&
      matchMonth &&
      matchRrp
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 3;

  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

  const currentTransactions = filteredTransactions
    .sort((a, b) => b.date_entree - a.date_entree) // 🔥 Toujours trier avant affichage
    .slice(
      (currentPage - 1) * transactionsPerPage,
      currentPage * transactionsPerPage
    );

  const handleAddRow = () => {
    setTransactions((prev) => [
      ...prev,
      {
        resultat_id: "",
        date_entree: "",
        rrp: "",
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    setTransactions(transactions.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    console.log(
      `🛠️ Modification : Champ '${field}' de la transaction ${index + 1} :`,
      value
    );
    const updatedTransactions = [...transactions];
    updatedTransactions[index][field] = value;
    setTransactions(updatedTransactions);
  };

  const isFormValid = () => {
    console.log("🔍 Validation des champs communs :", commonFields);
    console.log("🔍 Transactions :", transactions);

    if (!commonFields.actif_id || !commonFields.strategie_id) {
      console.warn("❌ Champs communs invalides :", commonFields);
      return false;
    }

    if (!commonFields.risque || !commonFields.timeframe_id) {
      console.warn("❌ Champs communs manquants :", commonFields);
      return false;
    }

    return transactions.every((transaction, index) => {
      const missingFields = [];
      if (!transaction.resultat_id) missingFields.push("resultat_id");
      if (!transaction.date_entree) missingFields.push("date_entree");
      if (!transaction.rrp) missingFields.push("rrp");

      if (missingFields.length > 0) {
        console.warn(
          `❌ Transaction ${index + 1} invalide : Champs manquants - ${missingFields.join(", ")}`
        );
        return false;
      }

      return true;
    });
  };

  const handleSubmit = async () => {
    console.log("🚀 Début de handleSubmit");

    if (!isFormValid()) {
      console.warn("❌ Le formulaire n'est pas valide !");
      showAlert(
        "Veuillez remplir tous les champs correctement avant de soumettre.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);
      setIsBlurred(true);
      setIsRefreshingTable(false);

      const token = localStorage.getItem("token"); // 🔥 Vérifier le token
      const user_id = localStorage.getItem("user_id");
      const session_backtest_id = sessionBacktestId;

      if (!token || !user_id || !session_backtest_id) {
        console.error("❌ Utilisateur ou session non définis !");
        showAlert("Utilisateur ou session non définis !", "error");
        setLoading(false);
        return;
      }

      const actifIdToAdjust = [48, 49, 50, 51];

      const requests = transactions.map((transaction) => {
        const adjustedRRP = actifIdToAdjust.includes(commonFields.actif_id)
          ? parseFloat(transaction.rrp) * 0.7
          : transaction.rrp;

        const formattedDate = new Date(transaction.date_entree)
          .toISOString()
          .slice(0, 19)
          .replace("T", " "); // ✅ Date format MySQL

        const transactionData = {
          user_id,
          session_backtest_id,
          actif_id: commonFields.actif_id,
          strategie_id: commonFields.strategie_id,
          timeframe_id: commonFields.timeframe_id,
          risque: commonFields.risque,
          ...transaction,
          date_entree: formattedDate,
          rrp: adjustedRRP,
          status: "clôturé",
        };

        console.log("📤 Données envoyées :", transactionData);

        return axios.post(
          "http://localhost:5001/api/transactions/addTransactions",
          transactionData,
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Ajout du token
              "Content-Type": "application/json",
            },
          }
        );
      });

      await Promise.all(requests);

      showAlert(
        "Toutes les transactions ont été ajoutées avec succès !",
        "success"
      );

      setTransactions([
        {
          resultat_id: "",
          date_entree: "",
          rrp: "",
        },
      ]);

      setCommonFields((prev) => ({
        actif_id: prev.actif_id,
        strategie_id: "",
        risque: prev.risque || "0.5",
        timeframe_id: prev.timeframe_id || "",
      }));

      setTimeout(() => {
        setIsRefreshingTable(true);
      }, 2000);
    } catch (error) {
      console.error("❌ Une erreur s'est produite :", error.message || error);
      showAlert(
        "Une erreur s'est produite. Vérifiez les transactions et réessayez.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRefreshingTable) {
      const fetchUpdatedTransactions = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("❌ Utilisateur non authentifié !");
            return;
          }

          const response = await axios.get(
            `http://localhost:5001/api/transactions/transactions/${sessionBacktestId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status === 200) {
            const formattedData = response.data.map((trx) => ({
              ...trx,
              date_entree: new Date(trx.date_entree),
            }));
            setAllTransactions(formattedData);
            setIsEmptyData(formattedData.length === 0); // Met à jour l'état si vide

            // 🔹 Après mise à jour, attendre 1 seconde avant d'enlever le blur
            setTimeout(() => {
              setIsBlurred(false);
              setIsRefreshingTable(false);
            }, 1000);
          }
        } catch (error) {
          console.error(
            "❌ Erreur lors de la mise à jour des transactions :",
            error
          );
        }
      };

      fetchUpdatedTransactions();
    }
  }, [isRefreshingTable]); // Déclenché UNIQUEMENT si `isRefreshingTable` passe à `true`

  const handleDeleteTransaction = async (transactionId) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")
    )
      return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ Utilisateur non authentifié !");
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/transactions/deleteTransaction/${transactionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        showAlert("Transaction supprimée avec succès !", "success");
        setAllTransactions((prev) =>
          prev.filter((trx) => trx.id !== transactionId)
        ); // ✅ Mise à jour locale
      } else {
        showAlert("Erreur lors de la suppression de la transaction.", "error");
      }
    } catch (error) {
      console.error("⚠️ Erreur lors de la suppression :", error);
      showAlert("Une erreur s'est produite.", "error");
    }
  };

  return (
    <div className="flex space-x-4">
      <div className="flex flex-col space-y-6 w-1/5">
        <div className="w-full px-2 py-4 bg-white dark:bg-gray-900 rounded-lg text-gray-700 dark:text-gray-300">
          {sessionBacktestTitre}
        </div>
        <div className="w-full px-2 py-4  bg-white dark:bg-gray-900 rounded-lg shadow-lg text-gray-900 dark:text-white">
          <div className="text-lg mb-4">Ajouter transaction</div>

          <div className="mb-4 rounded-lg bg-gray-50 dark:bg-gray-800 ">
            <div className=" flex space-x-2 p-2">
              <div className="flex flex-col w-1/2">
                <label className="text-xs mb-1 font-extralight text-gray-700 dark:text-gray-300">
                  Actif
                </label>
                <input
                  type="text"
                  value={
                    options.actifs.find(
                      (actif) => actif.id === commonFields.actif_id
                    )?.nom_actif || "Chargement..."
                  }
                  readOnly
                  className="mb-1 mt-1 text-xs font-extralight w-full p-2 border rounded h-6 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex flex-col w-1/2">
                <label className="text-xs mb-1 font-extralight text-gray-700 dark:text-gray-300">
                  Stratégie
                </label>
                <select
                  value={commonFields.strategie_id}
                  onChange={(e) =>
                    setCommonFields({
                      ...commonFields,
                      strategie_id: e.target.value,
                    })
                  }
                  className="mb-1 mt-1 text-xs w-full p-1 border rounded h-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-extralight"
                >
                  <option value="">Sélectionner</option>
                  {strategies.map((strategie) => (
                    <option key={strategie.id} value={strategie.id}>
                      {strategie.nom_strategie}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className=" flex space-x-2 p-2">
              <div className="flex flex-col w-full mb-2">
                <label className="text-xs font-extralight text-gray-700 dark:text-gray-300">
                  Risque
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={commonFields.risque}
                  onChange={(e) =>
                    setCommonFields({ ...commonFields, risque: e.target.value })
                  }
                  className="text-xs font-extralight w-full p-1 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="0.5"
                />
              </div>

              <div className="flex flex-col w-full mb-2">
                <label className="text-xs font-extralight text-gray-700 dark:text-gray-300">
                  Timeframe
                </label>
                <select
                  value={commonFields.timeframe_id}
                  onChange={(e) =>
                    setCommonFields({
                      ...commonFields,
                      timeframe_id: e.target.value,
                    })
                  }
                  className="font-extralight text-xs w-full p-1 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="">Sélectionner</option>
                  {options.timeframes.map((timeframe) => (
                    <option key={timeframe.id} value={timeframe.id}>
                      {timeframe.timeframe}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs font-extralight">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="relative py-4 px-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md"
              >
                {/* Bouton "X" en haut à droite */}
                <button
                  onClick={() => handleRemoveRow(index)}
                  className="absolute top-1 right-1 font-bold text-red-600 bg-red-300 text-xs p-1 rounded rounded-tr-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    fill="currentColor"
                    className="bi bi-trash"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                  </svg>
                </button>

                {/* Grid principale pour un alignement parfait */}
                <div className="w-full">
                  {/* Étage 1 */}
                  <div className="w-full flex space-x-2 mb-4">
                    <div className="w-full">
                      <label className="block text-xs mb-2 font-extralight text-gray-700 dark:text-gray-300">
                        Date Entrée
                      </label>
                      <input
                        type="datetime-local"
                        value={transaction.date_entree}
                        onChange={(e) =>
                          handleChange(index, "date_entree", e.target.value)
                        }
                        className="text-xs py-1 w-full px-1 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Étage 2 */}
                  <div className="w-full flex space-x-2">
                    <div className="w-1/2">
                      <label className="block text-xs mb-2 font-extralight text-gray-700 dark:text-gray-300">
                        RRP
                      </label>
                      <input
                        type="text"
                        value={transaction.rrp}
                        onChange={(e) =>
                          handleChange(index, "rrp", e.target.value)
                        }
                        className="text-xs py-1 px-1 w-full border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="w-1/2">
                      <label className="block text-xs mb-2 font-extralight text-gray-700 dark:text-gray-300">
                        Résultat
                      </label>
                      <select
                        value={transaction.resultat_id}
                        onChange={(e) =>
                          handleChange(index, "resultat_id", e.target.value)
                        }
                        className="text-xs w-full p-1 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        <option value="">Sélectionner</option>
                        {options.resultats.map((resultat) => (
                          <option key={resultat.id} value={resultat.id}>
                            {resultat.resultat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Boutons */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleAddRow}
              className="p-2 bg-cyan-600 text-white font-extralight text-xs rounded-lg hover:bg-cyan-700"
            >
              Ajouter une transaction
            </button>
            <button
              onClick={handleSubmit}
              className="p-2 bg-green-500 text-white font-extralight text-xs rounded-lg hover:bg-green-700"
            >
              Envoyer
            </button>
          </div>
        </div>

        <div className="w-full">
          <AddPhotos
            sessionBacktestId={sessionBacktestId}
            showAlert={showAlert}
          />
        </div>

        <div className="w-full py-4 transition-all duration-300 ease-in-out ${isBlurred ? 'blur-md' : ''}">
          <AddComments
            sessionBacktestId={sessionBacktestId}
            showAlert={showAlert}
            setIsBlurred={setIsBlurred}
            setRefreshComments={setRefreshComments}
          />
        </div>

        <div className="bg-gray-900 rounded-lg p-2">
          <DollarValue />
        </div>

        <div className="bg-gray-900 rounded-lg p-2">
          <UpdateDecision sessionBacktestId={sessionBacktestId} />
        </div>
      </div>

      <div className="w-4/5  flex flex-col h-full space-y-2">
        <div className="h-[20%]">
          <div className="space-x-2 flex mb-2">
            <div className="bg-gray-900 rounded-lg w-[80%]">
              <Quote sessionBacktestId={sessionBacktestId} />
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex flex-col bg-white dark:bg-gray-900 w-auto rounded-lg h-auto px-4">
                <div className="text-gray-900 dark:text-white text-lg py-2 right-1">
                  Filtrer entre deux années
                </div>

                <div className="flex space-x-6 mb-2">
                  <div className="flex flex-col">
                    <label className="text-gray-900 dark:text-gray-300 font-extralight text-xs mb-2">
                      Année Début
                    </label>
                    <input
                      type="number"
                      value={startYear}
                      onChange={(e) => setStartYear(e.target.value)}
                      className="p-1 border rounded text-xs text-gray-900 dark:text-white font-extralight bg-gray-100 dark:bg-gray-800 mb-2"
                      placeholder="2020"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-gray-900 dark:text-gray-300 font-extralight text-xs mb-2">
                      Année Fin
                    </label>
                    <input
                      type="number"
                      value={endYear}
                      onChange={(e) => setEndYear(e.target.value)}
                      className="p-1 border rounded text-xs text-gray-900 font-extralight dark:text-white bg-gray-100 dark:bg-gray-800 mb-2"
                      placeholder="2022"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col bg-white dark:bg-gray-900 w-auto rounded-lg h-auto px-4">
                <div className="text-gray-900 dark:text-white text-lg py-2 right-1">
                  Filtrer rrp
                </div>

                <div className="flex space-x-6 mb-2">
                  <div className="flex flex-col">
                    <label className="text-gray-900 dark:text-gray-300 font-extralight text-xs mb-2">
                      rrp 1
                    </label>
                    <input
                      type="number"
                      value={rrp1}
                      onChange={(e) => setRrp1(e.target.value)}
                      className="p-1 border rounded text-xs text-gray-900 dark:text-white font-extralight bg-gray-100 dark:bg-gray-800 mb-2"
                      placeholder="2020"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-gray-900 dark:text-gray-300 font-extralight text-xs mb-2">
                      rrp 2
                    </label>
                    <input
                      type="number"
                      value={rrp2}
                      onChange={(e) => setRrp2(e.target.value)}
                      className="p-1 border rounded text-xs text-gray-900 font-extralight dark:text-white bg-gray-100 dark:bg-gray-800 mb-2"
                      placeholder="2022"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-lg h-full">
            <div
              className="grid grid-cols-12 gap-2 mb-2"
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
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
                  className={`rounded text-center text-sm p-2 cursor-pointer font-light transition-colors ${
                    filters.selectedMonths.includes(index)
                      ? "bg-blue-500 text-white"
                      : "bg-white dark:bg-gray-800 text-black dark:text-gray-500"
                  }`}
                  onMouseDown={() => handleToggleMonth(index)}
                  onMouseEnter={() => isDragging && handleToggleMonth(index)}
                >
                  {month}
                </button>
              ))}
            </div>

            {/* Filtrer par Jour */}
            <div className="mb-2">
              <div
                className="grid grid-cols-7 gap-2 mb-2"
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
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
                    className={`rounded text-center text-sm p-2 cursor-pointer font-light transition-colors ${
                      filters.selectedDays.includes(day)
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-800 text-black dark:text-gray-500"
                    }`}
                    onMouseDown={() => handleToggleDay(day)}
                    onMouseEnter={() => isDragging && handleToggleDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-2">
              <div
                className="grid grid-cols-12 gap-2"
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <button
                    key={i}
                    className={`rounded text-center text-xxs p-1 cursor-pointer font-light transition-colors ${
                      filters.selectedHours.includes(i)
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-800 text-black dark:text-gray-500"
                    }`}
                    onMouseDown={() => handleToggleHour(i)}
                    onMouseEnter={() => isDragging && handleToggleHour(i)}
                  >
                    {i}:00 - {i + 1}:00
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 transition-all">
          {/* ✅ Vérifier si aucune transaction n'est disponible */}
          {allTransactions.length === 0 ? (
            <div className="flex justify-center items-center h-[80vh] bg-gray-200 dark:bg-gray-900 rounded-lg shadow-lg">
              <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-300">
                🚫 Data Not Found
              </h1>
            </div>
          ) : (
            <>
              <div className="h-[40%] flex space-x-2">
                <div className="w-[15%] h-auto flex flex-col space-y-2">
                  <div className="p-2 bg-white h-full dark:bg-gray-900 text-white font-extralight text-xs rounded-lg">
                    <FilteredMemo
                      filteredTransactions={filteredTransactions}
                      capital2={capital2}
                    />
                  </div>
                </div>
                <div className="w-[25%] flex justify-center items-center bg-gray-900 rounded-2xl">
                  <FilteredPieChart
                    filteredTransactions={filteredTransactions}
                  />
                </div>
                <div className="w-[60%] h-auto">
                  <FilteredBarChart
                    filteredTransactions={filteredTransactions}
                  />
                </div>
              </div>

              <div>
                <SecondFilteredBarChart
                  filteredTransactions={filteredTransactions}
                />
              </div>

              <div className="h-[40%] flex space-x-2 ">
                {/* 📊 Graphique LineChart bien séparé */}
                <div className="w-[100%] min-h-[300px] h-auto">
                  <FilteredLineChart
                    filteredTransactions={filteredTransactions}
                    setBenefice={setBenefice}
                  />
                </div>
              </div>
              <div className="flex space-x-2 h-auto">
                <div className="w-[70%] h-auto transition-all duration-300 ease-in-out ${isBlurred ? 'blur-md' : ''}">
                  <FilteredComments
                    sessionBacktestId={sessionBacktestId}
                    refreshComments={refreshComments}
                  />
                </div>

                <div className="w-[30%] h-auto flex flex-col items-center">
                  <div className="w-full h-full p-2 bg-gray-200 dark:bg-gray-900 rounded-2xl flex flex-col justify-between items-center">
                    <div className="w-full h-auto flex-grow overflow-hidden">
                      <table className="w-full h-auto border-collapse border border-gray-300 dark:border-gray-700 text-xs rounded-2xl overflow-hidden text-gray-800 dark:text-gray-100 font-extralight">
                        <thead>
                          <tr className="bg-gray-200 dark:bg-gray-700 rounded-t-2xl">
                            <th className="p-2 first:rounded-tl-2xl last:rounded-tr-2xl">
                              Actif
                            </th>
                            <th className="p-2">Date d'entrée</th>
                            <th className="p-2 last:rounded-tr-2xl">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentTransactions.map((transaction, index) => (
                            <tr
                              key={transaction.id}
                              className={`bg-gray-100 dark:bg-gray-800 ${
                                index === currentTransactions.length - 1
                                  ? "last:rounded-b-2xl"
                                  : ""
                              }`}
                            >
                              <td className="p-4 text-center">
                                {transaction.nom_actif}
                              </td>
                              <td className="p-4 text-center">
                                {transaction.date_entree.toLocaleString()}
                              </td>

                              <td className="p-3 text-center">
                                {/* 🗑️ Icône de suppression */}
                                <button
                                  onClick={() =>
                                    handleDeleteTransaction(transaction.id)
                                  }
                                  className="text-red-500 hover:text-red-700 flex items-center justify-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    class="bi bi-trash"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* ✅ Pagination bien encadrée */}
                    {filteredTransactions.length > transactionsPerPage && (
                      <div className="flex text-xs justify-center space-x-4 mt-2 w-full py-2 bg-gray-200 dark:bg-gray-800 rounded-2xl">
                        <button
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === 1
                              ? "bg-gray-400 flex justify-center items-center"
                              : "bg-blue-500 hover:bg-blue-700 flex justify-center items-center"
                          } text-white flex justify-center items-center`}
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                        >
                          ◀
                        </button>
                        <span className="text-gray-900 dark:text-white flex justify-center items-center font-extralight text-sm">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          className={`px-4 rounded-lg ${
                            currentPage === totalPages
                              ? "bg-gray-400"
                              : "bg-blue-500 hover:bg-blue-700"
                          } text-white flex justify-center items-center`}
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          ▶
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 h-auto">
                <div className="w-1/3 h-auto flex">
                  <TradingMetrics1
                    filteredTransactions={filteredTransactions}
                  />
                </div>
                <div className="w-1/3 h-auto flex">
                  <TimeMetrics filteredTransactions={filteredTransactions} />
                </div>
                <div className="w-1/3 h-auto flex">
                  <RiskManagementMetrics
                    filteredTransactions={filteredTransactions}
                  />
                </div>
              </div>
              <div className="flex h-auto">
                <div className="h-auto rounded-lg">
                  <RiskAdjustedProjection
                    filteredTransactions={filteredTransactions}
                    capitalInitial={capital2}
                  />
                </div>
              </div>

              <div className="flex flex-col bg-gray-900  rounded-lg">
                <div className="ml-2 mt-2 text-gray-900 dark:text-white">
                  Trade raté
                </div>
                <div className="w-full mb-2 overflow-x-auto">
                  <FilteredTransactionsPhotos
                    sessionBacktestId={sessionBacktestId}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
