import React, { useState } from "react";

const AddComments = ({ sessionBacktestId, showAlert, setIsBlurred, setRefreshComments }) => {

  const [newObservation, setNewObservation] = useState("");

  const handleAddObservation = async () => {
    if (!newObservation.trim()) {
      showAlert("Le commentaire ne peut pas être vide.", "error");
      return;
    }
  
    try {
      setIsBlurred(true); // 🔹 Étape 1 : Activation immédiate du blur
      const response = await fetch("http://localhost:5001/api/observations/addObservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionBacktestId, contenu: newObservation }),
      });
  
      if (!response.ok) throw new Error("Erreur lors de l'ajout du commentaire.");
  
      showAlert("Commentaire ajouté avec succès !", "success");
      setNewObservation(""); // ✅ Reset du champ texte
  
      setTimeout(() => {
        setRefreshComments(prev => !prev); // 🔹 Étape 2 : Mettre à jour `FilteredComments`
      }, 1000);
  
      setTimeout(() => {
        setIsBlurred(false); // 🔹 Étape 3 : Désactiver le blur après 2s
      }, 2000);
  
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout de l'observation :", error);
      showAlert("Erreur lors de l'ajout du commentaire.", "error");
      setIsBlurred(false);
    }
  };
  

  return (
    <div className="relative w-auto h-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-2xl flex flex-col px-2 py-4">
      <div className="mb-4 text-lg">Message à moi-même</div>
      
      <div className="flex space-x-2">
        <div className="w-full">
            <textarea
                value={newObservation}
                onChange={(e) => setNewObservation(e.target.value)}
                className="w-full text-black p-2 text-xs border rounded-lg resize-none h-24 font-extralight"
                placeholder="Ajouter un commentaire..."
            />

            <button
                onClick={handleAddObservation}
                className="bg-cyan-600 text-white text-xs p-2 rounded-lg hover:bg-cyan-700 font-extralight"
            >
                Ajouter
            </button>
        </div>

      </div>
    </div>
  );
};

export default AddComments;
