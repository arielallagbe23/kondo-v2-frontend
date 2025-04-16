import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Enregistrement des éléments nécessaires pour Bar Chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OverwatchRiskManagement = ({ overwatchFilteredTransactions }) => {
  const [avgRisk, setAvgRisk] = useState(null);
  const [avgRR, setAvgRR] = useState(null);
  const [riskAdvice, setRiskAdvice] = useState("");
  const [rrAdvice, setRRAdvice] = useState("");

  useEffect(() => {
    if (!overwatchFilteredTransactions.length) return;

    const risks = overwatchFilteredTransactions.map((t) => parseFloat(t.risque));
    const avgRiskValue = risks.length > 0 ? risks.reduce((acc, val) => acc + val, 0) / risks.length : 0;
    setAvgRisk(avgRiskValue);

    const riskRewardRatios = overwatchFilteredTransactions.map((t) => parseFloat(t.rrp));
    const avgRRValue = riskRewardRatios.length > 0 ? riskRewardRatios.reduce((acc, val) => acc + val, 0) / riskRewardRatios.length : 0;
    setAvgRR(avgRRValue);

    switch (true) {
      case avgRiskValue < 0.5:
        setRiskAdvice("🛡️ Ton risque est bien maîtrisé ! Continue ainsi.");
        break;
      case avgRiskValue >= 0.5 && avgRiskValue < 1:
        setRiskAdvice("⚠️ Ton risque est modéré. Fais attention à ne pas trop exposer ton capital.");
        break;
      case avgRiskValue >= 1 && avgRiskValue < 2:
        setRiskAdvice("🚨 Tu risques une portion importante de ton capital. Pense à réduire ton risque.");
        break;
      case avgRiskValue >= 2:
        setRiskAdvice("❌ Risque trop élevé ! Tu risques de brûler ton compte rapidement.");
        break;
      default:
        setRiskAdvice("");
    }

    switch (true) {
      case avgRRValue < 1:
        setRRAdvice("⚠️ Ton R/R est trop faible. Essaye d'augmenter tes gains par rapport à tes pertes.");
        break;
      case avgRRValue >= 1 && avgRRValue < 2:
        setRRAdvice("🟡 Ton R/R est correct, mais il pourrait être optimisé.");
        break;
      case avgRRValue >= 2 && avgRRValue < 3:
        setRRAdvice("✅ Très bon R/R ! Tu maximises bien tes gains par rapport aux pertes.");
        break;
      case avgRRValue >= 3:
        setRRAdvice("🚀 Excellent ! Ton Risk-to-Reward Ratio est optimal. Continue comme ça !");
        break;
      default:
        setRRAdvice("");
    }
  }, [overwatchFilteredTransactions]);

  // 📊 Données du graphique en barres
  const barData = {
    labels: ["Risque Moyen (%)", "Risk-to-Reward Ratio"],
    datasets: [
      {
        label: "Valeurs",
        data: [avgRisk, avgRR],
        backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)"],
        borderRadius: { topLeft: 10, topRight: 10 }, // Arrondi en haut
        barThickness: 60, // Épaisseur des barres
      },
    ],
  };

  // 🎛 Options du graphique
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false }, // Suppression de la grille
        ticks: { padding: 10 }, // Décalage de l’axe X
      },
      y: {
        grid: { display: false }, // Suppression de la grille
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: Math.max(avgRisk, avgRR) + 1, // Décalage vers le haut
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="text-white rounded-lg w-full mx-auto h-full flex space-x-4">
      {/* 📊 Graphique à gauche */}
      <div className="w-1/2 h-auto flex items-center p-4 bg-gray-900 rounded-lg">
        <Bar data={barData} options={barOptions} />
      </div>

      {/* 📝 Informations et conseils à droite */}
      <div className="w-1/2 p-4 bg-gray-900 h-auto rounded-lg">
        <h2 className="text-lg font-bold mb-4">⚖️ Gestion du Risque</h2>

        {/* 🔹 Risque moyen par trade */}
        <div className="mt-2">
          <p className="text-sm text-gray-400">🔻 Risque moyen par trade :</p>
          {avgRisk !== null ? (
            <p className={`text-lg font-bold ${avgRisk > 1 ? "text-red-400" : "text-green-400"}`}>
              {avgRisk.toFixed(2)}% du capital
            </p>
          ) : (
            <p className="text-gray-400">Données insuffisantes</p>
          )}
        </div>

        {/* ✅ Conseil Risque */}
        {riskAdvice && (
          <div className="mt-3 p-3 bg-gray-700 rounded-lg text-sm text-yellow-300">
            💡 <strong>Conseil :</strong> {riskAdvice}
          </div>
        )}

        {/* 🔹 Risk-to-Reward Ratio moyen */}
        <div className="mt-4">
          <p className="text-sm text-gray-400">📈 Risk-to-Reward Ratio moyen :</p>
          {avgRR !== null ? (
            <p className={`text-lg font-bold ${avgRR < 1 ? "text-red-400" : "text-green-400"}`}>
              {avgRR.toFixed(2)}x
            </p>
          ) : (
            <p className="text-gray-400">Données insuffisantes</p>
          )}
        </div>

        {/* ✅ Conseil R/R */}
        {rrAdvice && (
          <div className="mt-3 p-3 bg-gray-700 rounded-lg text-sm text-yellow-300">
            💡 <strong>Conseil :</strong> {rrAdvice}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverwatchRiskManagement;
