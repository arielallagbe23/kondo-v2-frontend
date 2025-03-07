import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const JournalTrading = () => {
  const [transaction, setTransaction] = useState({
    actif_id: "",
    strategie_id: "",
    type_ordre_id: "",
    date_entree: "",
    rrp: "",
    risque: "0.5",
  });

  const [sessionBacktestId, setSessionBacktestId] = useState(""); // ✅ Stocke l'ID de la session backtest
  const [sessionBacktestTitre, setSessionBacktestTitre] = useState(""); // ✅ Stocke le titre de la session backtest
  const [transactionsEnCours, setTransactionsEnCours] = useState([]); // ✅ Nouvel état pour les transactions en cours
  const [transactionEnModification, setTransactionEnModification] =
    useState(null);
  const [resultats, setResultats] = useState([]);

  const [options, setOptions] = useState({
    actifs: [],
    typesOrdres: [],
  });
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });

  // ✅ Affichage des notifications
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 5000);
  };

  // ✅ Fetch des options générales (actifs, types d'ordres)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [actifs, typesOrdres] = await Promise.all([
          axios.get("http://localhost:5001/api/actifs"),
          axios.get("http://localhost:5001/api/types-ordres"),
        ]);

        setOptions({
          actifs: actifs.data,
          typesOrdres: typesOrdres.data,
        });
      } catch (error) {
        console.error("❌ Erreur lors du chargement des options :", error);
      }
    };

    fetchOptions();
  }, []);

  // ✅ Fetch des stratégies avec Token
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

  // ✅ Fetch de la session backtest avec status "journal_trading" et actif sélectionné
  useEffect(() => {
    const fetchSessionBacktest = async () => {
      if (!transaction.actif_id) return;

      try {
        const response = await axios.get(
          `http://localhost:5001/api/sessions/session-backtest/${transaction.actif_id}`
        );

        if (response.status === 200 && response.data) {
          setSessionBacktestId(response.data.id); // ✅ On récupère l'ID de la session
          setSessionBacktestTitre(response.data.titre); // ✅ On récupère le titre de la session
        } else {
          setSessionBacktestId(""); // Réinitialiser si aucune session trouvée
          setSessionBacktestTitre("");
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération de la session :",
          error
        );
        setSessionBacktestId(""); // En cas d'erreur, on réinitialise
        setSessionBacktestTitre("");
      }
    };

    fetchSessionBacktest();
  }, [transaction.actif_id]);

  // ✅ Gestion des champs du formulaire
  const handleChange = (e) => {
    setTransaction({ ...transaction, [e.target.name]: e.target.value });
  };

  // ✅ Fonction d'envoi des transactions
  const handleSubmit = async () => {
    console.log("🚀 Début de handleSubmit");

    // Vérifier si tous les champs requis sont remplis
    const { actif_id, strategie_id, type_ordre_id, date_entree, rrp, risque } =
      transaction;
    if (
      !actif_id ||
      !strategie_id ||
      !type_ordre_id ||
      !date_entree ||
      !rrp ||
      !risque ||
      !sessionBacktestId
    ) {
      console.warn("❌ Le formulaire n'est pas valide !");
      showAlert(
        "Veuillez remplir tous les champs avant de soumettre.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token"); // 🔥 Vérifier le token
      const user_id = localStorage.getItem("user_id");

      if (!token || !user_id) {
        console.error("❌ Utilisateur non authentifié !");
        showAlert("Utilisateur non authentifié !", "error");
        setLoading(false);
        return;
      }

      // ✅ Formatage de la date pour MySQL
      const formattedDate = new Date(date_entree)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // ✅ Création de l'objet transaction
      const transactionData = {
        user_id,
        session_backtest_id: sessionBacktestId,
        actif_id,
        strategie_id,
        type_ordre_id,
        timeframe_id: 1, // 🔹 Mettre une valeur par défaut (ex: 1)
        resultat_id: 5, // ✅ Utiliser l'ID correspondant dans la BDD
        date_entree: formattedDate,
        rrp,
        risque,
        status: "en_cours", // ✅ Toujours en cours
      };

      console.log("📤 Données envoyées :", transactionData);

      await axios.post(
        "http://localhost:5001/api/transactions/addTransactions",
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showAlert("Transaction ajoutée avec succès !", "success");
      await fetchTransactions();

      // ✅ Réinitialisation du formulaire
      setTransaction({
        actif_id: "",
        strategie_id: "",
        type_ordre_id: "",
        date_entree: "",
        rrp: "",
        risque: "0.5",
      });

      setLoading(false);
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'ajout de la transaction :",
        error.message || error
      );
      showAlert("Une erreur s'est produite. Veuillez réessayer.", "error");
      setLoading(false);
    }
  };

  // ✅ Récupération des transactions en cours
  useEffect(() => {
    const fetchTransactionsEnCours = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ Erreur : Jeton non disponible !");
          return;
        }

        const response = await axios.get(
          "http://localhost:5001/api/transactions/transactions-en-cours",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          setTransactionsEnCours(response.data);
        } else {
          console.error(
            "❌ Erreur lors de la récupération des transactions :",
            response.status
          );
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des transactions :",
          error
        );
      }
    };

    fetchTransactionsEnCours();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ Erreur : Jeton non disponible !");
        return;
      }

      const response = await axios.get(
        "http://localhost:5001/api/transactions/transactions-en-cours",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setTransactionsEnCours(response.data);
      } else {
        console.error(
          "❌ Erreur lors de la récupération des transactions :",
          response.status
        );
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des transactions :",
        error
      );
    }
  };

  // ✅ Appel au chargement de la page
  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDeleteTransaction = async (transactionId) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")
    ) {
      return;
    }

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
        // ✅ Mise à jour de la liste des transactions après suppression
        setTransactionsEnCours((prev) =>
          prev.filter((trx) => trx.id !== transactionId)
        );
        await fetchTransactions();
      } else {
        showAlert("Erreur lors de la suppression de la transaction.", "error");
      }
    } catch (error) {
      console.error("⚠️ Erreur lors de la suppression :", error);
      showAlert("Une erreur s'est produite.", "error");
    }
  };

  const handleUpdateTransaction = async (transactionId, selectedResult) => {
    try {
      if (!selectedResult) {
        showAlert("Veuillez sélectionner un résultat.", "warning");
        return;
      }
  
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ Utilisateur non authentifié !");
        showAlert("Utilisateur non authentifié !", "error");
        return;
      }
  
      const resultatId = parseInt(selectedResult, 10);
      if (isNaN(resultatId)) {
        console.error("❌ Valeur invalide pour le resultat_id :", selectedResult);
        showAlert("Valeur invalide pour le résultat.", "error");
        return;
      }
  
      const response = await fetch(
        `http://localhost:5001/api/transactions/updateTransaction/${transactionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "cloturé",
            resultat_id: resultatId,
          }),
        }
      );
  
      if (!response.ok) {
        const errorMessage = await response.json();
        console.error("❌ Erreur API :", errorMessage);
        showAlert("Erreur lors de la mise à jour de la transaction.", "error");
        return;
      }
  
      showAlert("Transaction clôturée avec succès !", "success");
  
      // ✅ Mise à jour locale du tableau après modification
      setTransactionsEnCours((prev) =>
        prev.map((trx) =>
          trx.id === transactionId
            ? { ...trx, status: "clôturé", resultat: resultats.find(res => res.id === resultatId)?.resultat || "Inconnu" }
            : trx
        )
      );
  
      await fetchTransactions(); // 🔥 Recharge les transactions depuis le backend
    } catch (error) {
      console.error("⚠️ Erreur lors de la mise à jour :", error);
      showAlert("Une erreur s'est produite.", "error");
    } finally {
      setTransactionEnModification(null); // ✅ Ferme le select même en cas d'erreur
    }
  };
  

  useEffect(() => {
    const fetchResultats = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/resultats");
        if (!response.ok) throw new Error("Erreur lors du fetch des résultats");
        const data = await response.json();
        setResultats(data); // Stocker les résultats
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des résultats :",
          error
        );
      }
    };

    fetchResultats();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // ✅ Nombre d'éléments par page

  // ✅ Calculer les transactions visibles selon la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactionsEnCours.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // ✅ Fonction pour changer de page
  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= Math.ceil(transactionsEnCours.length / itemsPerPage)
    ) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex h-auto space-x-4 w-[95%] mt-10 mb-20 ">
      <div className="py-8 px-4 bg-gray-100 dark:bg-gray-900 rounded-2xl w-[30%] h-full">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Ajouter une Transaction
        </h2>

        {alert.message && (
          <div
            className={`p-2 text-sm ${
              alert.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white rounded mb-4`}
          >
            {alert.message}
          </div>
        )}

        <form className="space-y-3">
          <div className="flex space-x-4">
            <select
              name="actif_id"
              value={transaction.actif_id}
              onChange={handleChange}
              className="w-1/3 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">actif</option>
              {options.actifs.map((actif) => (
                <option key={actif.id} value={actif.id}>
                  {actif.nom_actif}
                </option>
              ))}
            </select>

            <select
              name="strategie_id"
              value={transaction.strategie_id}
              onChange={handleChange}
              className="w-1/3 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">stratégie</option>
              {strategies.map((strategie) => (
                <option key={strategie.id} value={strategie.id}>
                  {strategie.nom_strategie}
                </option>
              ))}
            </select>
            <select
              name="type_ordre_id"
              value={transaction.type_ordre_id}
              onChange={handleChange}
              className="w-1/3 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">type d'ordre</option>
              {options.typesOrdres.map((ordre) => (
                <option key={ordre.id} value={ordre.id}>
                  {ordre.type_ordre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4">
            {/* ✅ RRP (Risk Reward Ratio) */}
            <input
              type="number"
              name="rrp"
              placeholder="RRP (ex: 2.5)"
              value={transaction.rrp}
              onChange={handleChange}
              className="w-1/5 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />

            {/* ✅ Risque */}
            <input
              type="number"
              name="risque"
              placeholder="Risque (%)"
              value={transaction.risque}
              onChange={handleChange}
              className="w-1/5 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />

            <input
              type="datetime-local"
              name="date_entree"
              value={transaction.date_entree}
              onChange={handleChange}
              className="w-3/5 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <input
              type="text"
              value={sessionBacktestTitre}
              readOnly
              className="w-full p-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full p-2 text-white rounded ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"}`}
          >
            {loading ? "Envoi..." : "Ajouter Transaction"}
          </button>
        </form>
      </div>

      <div className="w-[70%]">
        <div className="py-8 px-4 bg-gray-100 dark:bg-gray-900 rounded-2xl h-[600px]">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Transactions en cours
          </h2>

          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2">Actif</th>
                <th className="px-4 py-2">Stratégie</th>
                <th className="px-4 py-2">Type d'ordre</th>
                <th className="px-4 py-2">Date entrée</th>
                <th className="px-4 py-2">RRP</th>
                <th className="px-4 py-2">Risque</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Resultat</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length > 0 ? (
                currentTransactions.map((t) => (
                  <tr key={t.id} className="border-b dark:border-gray-700">
                    <td className="px-4 py-2">{t.nom_actif}</td>
                    <td className="px-4 py-2">{t.nom_strategie}</td>
                    <td className="px-4 py-2">{t.type_ordre}</td>
                    <td className="px-4 py-2">
                      {t.date_entree
                        ? format(
                            new Date(t.date_entree),
                            "EEEE dd MMMM à HH'h'mm",
                            { locale: fr }
                          )
                        : "Date inconnue"}
                    </td>
                    <td className="px-4 py-2">{t.rrp}</td>
                    <td className="px-4 py-2">{t.risque}%</td>
                    <td className="px-4 py-2 text-yellow-500">{t.status}</td>
                    <td className="px-4 py-2">
  {transactionEnModification === t.id ? (
    <select
      className="p-1 bg-gray-800 text-white rounded"
      value={t.resultat_id} // 🔥 Utiliser l'ID du résultat
      onChange={(e) => handleUpdateTransaction(t.id, e.target.value)}
      onBlur={() => setTransactionEnModification(null)} // Ferme le select après modification
    >
      <option value="">Sélectionner un résultat</option>
      {resultats.map((res) => (
        <option key={res.id} value={res.id}>
          {res.resultat}
        </option>
      ))}
    </select>
  ) : (
    t.resultat || "Aucun" // Affiche le texte normal si pas en édition
  )}
</td>

                    <td className="px-4 py-2 space-x-3">
                      <div className="flex space-x-4">
                        {/* Bouton de suppression */}
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteTransaction(t.id)}
                        >
                          🗑
                        </button>
                        {/* Bouton de modification */}
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => setTransactionEnModification(t.id)}
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-2 text-center text-gray-500"
                  >
                    Aucune transaction en cours
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            ⬅️ Précédent
          </button>

          <span className="text-gray-700 dark:text-white">
            Page {currentPage} sur{" "}
            {Math.ceil(transactionsEnCours.length / itemsPerPage)}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={
              currentPage ===
              Math.ceil(transactionsEnCours.length / itemsPerPage)
            }
            className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            Suivant ➡️
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalTrading;
