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

  let beneficeTotalPourcentage2 = 0;
  let risqueActuel2 = 0.5 / 100;

  let beneficeTotalPourcentage2_5 = 0;
  let risqueActuel2_5 = 0.5 / 100;

  let historiqueBenefice2 = [{ date: "Début", benefice: 0 }];
  let historiqueBenefice2_5 = [{ date: "Début", benefice: 0 }];

  let filteredLineData = [{ date: "Début", benefice: 0 }];

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(a.date_entree) - new Date(b.date_entree)
  );

  let cumulativePnlPercentage = 0;

  sortedTransactions.forEach((transaction) => {
    const { resultat_id, rrp, date_entree, risque } = transaction;
    const rrpFloat = parseFloat(rrp) || 1;
    let beneficePourcentage2 = 0;
    let beneficePourcentage2_5 = 0;
    let pnlPourcentage = 0;
  
    // Appliquer la stratégie : -R, 0, ou R*rrp
    if (resultat_id === 2) {
      beneficePourcentage2 = -risqueActuel2 * 100;
      beneficePourcentage2_5 = -risqueActuel2_5 * 100;
      pnlPourcentage = -parseFloat(risque);
    } else if (resultat_id === 1) {
      beneficePourcentage2 = 0;
      beneficePourcentage2_5 = 0;
      pnlPourcentage = 0;
    } else if (resultat_id === 3 || resultat_id === 4) {
      beneficePourcentage2 = risqueActuel2 * rrpFloat * 100;
      beneficePourcentage2_5 = risqueActuel2_5 * rrpFloat * 100;
      pnlPourcentage = parseFloat(risque) * parseFloat(rrp);
    }
  
    beneficeTotalPourcentage2 += beneficePourcentage2;
    beneficeTotalPourcentage2_5 += beneficePourcentage2_5;
    cumulativePnlPercentage += pnlPourcentage;
  
    // Mise à jour des risques après seuils
    risqueActuel2 = beneficeTotalPourcentage2 >= 3 ? (0.5 * 2) / 100 : 0.5 / 100;
    risqueActuel2_5 = beneficeTotalPourcentage2_5 >= 5 ? (0.5 * 2.5) / 100 : 0.5 / 100;
  
    const label = new Date(date_entree).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  
    historiqueBenefice2.push({ date: label, benefice: beneficeTotalPourcentage2.toFixed(2) });
    historiqueBenefice2_5.push({ date: label, benefice: beneficeTotalPourcentage2_5.toFixed(2) });
    filteredLineData.push({ date: label, benefice: cumulativePnlPercentage.toFixed(2) });
  });
  

  const chartData = {
    labels: historiqueBenefice2.map((point) => point.date),
    datasets: [
      {
        label: "Bénéfice (%) - Risk Adjusted 2",
        data: historiqueBenefice2.map((point) => point.benefice),
        borderColor: "#ef476f",
        backgroundColor: "#ef476f",
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
      {
        label: "Bénéfice (%) - Risk Adjusted 2.5",
        data: historiqueBenefice2_5.map((point) => point.benefice),
        borderColor: "#ffd166",
        backgroundColor: "#ffd166",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (context) => `Bénéfice: ${context.raw}%`,
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

  const capitalFinal2 =
    (beneficeTotalPourcentage2 / 100) * capitalInitial + capitalInitial;

  const capitalFinal2_5 =
    (beneficeTotalPourcentage2_5 / 100) * capitalInitial + capitalInitial;

  return (
    <div className="text-white w-auto flex space-x-2">
      <div className="bg-gray-100 dark:bg-gray-900 h-auto p-4 rounded-lg w-[20%]">
        <h2 className="text-lg font-bold flex items-center">
          Projection avec Gestion Dynamique du Risque
        </h2>

        <div className="mt-4">
          <p className="text-sm text-gray-400">Capital final II :</p>
          <p className="text-lg font-bold text-pink-600">
            {capitalFinal2.toFixed(2)}$
          </p>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-400">Bénéfice Total II :</p>
          <p className="text-lg font-bold text-pink-600">
            {beneficeTotalPourcentage2.toFixed(2)}%
          </p>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-400">Capital final III (x2.5) :</p>
          <p className="text-lg font-bold text-yellow-500">
            {capitalFinal2_5.toFixed(2)}$
          </p>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-400">Bénéfice Total III (x2.5) :</p>
          <p className="text-lg font-bold text-yellow-500">
            {beneficeTotalPourcentage2_5.toFixed(2)}%
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
