import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// ✅ Enregistrement des éléments nécessaires pour Bar Chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FilteredBarChart = ({ filteredTransactions }) => {
  if (!filteredTransactions.length) {
    return <p className="text-center text-gray-500">Aucune transaction trouvée.</p>;
  }

  // 🔹 Fonction pour calculer les intervalles de temps
  const calculateInterval = (date) => {
    const days = ["D", "L", "M", "M", "J", "V", "S"];
    const d = new Date(date);
    const day = days[d.getUTCDay()];
    const hour = d.getUTCHours();
    const interval = hour < 6 ? "00:00" : hour < 12 ? "06:00" : hour < 18 ? "12:00" : "18:00";
    return `${day} ${interval}`;
  };

  // 🔹 Liste des intervalles possibles
  const intervals = [
    "L 00:00", "L 06:00", "L 12:00", "L 18:00",
    "M 00:00", "M 06:00", "M 12:00", "M 18:00",
    "M 00:00", "M 06:00", "M 12:00", "M 18:00",
    "J 00:00", "J 06:00", "J 12:00", "J 18:00",
    "V 00:00", "V 06:00", "V 12:00", "V 18:00",
    "S 00:00", "S 06:00", "S 12:00", "S 18:00",
    "D 00:00", "D 06:00", "D 12:00", "D 18:00",
  ];

  // 🔹 Initialisation des comptes de transactions par intervalle
  const intervalCounts = intervals.reduce((acc, interval) => {
    acc[interval] = { TP: 0, SL: 0 };
    return acc;
  }, {});

  // 🔹 Comptage des TP et SL par intervalle
  filteredTransactions.forEach((transaction) => {
    const interval = calculateInterval(transaction.date_entree);
    if (intervalCounts[interval]) {
      if (transaction.resultat_id === 3 || transaction.resultat_id === 4) {
        intervalCounts[interval].TP += 1;
      } else if (transaction.resultat_id === 2) {
        intervalCounts[interval].SL += 1;
      }
    }
  });

  // 🔹 Données pour le Bar Chart
  const barChartData = {
    labels: intervals,
    datasets: [
      {
        label: "Transactions réussies (TP)",
        data: intervals.map((interval) => intervalCounts[interval].TP),
        backgroundColor: "rgb(0, 230, 230)", // ✅ Bleu clair pour TP
        borderColor: "rgb(0, 230, 230)",
        borderRadius: 8, // ✅ Arrondi des bords des barres
        borderWidth: 1,
      },
      {
        label: "Transactions échouées (SL)",
        data: intervals.map((interval) => intervalCounts[interval].SL),
        backgroundColor: "rgb(255, 0, 102)", // ✅ Rouge pour SL
        borderColor: "rgb(255, 0, 102)",
        borderRadius: 8, // ✅ Arrondi des bords des barres
        borderWidth: 1,
      },
    ],
  };

  // 🔹 Options du Bar Chart
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // ❌ Supprime la légende
      tooltip: {
        callbacks: {
          label: (context) => `Nombre de transactions : ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Jours et heures", color: "white" },
        ticks: {
          autoSkip: true, // ✅ Saute certains labels si nécessaire
          maxRotation: 0, // ✅ Rotation minimale pour éviter le chevauchement
          minRotation: 0,
          callback: function (value, index, ticks) {
            // ✅ Tronque les labels pour éviter l'encombrement
            const label = this.getLabelForValue(value);
            return label.length > 8 ? `${label.slice(0, 8)}...` : label;
          },
        },
        grid: { display: false }, // ❌ Supprime la grille de l'axe X
        offset: true,
      },
      y: {
        title: { display: true, text: "Nombre de transactions", color: "white" },
        ticks: { color: "white" },
        beginAtZero: true,
        grid: { display: false }, // ❌ Supprime la grille de l'axe Y
      },
    },
  };

  return (
    <div className="w-full h-full flex justify-center items-center bg-white dark:bg-gray-900 rounded-xl p-2">
      <Bar data={barChartData} options={barChartOptions} />
    </div>
  );
};

export default FilteredBarChart;
