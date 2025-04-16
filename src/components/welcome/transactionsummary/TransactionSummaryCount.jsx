import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TransactionSummaryCount = ({ transactionSummaryFilteredTransactions }) => {
  if (!transactionSummaryFilteredTransactions.length) {
    return (
      <p className="text-center text-gray-500">
        Aucune transaction trouvée pour l’affichage par actif.
      </p>
    );
  }

  // Regroupement des transactions par actif
  const actifMap = {};
  transactionSummaryFilteredTransactions.forEach((trx) => {
    actifMap[trx.nom_actif] = (actifMap[trx.nom_actif] || 0) + 1;
  });

  // Données pour le graphique
  const labels = Object.keys(actifMap);
  const values = Object.values(actifMap);

  // Configuration du graphique
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Transactions",
        data: values,
        backgroundColor: "#3B82F6", // Couleur des barres
        borderRadius: 6,
        barThickness: 40, // Augmente l'épaisseur des barres
      },
    ],
  };

  // Options pour désactiver les interactions de survol, la grille et la légende
  const options = {
    responsive: true, // Mode responsive
    maintainAspectRatio: false, // Pour occuper toute la largeur disponible
    plugins: {
      tooltip: {
        enabled: false, // Désactive le tooltip
      },
      legend: {
        display: false, // Désactive la légende
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Actif",
        },
        ticks: {
          autoSkip: true, // Permet d'éviter que les labels se chevauchent
        },
        grid: {
          display: false, // Désactive la grille pour l'axe X
        },
      },
      y: {
        title: {
          display: true,
          text: "Nombre de Transactions",
        },
        beginAtZero: true,
        grid: {
          display: false, // Désactive la grille pour l'axe Y
        },
      },
    },
  };

  return (
    <div className="w-full h-[400px] rounded-xl bg-gray-900 p-4 text-white">
      <div className="h-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default TransactionSummaryCount;
