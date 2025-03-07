import React, { useEffect, useState } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ✅ Enregistrement des éléments nécessaires pour Radar Chart
ChartJS.register(RadialLinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FilteredRadarChart = ({ filteredTransactions }) => {
  const [orderTypes, setOrderTypes] = useState({});

  useEffect(() => {
    // 🔹 Récupérer les types d'ordres dynamiquement depuis l'API
    fetch("http://localhost:5001/api/types-ordres")
      .then((res) => res.json())
      .then((data) => {
        const mappedTypes = data.reduce((acc, item) => {
          acc[item.id] = item.type_ordre;
          return acc;
        }, {});
        setOrderTypes(mappedTypes);
      })
      .catch((error) => console.error("Erreur lors du fetch des types d'ordres :", error));
  }, []);

  if (!Array.isArray(filteredTransactions) || filteredTransactions.length === 0) {
    return <p className="text-center text-gray-500">Aucune transaction trouvée.</p>;
  }

  // 🔹 Filtrer les transactions avec un résultat TP (3) ou SL->TP (4)
  const tpTransactions = filteredTransactions.filter(
    (t) => t.resultat_id === 3 || t.resultat_id === 4
  );

  // 🔹 Initialiser les comptes de chaque type d'ordre
  const orderCounts = Object.keys(orderTypes).reduce((acc, key) => {
    acc[orderTypes[key]] = 0;
    return acc;
  }, {});

  // 🔹 Comptage des transactions TP/SL->TP par type d'ordre
  tpTransactions.forEach((transaction) => {
    const type = orderTypes[transaction.type_ordre_id];
    if (type) {
      orderCounts[type] += 1;
    }
  });

  // 🔹 Données pour le Radar Chart
  const radarChartData = {
    labels: Object.keys(orderCounts).map((key) => `${key} : ${orderCounts[key]}`), // ✅ Labels optimisés sans parenthèses
    datasets: [
      {
        label: "Nombre de transactions TP / SL->TP",
        data: Object.values(orderCounts),
        backgroundColor: "rgba(0, 230, 230, 0.3)", // ✅ Fond plus doux
        borderColor: "rgb(0, 230, 230)",
        pointBackgroundColor: "rgb(255, 255, 255)", // ✅ Points blancs pour contraste
        pointBorderColor: "rgb(0, 230, 230)",
        borderWidth: 2,
      },
    ],
  };

  // 🔹 Options du Radar Chart
  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.2)" },
        pointLabels: { color: "white", font: { size: 14 } }, // ✅ Labels clairs et visibles
        ticks: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw} transactions`,
        },
      },
    },
  };

  return (
    <div className="min-h-[300px] flex justify-center items-center w-full h-full bg-gray-100 dark:bg-gray-900 rounded-2xl p-4">
      <Radar data={radarChartData} options={radarChartOptions} />
    </div>
  );
};

export default FilteredRadarChart;
