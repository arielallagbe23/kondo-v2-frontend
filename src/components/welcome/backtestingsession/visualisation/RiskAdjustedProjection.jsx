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

// 🔹 Enregistrement des modules pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RiskAdjustedProjection = ({ filteredTransactions, capitalInitial }) => {
  if (!filteredTransactions.length) {
    return (
      <p className="text-center text-gray-500">Aucune transaction trouvée.</p>
    );
  }

  let beneficeTotalPourcentage = 0;
  let beneficeTotalPourcentage2 = 0;
  let risqueActuel = 0.5 / 100; // 🔹 Départ à 0.5%
  let risqueActuel2 = 0.5 / 100;


  let historiqueBenefice = [{ date: "Début", benefice: 0 }];
  let historiqueBenefice2 = [{ date: "Début", benefice: 0 }];
  let filteredLineData = [{ date: "Début", benefice: 0 }];

  // 🔹 Trier les transactions par `date_entree`
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(a.date_entree) - new Date(b.date_entree)
  );

  let cumulativePnlPercentage = 0;

  sortedTransactions.forEach((transaction) => {
    const { resultat_id, rrp, date_entree, risque, actif_id } = transaction;
    const rrpFloat = parseFloat(rrp) || 1;
    let beneficePourcentage = 0;
    let beneficePourcentage2 = 0;
    let pnlPourcentage = 0;

    // 🔹 Calcul des bénéfices
    if (resultat_id === 2) {
      beneficePourcentage = -risqueActuel * 100;
      pnlPourcentage = -parseFloat(risque);
    } else if (resultat_id === 1) {
      beneficePourcentage = 0;
      pnlPourcentage = 0;
    } else if (resultat_id === 3 || resultat_id === 4) {
      beneficePourcentage = risqueActuel * rrpFloat * 100;
      pnlPourcentage = parseFloat(risque) * parseFloat(rrp);
    }

    // 🔹 Calcul des bénéfices
    if (resultat_id === 2) {
      beneficePourcentage2 = -risqueActuel2 * 100;
      pnlPourcentage = -parseFloat(risque);
    } else if (resultat_id === 1) {
      beneficePourcentage2 = 0;
      pnlPourcentage = 0;
    } else if (resultat_id === 3 || resultat_id === 4) {
      beneficePourcentage2 = risqueActuel2 * rrpFloat * 100;
      pnlPourcentage = parseFloat(risque) * parseFloat(rrp);
    }

    // 🔹 Mise à jour du bénéfice total en %
    beneficeTotalPourcentage += beneficePourcentage;
    beneficeTotalPourcentage2 += beneficePourcentage2;
    cumulativePnlPercentage += pnlPourcentage;

    if (beneficeTotalPourcentage2 >= 5) {
      risqueActuel2 = 1 / 100;
    } 
    if (beneficeTotalPourcentage2 < 5) {
      risqueActuel2 = 0.5 / 100;
    }

    // 🎯 **Gestion du risque dynamique pour actifs spécifiques**
    const actifsAvecGestionSpéciale = [48, 49, 50, 51];

    if (actifsAvecGestionSpéciale.includes(actif_id)) {
      if (beneficeTotalPourcentage >= 9) {
        risqueActuel = 4 / 100;
      } else if (beneficeTotalPourcentage >= 7) {
        risqueActuel = 2 / 100;
      } else if (beneficeTotalPourcentage >= 3) {
        risqueActuel = 1 / 100;
      } else {
        risqueActuel = 0.5 / 100;
      }
    } else {
      // 🎯 **Gestion du risque classique pour les autres actifs**
      if (beneficeTotalPourcentage >= 25) {
        risqueActuel = 4 / 100;
      } else if (beneficeTotalPourcentage >= 18) {
        risqueActuel = 2 / 100;
      } else if (beneficeTotalPourcentage >= 12) {
        risqueActuel = 2 / 100;
      } else if (beneficeTotalPourcentage >= 6) {
        risqueActuel = 1 / 100;
      } else {
        risqueActuel = 0.5 / 100;
      }
    }

    console.log(
      `📊 Transaction du ${new Date(date_entree).toLocaleString("fr-FR")} - Actif ${actif_id} - Bénéfice: ${beneficeTotalPourcentage.toFixed(
        2
      )}% - Risque Ajusté: ${(risqueActuel * 100).toFixed(2)}%`
    );

    

    // 📊 Stocker les données pour Risk Adjusted
    historiqueBenefice.push({
      date: new Date(date_entree).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      benefice: beneficeTotalPourcentage.toFixed(2),
    });

    // 📊 Stocker les données pour Risk Adjusted
    historiqueBenefice2.push({
      date: new Date(date_entree).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      benefice: beneficeTotalPourcentage2.toFixed(2),
    });

    // 📊 Stocker les données pour Filtered Transactions
    filteredLineData.push({
      date: new Date(date_entree).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      benefice: cumulativePnlPercentage.toFixed(2),
    });
  });

  const lastBeneficeTotalPourcentage2 = beneficeTotalPourcentage2.toFixed(2);


  // 🔹 Préparation des données pour le LineChart (SUPERPOSITION DES COURBES)
  const chartData = {
    labels: historiqueBenefice.map((point) => point.date),
    datasets: [
      {
        label: "Bénéfice (%) - Risk Adjusted",
        data: historiqueBenefice.map((point) => point.benefice),
        borderColor: "#ff5d8f",
        backgroundColor: "rgba(255, 93, 143, 0.2)",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Bénéfice (%) - Risk Adjusted 2",
        data: historiqueBenefice2.map((point) => point.benefice),
        borderColor: "#3a86ff",
        backgroundColor: "#03045e",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Bénéfice (%) - Risk Normal",
        data: filteredLineData.map((point) => point.benefice),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "#d8f3dc",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  // 🔹 Options du graphique
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (context) =>
            context.dataset.label === "Bénéfice (%) - Risk Adjusted"
              ? `Bénéfice Ajusté : ${context.raw}%`
              : `Bénéfice Filtered : ${context.raw}%`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Date des transactions" },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          maxRotation: 0,
          minRotation: 0,
        },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Bénéfice (%)" },
        ticks: { display: true },
        grid: { display: false },
      },
    },
  };

  const capitalFinal =
    (beneficeTotalPourcentage / 100) * capitalInitial + capitalInitial;
    const capitalFinal2 =
    (beneficeTotalPourcentage2 / 100) * capitalInitial + capitalInitial;

  return (
    <div className="text-white w-auto flex space-x-2">
      <div className="bg-gray-100 dark:bg-gray-900 h-auto p-4 rounded-lg w-[20%]">
        <h2 className="text-lg font-bold flex items-center">
          Projection avec Gestion Dynamique du Risque
        </h2>

        <div className="mt-4">
          <p className="text-sm text-gray-400">Capital final :</p>
          <p
            className="text-lg font-bold text-pink-400"
          >
            {capitalFinal.toFixed(2)}$
          </p>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-400">Bénéfice Total :</p>
          <p
            className="text-lg font-bold text-pink-400"
          >
            {beneficeTotalPourcentage.toFixed(2)}%
          </p>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-400">Capital final II :</p>
          <p
            className="text-lg font-bold text-blue-500"
          >
            {capitalFinal2.toFixed(2)}$
          </p>
        </div>



        <div className="mt-4">
          <p className="text-sm text-gray-400">Bénéfice Total II :</p>
          <p
            className="text-lg font-bold text-blue-500"
          >
            {beneficeTotalPourcentage2.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="w-[80%] h-auto bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default RiskAdjustedProjection;
