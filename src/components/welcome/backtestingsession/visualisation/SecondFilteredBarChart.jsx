import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// ✅ Enregistrement des éléments nécessaires pour Bar Chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SecondFilteredBarChart = ({ filteredTransactions = [] }) => {
  if (!Array.isArray(filteredTransactions) || filteredTransactions.length === 0) {
    return <p className="text-center text-gray-500">Aucune transaction trouvée.</p>;
  }

  // 🔹 Initialisation des heures possibles (de 00h à 23h)
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  
  // 🔹 Initialisation des comptes de transactions par heure
  const hourCounts = hours.reduce((acc, hour) => {
    acc[hour] = { TP: 0, SL: 0 };
    return acc;
  }, {});

  // 🔹 Comptage des TP et SL par heure
  filteredTransactions.forEach((transaction) => {
    const date = new Date(transaction.date_entree);
    const hour = `${date.getUTCHours()}:00`;
    if (hourCounts[hour]) {
      if (transaction.resultat_id === 3 || transaction.resultat_id === 4 || transaction.resultat_id === 1) {
        hourCounts[hour].TP += 1;
      } else if (transaction.resultat_id === 2) {
        hourCounts[hour].SL += 1;
      }
    }
  });

  // 🔹 Données pour le Bar Chart
  const barChartData = {
    labels: hours,
    datasets: [
      {
        label: "Transactions réussies (TP, BE)",
        data: hours.map((hour) => hourCounts[hour].TP),
        backgroundColor: "rgb(0, 230, 230)", // ✅ Bleu clair pour TP et BE
        borderColor: "rgb(0, 230, 230)",
        borderRadius: 8,
        borderWidth: 1,
        barPercentage: 0.5, // ✅ Réduit la largeur des barres
        categoryPercentage: 0.5, // ✅ Réduit l'espace occupé par chaque catégorie
      },
      {
        label: "Transactions échouées (SL)",
        data: hours.map((hour) => hourCounts[hour].SL),
        backgroundColor: "rgb(255, 0, 102)", // ✅ Rouge pour SL
        borderColor: "rgb(255, 0, 102)",
        borderRadius: 8,
        borderWidth: 1,
        barPercentage: 0.5, // ✅ Réduit la largeur des barres
        categoryPercentage: 0.5, // ✅ Réduit l'espace occupé par chaque catégorie
      },
    ],
  };

  // 🔹 Options du Bar Chart
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true }, // ✅ Affichage de la légende
      tooltip: {
        callbacks: {
          label: (context) => `Nombre de transactions : ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Heures", color: "white" },
        ticks: { color: "white" },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Nombre de transactions", color: "white" },
        ticks: { color: "white" },
        beginAtZero: true,
        grid: { display: false },
      },
    },
  };


  return (
    <div className="w-full h-64 flex justify-center items-center bg-white dark:bg-gray-900 rounded-xl p-2">
      <Bar data={barChartData} options={barChartOptions} />
    </div>
  );
};

export default SecondFilteredBarChart;
