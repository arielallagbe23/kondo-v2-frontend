import React, { useState, useEffect } from "react";
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
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const OverwatchRikAdjusted = ({ overwatchFilteredTransactions }) => {
  const [capitalInitial, setCapitalInitial] = useState(400000);

  if (!overwatchFilteredTransactions.length) {
    return (
      <p className="text-center text-gray-500">Aucune transaction trouvée.</p>
    );
  }

  // 🔹 Trier les transactions par `date_entree`
  const sortedTransactions = [...overwatchFilteredTransactions].sort(
    (a, b) => new Date(a.date_entree) - new Date(b.date_entree)
  );

  // 🔹 Fonction pour calculer l'évolution du PNL cumulatif avec ajustement du risque
  let cumulativePnlBase = 0; // PNL sans risque dynamique
  let cumulativePnlRiskAdjusted = 0; // PNL avec risque dynamique
  let cumulativePnlRiskAdjusted2 = 0; // PNL avec risque dynamique II
  let cumulativePnlRiskAdjusted3 = 0; // PNL avec risque ajusté basé sur intérêt composé

  let currentRisk = 0.5; // Risque initial pour RiskAdjusted
  let currentRisk2 = 0.5; // Risque initial pour RiskAdjusted2
  let currentRisk3 = 0.5; // Risque initial pour RiskAdjusted3 (intérêt composé)

  const lineChartPnlDataPointsBase = [];
  const lineChartPnlDataPointsRiskAdjusted = [];
  const lineChartPnlDataPointsRiskAdjusted2 = [];
  const lineChartPnlDataPointsRiskAdjusted3 = []; // Pour la courbe RiskAdjusted3

  sortedTransactions.forEach((transaction) => {
    const { resultat_id, risque, rrp, date_entree } = transaction;

    // Calcul du PNL de base
    let pnlBase = 0;
    if (resultat_id === 2)
      pnlBase = -risque; // Stop Loss
    else if (resultat_id === 1)
      pnlBase = 0; // Break Even
    else if (resultat_id === 3 || resultat_id === 4) pnlBase = risque * rrp; // Take Profit
    cumulativePnlBase += pnlBase;

    // Calcul du PNL avec ajustement du risque
    let pnlRiskAdjusted = 0;
    if (resultat_id === 2)
      pnlRiskAdjusted = -currentRisk; // Stop Loss
    else if (resultat_id === 1)
      pnlRiskAdjusted = 0; // Break Even
    else if (resultat_id === 3 || resultat_id === 4)
      pnlRiskAdjusted = currentRisk * rrp; // Take Profit
    cumulativePnlRiskAdjusted += pnlRiskAdjusted;

    // Calcul du PNL avec ajustement du risque II
    let pnlRiskAdjusted2 = 0;
    if (resultat_id === 2)
      pnlRiskAdjusted2 = -currentRisk2; // Stop Loss
    else if (resultat_id === 1)
      pnlRiskAdjusted2 = 0; // Break Even
    else if (resultat_id === 3 || resultat_id === 4)
      pnlRiskAdjusted2 = currentRisk2 * rrp; // Take Profit
    cumulativePnlRiskAdjusted2 += pnlRiskAdjusted2;

    // Calcul du PNL avec ajustement du risque III basé sur l'intérêt composé
    let pnlRiskAdjusted3 = 0;
    if (resultat_id === 2)
      pnlRiskAdjusted3 = -currentRisk3; // Stop Loss
    else if (resultat_id === 1)
      pnlRiskAdjusted3 = 0; // Break Even
    else if (resultat_id === 3 || resultat_id === 4)
      pnlRiskAdjusted3 = currentRisk3 * rrp; // Take Profit
    cumulativePnlRiskAdjusted3 += pnlRiskAdjusted3;

    // Ajout des points pour les graphiques
    lineChartPnlDataPointsBase.push({
      x: new Date(date_entree).toISOString(),
      y: cumulativePnlBase,
    });

    lineChartPnlDataPointsRiskAdjusted.push({
      x: new Date(date_entree).toISOString(),
      y: cumulativePnlRiskAdjusted,
    });

    lineChartPnlDataPointsRiskAdjusted2.push({
      x: new Date(date_entree).toISOString(),
      y: cumulativePnlRiskAdjusted2,
    });

    lineChartPnlDataPointsRiskAdjusted3.push({
      x: new Date(date_entree).toISOString(),
      y: cumulativePnlRiskAdjusted3,
    });

    // Mise à jour du risque pour RiskAdjusted
    if (cumulativePnlRiskAdjusted >= 25) {
      currentRisk = 5; // Risque à 5 si le PNL cumulé dépasse 25
    } else if (cumulativePnlRiskAdjusted >= 14) {
      currentRisk = 4; // Risque à 4 si le PNL cumulé est entre 14 et 25
    } else if (cumulativePnlRiskAdjusted >= 12) {
      currentRisk = 2; // Risque à 2 si le PNL cumulé est entre 6 et 14
    } else if (cumulativePnlRiskAdjusted >= 6) {
      currentRisk = 1; // Risque à 1 si le PNL cumulé est entre 3 et 6
    } else if (cumulativePnlRiskAdjusted >= 3) {
      currentRisk = 0.5; // Risque à 0.5 si le PNL cumulé est entre 0 et 3
    } else {
      currentRisk = 0.5; // Risque à 0.5 si le PNL est inférieur à 0
    }

    // Mise à jour du risque pour les retours en arrière
    if (cumulativePnlRiskAdjusted < 3 && currentRisk === 1) {
      currentRisk = 0.5; // Retour à 0.5 si le PNL descend en dessous de 3
    } else if (cumulativePnlRiskAdjusted < 6 && currentRisk === 2) {
      currentRisk = 1; // Retour à 1 si le PNL descend en dessous de 6
    } else if (cumulativePnlRiskAdjusted < 12 && currentRisk === 4) {
      currentRisk = 2; // Retour à 2 si le PNL descend en dessous de 12
    } else if (cumulativePnlRiskAdjusted < 25 && currentRisk === 5) {
      currentRisk = 4; // Retour à 4 si le PNL descend en dessous de 25
    }

    // Mise à jour du risque pour RiskAdjusted2
    if (cumulativePnlRiskAdjusted2 >= 3) {
      currentRisk2 = 1; // Risque à 1 si le PNL cumulé est supérieur ou égal à 3
    } else if (cumulativePnlRiskAdjusted2 < 3) {
      currentRisk2 = 0.5; // Risque à 0.5 si le PNL cumulé est inférieur à 3
    }

    // Mise à jour du risque pour RiskAdjusted3 basé sur l'intérêt composé
    if (cumulativePnlRiskAdjusted3 < 3) {
      currentRisk3 = 0.5; // Risque à 0.5 si le PNL est inférieur à 3
    } else {
      // Application du risque basé sur l'intérêt composé
      currentRisk3 = 0.5 * Math.pow(1 + 0.01, cumulativePnlRiskAdjusted3); // 1% d'augmentation du risque
      currentRisk3 = currentRisk3.toFixed(2); // Arrondi à 2 décimales
      currentRisk3 = parseFloat(currentRisk3); // Conversion en nombre
    }
  });

  // Renommage des variables pour éviter le conflit
  const finalCumulativePnlBase = cumulativePnlBase.toFixed(2); // Formate à 2 décimales
  const finalCumulativePnlRiskAdjusted = cumulativePnlRiskAdjusted.toFixed(2); // Formate à 2 décimales
  const finalCumulativePnlRiskAdjusted2 = cumulativePnlRiskAdjusted2.toFixed(2); // Formate à 2 décimales
  const finalCumulativePnlRiskAdjusted3 = cumulativePnlRiskAdjusted3.toFixed(2); // Formate à 2 décimales

  // Calcul des bénéfices en fonction du capital
  const baseCashProfit = (finalCumulativePnlBase / 100) * capitalInitial;
  const adjustedCashProfit =
    (finalCumulativePnlRiskAdjusted / 100) * capitalInitial;
  const adjustedCashProfit2 =
    (finalCumulativePnlRiskAdjusted2 / 100) * capitalInitial;
  const adjustedCashProfit3 =
    (finalCumulativePnlRiskAdjusted3 / 100) * capitalInitial;

  // 🔹 Préparation des données pour Chart.js
  const lineChartData = {
    labels: lineChartPnlDataPointsBase.map((point) =>
      new Date(point.x).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    ),
    datasets: [
      {
        label: "Évolution du PNL (sans ajustement du risque)",
        data: lineChartPnlDataPointsBase.map((point) => point.y),
        borderColor: "rgb(75, 192, 192)", // Couleur de la première courbe
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Évolution du PNL (avec ajustement du risque)",
        data: lineChartPnlDataPointsRiskAdjusted.map((point) => point.y),
        borderColor: "rgb(255, 165, 0)", // Couleur de la courbe ajustée (orange)
        backgroundColor: "rgba(255, 165, 0, 0.2)",
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Évolution du PNL (avec ajustement du risque II)",
        data: lineChartPnlDataPointsRiskAdjusted2.map((point) => point.y),
        borderColor: "rgb(138, 43, 226)", // Violet
        backgroundColor: "rgba(138, 43, 226, 0.2)", // Violet avec opacité
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Évolution du PNL (avec ajustement du risque III)",
        data: lineChartPnlDataPointsRiskAdjusted3.map((point) => point.y),
        borderColor: "rgb(0, 0, 255)", // Couleur de la courbe ajustée III (bleu)
        backgroundColor: "rgba(0, 0, 255, 0.2)", // Bleu avec opacité
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  // 🔹 Options du graphique
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Masque la légende
      tooltip: { enabled: false }, // Désactive le tooltip
      tooltip: {
        callbacks: { label: (context) => `Valeur cumulative : ${context.raw}` },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Date d'entrée des transactions" },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
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
    <div className="w-full h-[600px] flex justify-center items-center rounded-xl space-x-4">
      <div className="w-[15%] h-full bg-white dark:bg-gray-900 rounded-xl p-4 flex flex-col">
        <div className="mb-2">MEMO</div>

        {/* Bénéfice obtenu avec le risque de base */}
        <div className="text-xs mb-1">
          Bénéfice obtenu avec le risque de base
        </div>
        <div className="text-cyan-300 text-xs">{finalCumulativePnlBase} %</div>
        <div className="text-gray-500 mb-2 text-xs">
          {baseCashProfit.toFixed(2)} $
        </div>

        {/* Bénéfice avec ajustement du risque I */}
        <div className="text-xs mb-1">Bénéfice avec ajustement du risque I</div>
        <div className="text-orange-400 text-xs">
          {finalCumulativePnlRiskAdjusted} %
        </div>
        <div className="text-gray-500 mb-2 text-xs">
          {adjustedCashProfit.toFixed(2)} $
        </div>

        {/* Bénéfice avec ajustement du risque II */}
        <div className="text-xs mb-1">
          Bénéfice avec ajustement du risque II
        </div>
        <div className="text-violet-500 text-xs">
          {finalCumulativePnlRiskAdjusted2} %
        </div>
        <div className="text-gray-500 mb-2 text-xs">
          {adjustedCashProfit2.toFixed(2)} $
        </div>

        {/* Bénéfice avec ajustement du risque et intérêt composé */}
        <div className="text-xs mb-1">
          Bénéfice avec ajustement du risque et intérêt composé
        </div>
        <div className="text-blue-500 text-xs">
          {finalCumulativePnlRiskAdjusted3} %
        </div>
        <div className="text-gray-500 mb-2 text-xs">
          {adjustedCashProfit3.toFixed(2)} $
        </div>

        {/* Input pour modifier le capitalInitial */}
        <div className="flex flex-col mt-4">
          <label className="text-gray-300 text-xs mb-2">Capital Initial</label>
          <input
            type="number"
            value={capitalInitial}
            onChange={(e) => setCapitalInitial(Number(e.target.value))}
            className="p-1 border rounded text-xs bg-gray-700 text-white"
            placeholder="400000"
          />
          <button
            onClick={() =>
              alert(`Capital Initial updated to ${capitalInitial} $`)
            }
            className="mt-2 p-2 bg-blue-500 text-white rounded-md"
          >
            Modifier
          </button>
        </div>
      </div>
      <div className="w-[85%] h-full bg-white dark:bg-gray-900 p-4 rounded-xl">
        <Line data={lineChartData} options={lineChartOptions} />
      </div>
    </div>
  );
};

export default OverwatchRikAdjusted;
