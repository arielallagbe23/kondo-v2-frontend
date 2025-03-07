import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

const FilteredComments = ({ sessionBacktestId, onAddObservation, refreshComments  }) => {
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [newObservation, setNewObservation] = useState("");
  const [isBlurred, setIsBlurred] = useState(false);


  useEffect(() => {
    const fetchObservations = async () => {
      try {
        console.log(`📡 Récupération des observations pour la session ID: ${sessionBacktestId}...`);
  
        const response = await fetch(`http://localhost:5001/api/observations/observations/${sessionBacktestId}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des observations");
  
        const data = await response.json();
        setObservations(data);
        console.log("✅ Observations récupérées :", data);
      } catch (error) {
        console.error("❌ Erreur récupération observations :", error);
      } finally {
        setLoading(false);
      }
    };
  
    if (sessionBacktestId) fetchObservations();
  }, [sessionBacktestId, refreshComments]); // 🔥 Dépendance ajoutée pour recharger après l'ajout
  

  // 📌 Supprimer une observation
  const handleDeleteObservation = async (observationId) => {
    setLoadingDelete(true);
    try {
      console.log(`🗑️ Suppression de l'observation ID: ${observationId}...`);

      const response = await fetch(`http://localhost:5001/api/observations/deleteObservation/${observationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      setObservations(observations.filter((obs) => obs.id !== observationId));

      console.log(`✅ Observation ID: ${observationId} supprimée avec succès.`);
    } catch (error) {
      console.error("❌ Erreur suppression observation :", error);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-900 rounded-2xl p-2">
      <div className="text-lg font-bold text-gray-900 dark:text-white">Notes</div>

      {/* Loader si en chargement */}
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <ClipLoader color="#4A90E2" size={30} />
        </div>
      ) : (
        
        <div className="space-y-2 overflow-auto h-full py-4">
          {observations.length > 0 ? (
            observations.map((obs) => (
              <div key={obs.id} className="relative p-2 text-black dark:text-gray-300 bg-gray-200 dark:bg-gray-800 rounded-md">
                <span className="text-xs font-extralight px-4 block">{obs.contenu}</span>
                <button
                  onClick={() => handleDeleteObservation(obs.id)}
                  className="absolute top-1 right-1 text-red-500 text-[6px] bg-red-300 hover:bg-red-400 font-bold rounded rounded-tr-md w-3 h-3 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm italic text-gray-500">Aucune observation pour cette session.</p>
          )}
        </div>

      )}
    </div>
  );
};

export default FilteredComments;
