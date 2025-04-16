import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importer useNavigate
import AddTransaction from "./AddTransaction";
import Visualisation from "./Visualisation";
import { ClipLoader } from "react-spinners";

const BackTestingSession = () => {
  const [sessions, setSessions] = useState([]);
  const [groupedSessions, setGroupedSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [capital2, setCapital2] = useState(0);
  const [observations, setObservations] = useState({});
  const [newObservation, setNewObservation] = useState({});
  const [loadingObservations, setLoadingObservations] = useState({});
  const [actifs, setActifs] = useState([]);

  const navigate = useNavigate(); // Initialiser useNavigate

  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({
    titre: "",
    objet: "",
    date_debut: new Date().toISOString().split("T")[0], // Date actuelle format YYYY-MM-DD
    capital: "",
    actif_id: "",
    decision: "",
  });
  const [loadingAddSession, setLoadingAddSession] = useState(false);

  const fetchActifs = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/actifs");
      if (!response.ok) throw new Error("Échec de la récupération des actifs");

      const data = await response.json();
      setActifs(data);
      console.log("📌 Actifs récupérés :", data);
    } catch (err) {
      console.error("❌ Erreur de récupération des actifs :", err);
    }
  };

  // Appel automatique de fetchActifs au montage
  useEffect(() => {
    fetchActifs();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/connexion");
        return;
      }

      const response = await fetch(
        "http://localhost:5001/api/users/sessions-backtest",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error("Échec de la récupération des sessions");

      const data = await response.json();
      console.log("📌 Sessions récupérées :", data);

      const sortedSessions = data.sort((a, b) =>
        a.nom_actif.localeCompare(b.nom_actif)
      );

      // Grouper les sessions par nom_actif
      const grouped = sortedSessions.reduce((acc, session) => {
        if (!acc[session.nom_actif]) acc[session.nom_actif] = [];
        acc[session.nom_actif].push(session);
        return acc;
      }, {});

      setSessions(sortedSessions);
      setGroupedSessions(grouped);

      // ✅ Récupérer les observations pour chaque session
      sortedSessions.forEach((session) => {
        fetchObservations(session.id);
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 📌 Appel initial des sessions lors du montage du composant
  useEffect(() => {
    fetchSessions();
  }, [navigate]);

  const handleAddSession = async () => {
    if (!newSession.titre || !newSession.capital || !newSession.actif_id) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
  
    setLoadingAddSession(true);
  
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(
        "http://localhost:5001/api/sessions/addSession",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newSession,
            date_debut: new Date().toISOString().split("T")[0], // 🔥 Forcer la date à aujourd’hui
          }),
        }
      );
  
      if (!response.ok)
        throw new Error("Erreur lors de l'ajout de la session.");
  
      const data = await response.json();
      console.log("✅ Nouvelle session ajoutée :", data);
  
      await fetchSessions();
      setNewSession({
        titre: "",
        objet: "",
        date_debut: new Date().toISOString().split("T")[0], // Toujours "now"
        capital: "",
        actif_id: "",
        decision: "",
      });
      setShowAddSession(false);
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout :", error);
    } finally {
      setLoadingAddSession(false);
    }
  };
  

  const handleDeleteSession = async (sessionId) => {
    if (
      !window.confirm(
        "⚠️ Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/sessions/deleteSession/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Erreur lors de la suppression.");

      console.log("🗑️ Session supprimée avec succès :", data);

      // 🔄 Rafraîchir la liste des sessions après suppression
      await fetchSessions();
    } catch (error) {
      console.error("❌ Erreur lors de la suppression :", error);
      alert("Une erreur est survenue lors de la suppression.");
    }
  };

  // 📌 Fonction pour récupérer les observations et les stocker dans le state
  const fetchObservations = async (sessionId) => {
    try {
      console.log(
        `📡 Récupération des observations pour la session ID: ${sessionId}...`
      );

      const response = await fetch(
        `http://localhost:5001/api/observations/observations/${sessionId}`
      );

      if (!response.ok)
        throw new Error("⚠️ Erreur lors de la récupération des observations");

      const data = await response.json();
      console.log(
        `✅ Observations reçues pour la session ${sessionId} :`,
        data
      );

      // ✅ Mettre à jour le state avec les observations
      setObservations((prev) => ({
        ...prev,
        [sessionId]: data, // Associe les observations à leur session correspondante
      }));
    } catch (error) {
      console.error(
        `❌ Erreur de récupération des observations pour la session ${sessionId} :`,
        error
      );
    }
  };

  const handleDeleteObservation = async (sessionId, observationId) => {
    // Active le Spinner uniquement pour cette session
    setLoadingObservations((prev) => ({
      ...prev,
      [sessionId]: true,
    }));

    try {
      console.log(
        `🗑️ Suppression de l'observation ID: ${observationId} pour la session ${sessionId}...`
      );

      const response = await fetch(
        `http://localhost:5001/api/observations/deleteObservation/${observationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error("⚠️ Erreur lors de la suppression de l'observation");

      setTimeout(() => {
        setObservations((prev) => ({
          ...prev,
          [sessionId]: prev[sessionId].filter(
            (obs) => obs.id !== observationId
          ),
        }));

        // Désactive le Spinner uniquement pour cette session
        setLoadingObservations((prev) => ({
          ...prev,
          [sessionId]: false,
        }));
      }, 3000);
    } catch (error) {
      console.error(
        `❌ Erreur lors de la suppression de l'observation ${observationId} :`,
        error
      );
      setLoadingObservations((prev) => ({
        ...prev,
        [sessionId]: false,
      }));
    }
  };

  useEffect(() => {
    if (selectedSession) {
      console.log(
        "🔍 Valeur originale de `capital` dans `selectedSession` :",
        selectedSession.capital,
        "Type :",
        typeof selectedSession.capital
      );

      let convertedCapital = selectedSession.capital
        ? parseFloat(selectedSession.capital) // ✅ Convertir correctement en nombre
        : 0; // Valeur par défaut si vide

      setCapital2(convertedCapital);
      console.log(
        "💰 Capital après conversion :",
        convertedCapital,
        "Type :",
        typeof convertedCapital
      );
    }
  }, [selectedSession]);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">
        Chargement des sessions de backtest...
      </p>
    );
  if (error)
    return <p className="text-center text-red-500 mt-10">Erreur : {error}</p>;

  return (
    <div className="flex flex-col w-full mb-40 ">
      {viewMode ? (
        <div className="w-auto h-full">
          <button
            className="p-4 mb-3 font-extralight bg-white dark:bg-gray-900 text-black dark:text-white rounded-2xl hover:bg-gray-600"
            onClick={() => setViewMode(null)}
          >
            Retour
          </button>

          <div className="w-[98%] ">
            {viewMode === "addTransaction" && (
              <AddTransaction
                sessionBacktestId={selectedSession.id}
                sessionBacktestTitre={selectedSession.titre}
                sessionDetails={selectedSession}
                actifId={selectedSession.actif_id}
                capital2={capital2}
              />
            )}

            {viewMode === "visualisation" && (
              <Visualisation
                sessionBacktestId={selectedSession.id}
                capital={capital2}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="w-full">
          <button
            onClick={() => setShowAddSession(true)}
            className="p-3 mb-8 bg-cyan-600 text-sm  text-white font-extralight rounded-lg hover:bg-cyan-700 transition"
          >
            Ajouter une session
          </button>

          {showAddSession && (
            <div className="w-[50%] bg-gray-200 dark:bg-gray-900 p-4 rounded-lg mb-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Nouvelle session
              </h3>

              <div className="">
                <div className="space-x-2 flex">
                  {/* Titre et Objet en colonne */}
                  <input
                    type="text"
                    placeholder="Titre"
                    value={newSession.titre}
                    onChange={(e) =>
                      setNewSession({ ...newSession, titre: e.target.value })
                    }
                    className="w-full p-2 mb-2 border font-extralight text-xs rounded text-black bg-gray-300"
                  />
                  <input
                    type="text"
                    placeholder="Objet"
                    value={newSession.objet}
                    onChange={(e) =>
                      setNewSession({ ...newSession, objet: e.target.value })
                    }
                    className="w-full p-2 mb-2 border font-extralight text-xs rounded text-black bg-gray-300"
                  />
                </div>
                {/* Date, Capital et Actif sur la même ligne */}
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Capital"
                    value={newSession.capital}
                    onChange={(e) =>
                      setNewSession({ ...newSession, capital: e.target.value })
                    }
                    className="w-1/3 p-2 border font-extralight text-xs rounded text-black bg-gray-300"
                  />
                  <select
                    value={newSession.actif_id}
                    onChange={(e) =>
                      setNewSession({ ...newSession, actif_id: e.target.value })
                    }
                    className="w-1/3 p-2 border font-extralight text-xs rounded text-black bg-gray-300"
                  >
                    <option value="">Sélectionner un actif</option>
                    {actifs.map((actif) => (
                      <option key={actif.id} value={actif.id}>
                        {actif.nom_actif}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newSession.status}
                    onChange={(e) =>
                      setNewSession({ ...newSession, status: e.target.value })
                    }
                    className="w-1/3 p-2 border font-extralight text-xs rounded text-black bg-gray-300"
                  >
                    <option value="backtest">Backtest</option>
                    <option value="journal_trading">Journal de trading</option>
                  </select>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => setShowAddSession(false)}
                  className="p-2 bg-red-500 text-white text-xs font-light rounded hover:bg-red-700 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddSession}
                  className="p-2 bg-cyan-600 text-white text-xs font-light rounded hover:bg-cyan-700 transition"
                >
                  {loadingAddSession ? "Ajout en cours..." : "Ajouter"}
                </button>
              </div>
            </div>
          )}

          {Object.keys(groupedSessions).map((actif) => (
            <div key={actif} className="mb-10">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {actif}
              </div>

              {/* 📌 Grid layout pour aligner les sessions par ligne */}
              <div className="grid grid-cols-4 gap-6 w-[95%]">
                {groupedSessions[actif].map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-white dark:bg-gray-900 rounded-lg cursor-pointer flex flex-col justify-between shadow-md"
                  >
                    {/* 📌 Contenu Session */}
                    <div className="p-2">
                      <h2 className="text-xl pb-2 font-semibold text-gray-900 dark:text-white">
                        {session.titre}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-2 font-extralight text-xs">
                        {session.objet}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
                        📅 Début :{" "}
                        {new Date(session.date_debut).toLocaleDateString()}
                      </p>
                    </div>

                    {/* 📌 Section Boutons */}
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        className="p-2 bg-cyan-600 text-white text-xs font-extralight rounded-md hover:bg-cyan-700 transition w-1/5 flex justify-center items-center"
                        onClick={() => {
                          setSelectedSession(session);
                          setViewMode("addTransaction");
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-bar-chart-line"
                          viewBox="0 0 16 16"
                        >
                          <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1zm1 12h2V2h-2zm-3 0V7H7v7zm-5 0v-3H2v3z" />
                        </svg>
                      </button>

                      <button
                        className="p-2 bg-red-600 text-white text-xs font-extralight rounded-md hover:bg-red-800 transition w-1/5 flex justify-center items-center"
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-trash"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BackTestingSession;
