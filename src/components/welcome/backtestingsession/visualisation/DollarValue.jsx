import React, { useEffect, useState } from "react";
import axios from "axios";

const DollarValue = () => {
  const [rates, setRates] = useState({ XOF: null, EUR: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDollarValue = async () => {
      try {
        const response = await axios.get("https://open.er-api.com/v6/latest/USD");
        if (!response.data.rates) throw new Error("Données non disponibles");

        setRates({
          XOF: response.data.rates.XOF * 1000, // ✅ Conversion 1000 USD → XOF (Franc CFA)
          EUR: response.data.rates.EUR * 1000, // ✅ Conversion 1000 USD → EUR
        });

        setLoading(false);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du taux du dollar :", error);
        setError("Impossible de récupérer les taux du jour.");
        setLoading(false);
      }
    };

    fetchDollarValue();
  }, []); // ✅ Récupération des valeurs une seule fois (du jour)

  return (
    <div className="font-extralight bg-gray-900 text-white rounded-lg w-full ">

      <div className="text-xl text-black dark:text-gray-300 font-bold mt-2 ml-2">
        Money Value
      </div>

      <p className="text-sm text-white mt-2 ml-2">1000 dollars USD valent :</p>

      {loading ? (
        <p className="text-gray-400 mt-3 ml-2 animate-pulse">Chargement...</p>
      ) : error ? (
        <p className="text-red-400 mt-3">{error}</p>
      ) : (
        <div className="mt-3 flex ml-2">
          <p className="text-sm text-green-400 transition-all">
            {rates.EUR.toFixed(2)} €
          </p>
          <p className="text-sm transition-all mx-2"> ou </p>
          <p className="text-sm text-yellow-400 transition-all">
            {rates.XOF.toFixed(0)} XOF
          </p>
        </div>
      )}
    </div>
  );
};

export default DollarValue;
