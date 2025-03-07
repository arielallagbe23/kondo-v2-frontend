import React, { useEffect, useState, useRef } from "react";

const Quote = ({ sessionBacktestId }) => {
  const [observations, setObservations] = useState([]);
  const [currentObservation, setCurrentObservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [fontSize, setFontSize] = useState("text-base"); // Taille de texte dynamique
  const quoteRef = useRef(null); // Référence pour mesurer le texte

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        console.log(`📡 Récupération des observations pour la session ID: ${sessionBacktestId}...`);
        const response = await fetch(`http://localhost:5001/api/observations/observations/${sessionBacktestId}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des observations");

        const data = await response.json();
        setObservations(data);
        console.log("✅ Observations récupérées :", data);

        if (data.length > 0) {
          setCurrentObservation(data[0]); // Affiche le premier commentaire
          setIndex(0);
        }
      } catch (error) {
        console.error("❌ Erreur récupération observations :", error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionBacktestId) fetchObservations();
  }, [sessionBacktestId]);

  useEffect(() => {
    if (observations.length > 1) {
      const interval = setInterval(() => {
        setIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % observations.length;
          setCurrentObservation(observations[newIndex]); // Change de commentaire
          return newIndex;
        });
      }, 30000); // ⏳ Change toutes les 30 secondes

      return () => clearInterval(interval); // Nettoyage de l'intervalle
    }
  }, [observations]);

  useEffect(() => {
    // 🎯 Ajustement de la taille du texte en fonction du contenu
    if (quoteRef.current) {
      const length = currentObservation?.contenu?.length || 0;
      
      if (length < 50) {
        setFontSize("text-xl");
      } else if (length < 100) {
        setFontSize("text-lg");
      } else if (length < 200) {
        setFontSize("text-base");
      } else {
        setFontSize("text-sm");
      }
    }
  }, [currentObservation]);

  return (
    <div className="h-32 flex flex-col bg-gray-900 rounded-lg p-2 px-4">
        <div className="text-xl text-black dark:text-gray-300 font-bold mb-2">Observation</div>
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
        {loading ? (
          <p className="text-gray-400">Chargement...</p>
        ) : currentObservation ? (
          <p ref={quoteRef} className={`text-white text-center ${fontSize} px-2`}>
            " {currentObservation.contenu} "
          </p>
        ) : (
          <p className="text-sm italic text-gray-400">Aucune observation disponible.</p>
        )}
      </div>
    </div>
  );
};

export default Quote;
