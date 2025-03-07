import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ✅ Enregistrement des modules nécessaires
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FilteredLineChart = ({ filteredTransactions }) => {
  if (!filteredTransactions.length) {
    return <p className="text-center text-gray-500">Aucune transaction trouvée.</p>;
  }

  // 🔹 Trier les transactions par `date_entree`
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(a.date_entree) - new Date(b.date_entree)
  );

  // 🔹 Fonction pour calculer l'évolution du PNL cumulatif
  let cumulativePnl = 0;
  const lineChartPnlDataPoints = sortedTransactions.map((transaction) => {
    const { resultat_id, risque, rrp, date_entree } = transaction;
    let pnl = 0;

    if (resultat_id === 2) pnl = -risque; // Stop Loss
    else if (resultat_id === 1) pnl = 0; // Break Even
    else if (resultat_id === 3 || resultat_id === 4) pnl = risque * rrp; // Take Profit

    cumulativePnl += pnl;

    return {
      x: new Date(date_entree).toISOString(), // ✅ Format propre pour éviter "Invalid Date"
      y: cumulativePnl,
    };
  });

  // 🔹 Préparation des données pour Chart.js
  const lineChartData = {
    labels: lineChartPnlDataPoints.map((point) =>
      new Date(point.x).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    ),
    datasets: [
      {
        label: "Évolution du PNL",
        data: lineChartPnlDataPoints.map((point) => point.y),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        pointRadius: 0, // ✅ Supprime les points pour un rendu plus fluide
        borderWidth: 2,
      },
    ],
  };

  // 🔹 Options du graphique
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context) => `Valeur cumulative : ${context.raw}` } },
    },
    scales: {
      x: {
        title: { display: true, text: "Date d'entrée des transactions" },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10, // ✅ Affichage plus propre des labels
          maxRotation: 0,
          minRotation: 0,
        },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Valeur cumulative" },
        ticks: { display: true },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="w-full h-full flex justify-center items-center bg-white dark:bg-gray-900 rounded-xl p-4">
      <Line data={lineChartData} options={lineChartOptions} />
    </div>
  );
};

export default FilteredLineChart;

