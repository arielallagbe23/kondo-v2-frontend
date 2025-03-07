import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

// ✅ Enregistrement des éléments nécessaires pour Pie Chart
ChartJS.register(ArcElement, Tooltip, Legend);

const FilteredPieChart = ({ filteredTransactions }) => {
  if (!filteredTransactions.length) {
    return <p className="text-center text-gray-500">Aucune transaction trouvée.</p>;
  }

  // 🔹 Comptage des types de résultats
  const resultCounts = {
    BE: filteredTransactions.filter((t) => t.resultat_id === 1).length,
    SL: filteredTransactions.filter((t) => t.resultat_id === 2).length,
    TP: filteredTransactions.filter((t) => t.resultat_id === 3).length,
    SLTP: filteredTransactions.filter((t) => t.resultat_id === 4).length,
  };

  // 🔹 Données pour le Pie Chart
  const pieData = {
    labels: ["Break Even (BE)", "Stop Loss (SL)", "Take Profit (TP)", "SL->TP"],
    datasets: [
      {
        data: [resultCounts.BE, resultCounts.SL, resultCounts.TP, resultCounts.SLTP],
        backgroundColor: ["#FFC107", "rgb(255, 0, 102)", "rgb(0, 230, 230)", "#8A2BE2"],
        hoverBackgroundColor: ["#FFD54F", "rgb(255, 77, 133)", "rgb(77, 255, 255)", "#9A2BE2"],
        borderColor: ["#CCCCCC", "#CCCCCC", "#CCCCCC", "#CCCCCC"], // ✅ Bordures gris clair
        borderWidth: 1, // ✅ Bordure fine
        hoverBorderWidth: 2, // ✅ Bordure plus visible au survol
      },
    ],
  };

  // 🔹 Options du graphique
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // ✅ Empêche le re-render infini
    plugins: {
      legend: { display: false }, // ❌ Supprime la légende (labels en bas)
      tooltip: { enabled: true }, // ✅ Active les tooltips au survol
    },
  };

  return (
    <div className="w-full h-[300px] flex justify-center items-center p-4">
      <Pie data={pieData} options={pieOptions} />
    </div>
  );
};

export default FilteredPieChart;
