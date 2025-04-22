import React, { useState } from "react";
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

// Fonction de lissage des données (moyenne glissante)
const smoothCurve = (data, windowSize = 3) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const windowData = data.slice(start, i + 1);
    const avg = windowData.reduce((acc, p) => acc + p.y, 0) / windowData.length;
    result.push({ x: data[i].x, y: avg });
  }
  return result;
};

const TransactionSummaryRiskAdjusted = ({ transactionSummaryFilteredTransactions }) => {
  const [capitalInitial, setCapitalInitial] = useState(400000);

  if (!transactionSummaryFilteredTransactions.length) {
    return <p className="text-center text-gray-500">Aucune transaction trouvée.</p>;
  }

  const sortedTransactions = [...transactionSummaryFilteredTransactions].sort(
    (a, b) => new Date(a.date_entree) - new Date(b.date_entree)
  );

  const curveLabels = ["Base", "Risque *2 sur H4 / D1"];
  const cumulativePnls = [0, 0];
  const pnlCurves = [[], []];

  sortedTransactions.forEach((tx) => {
    const { resultat_id, risque, rrp, timeframe_id, date_entree } = tx;
    const isoDate = new Date(date_entree).toISOString();

    // Base
    let basePnl = 0;
    if (resultat_id === 2) basePnl = -risque;
    else if (resultat_id === 3 || resultat_id === 4) basePnl = risque * rrp;
    cumulativePnls[0] += basePnl;
    pnlCurves[0].push({ x: isoDate, y: cumulativePnls[0] });

    // Risque *2 sur H4/D1 sinon normal
    const riskMultiplier = timeframe_id === 5 || timeframe_id === 6 || timeframe_id === 4 ? 2 : 1;
    let adjustedPnl = 0;
    if (resultat_id === 2) adjustedPnl = -risque * riskMultiplier;
    else if (resultat_id === 3 || resultat_id === 4) adjustedPnl = risque * rrp * riskMultiplier;
    cumulativePnls[1] += adjustedPnl;
    pnlCurves[1].push({ x: isoDate, y: cumulativePnls[1] });
  });

  const chartLabels = pnlCurves[0].map((p) =>
    new Date(p.x).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const colors = ["#0077b6", "#22c55e"];

  const lineChartData = {
    labels: chartLabels,
    datasets: pnlCurves.map((curve, i) => ({
      label: `Évolution du PNL (${curveLabels[i]})`,
      data: smoothCurve(curve, 5).map((p) => p.y), // On lisse les courbes
      borderColor: colors[i],
      backgroundColor: colors[i],
      tension: 0.3, // Encore un peu plus smooth
      pointRadius: 0,
      borderWidth: 2,
    })),
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Valeur cumulative : ${ctx.raw.toFixed(2)} %`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
        },
        grid: {
          display: false, // ⛔ Désactiver la grille X
        },
        title: {
          display: true,
          text: "Date d'entrée des transactions",
        },
      },
      y: {
        grid: {
          display: false, // ⛔ Désactiver la grille Y
        },
        title: {
          display: true,
          text: "Valeur cumulative",
        },
      },
    },
  };
  

  const cashProfits = cumulativePnls.map((pnl) => ((pnl / 100) * capitalInitial).toFixed(2));

  return (
    <div className="w-full min-h-[600px] flex justify-center items-stretch rounded-xl space-x-4">
      {/* MEMO */}
      <div className="w-[15%] h-auto flex flex-col bg-white dark:bg-gray-900 rounded-xl p-4 overflow-hidden">
        <div className="mb-2 text-lg font-bold">✏️ MEMO</div>
        <div className="text-sm">Total Transactions :</div>
        <div className="text-yellow-400 text-lg font-bold mb-2">{transactionSummaryFilteredTransactions.length}</div>

        {cumulativePnls.map((pnl, i) => (
          <div key={i} className="mb-3">
            <div className="text-xs mb-1">{curveLabels[i]}</div>
            <div className="font-bold text-sm" style={{ color: colors[i] }}>{pnl.toFixed(2)} %</div>
            <div className="text-gray-500 text-sm">{cashProfits[i]} $</div>
          </div>
        ))}

        <div className="flex flex-col mt-2">
          <label className="text-gray-300 text-xs mb-2">Capital Initial</label>
          <input
            type="number"
            value={capitalInitial}
            onChange={(e) => setCapitalInitial(Number(e.target.value))}
            className="p-1 border rounded text-xs bg-gray-700 text-white"
            placeholder="400000"
          />
        </div>
      </div>

      {/* Courbes */}
      <div className="w-[85%] h-auto flex flex-col bg-white dark:bg-gray-900 p-4 rounded-xl overflow-hidden">
        <div className="mb-2 text-lg font-bold">📈 Pnl Evolution</div>
        <div className="flex-1">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default TransactionSummaryRiskAdjusted;
