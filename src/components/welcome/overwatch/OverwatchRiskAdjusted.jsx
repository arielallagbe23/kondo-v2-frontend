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

const OverwatchRikAdjusted = ({ overwatchFilteredTransactions }) => {
  const [capitalInitial, setCapitalInitial] = useState(400000);

  const totalTransactions = overwatchFilteredTransactions.length;
  if (!totalTransactions) {
    return <p className="text-center text-gray-500">Aucune transaction trouvée.</p>;
  }

  const sortedTransactions = [...overwatchFilteredTransactions].sort(
    (a, b) => new Date(a.date_entree) - new Date(b.date_entree)
  );

  const curveLabels = ["Base", "x2 après 3%", "x2.5 après 5%", "x4 après 10%"]; // noms des courbes
  const multipliers = [1, 2, 2.5, 4];
  const thresholds = [0, 3, 5, 5];

  const cumulativePnls = [0, 0, 0, 0];
  const pnlCurves = [[], [], [], []];

  sortedTransactions.forEach((tx) => {
    const { resultat_id, risque, rrp, date_entree } = tx;
    const isoDate = new Date(date_entree).toISOString();

    multipliers.forEach((_, i) => {
      let mult = 1;
      if (cumulativePnls[i] >= thresholds[i]) mult = multipliers[i];

      let pnl = 0;
      if (resultat_id === 2) pnl = -risque * mult;
      else if (resultat_id === 1) pnl = 0;
      else if (resultat_id === 3 || resultat_id === 4) pnl = risque * rrp * mult;

      cumulativePnls[i] += pnl;
      pnlCurves[i].push({ x: isoDate, y: cumulativePnls[i] });
    });
  });

  const chartLabels = pnlCurves[0].map((p) =>
    new Date(p.x).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const colors = ["#0077b6", "#d62828", "#007f5f", "#ff9900"];

  const lineChartData = {
    labels: chartLabels,
    datasets: pnlCurves.map((curve, i) => ({
      label: `Évolution du PNL (${curveLabels[i]})`,
      data: curve.map((point) => point.y),
      borderColor: colors[i],
      backgroundColor: colors[i],
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
    })),
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (ctx) => `Valeur cumulative : ${ctx.raw.toFixed(2)} %`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Date d'entrée des transactions" },
        ticks: { autoSkip: true, maxTicksLimit: 10 },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Valeur cumulative" },
        grid: { display: false },
      },
    },
  };

  const cashProfits = cumulativePnls.map(
    (pnl) => ((pnl / 100) * capitalInitial).toFixed(2)
  );

  return (
    <div className="w-full min-h-[400px] flex justify-center items-stretch rounded-xl space-x-4 mt-4">
      <div className="w-[15%] flex flex-col bg-white dark:bg-gray-900 rounded-xl p-4 overflow-hidden">
        <div className="mb-2 text-lg font-bold">✏️ MEMO</div>
        <div className="text-sm">Total Transactions :</div>
        <div className="text-yellow-400 text-lg font-bold mb-2">{totalTransactions}</div>

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
          <button
            onClick={() => alert(`Capital Initial mis à jour : ${capitalInitial} $`)}
            className="mt-2 p-2 bg-blue-500 text-white rounded-md"
          >
            Modifier
          </button>
        </div>
      </div>

      <div className="w-[85%] flex flex-col bg-white dark:bg-gray-900 p-4 rounded-xl overflow-hidden">
        <div className="mb-2 text-lg font-bold">📈 Pnl Evolution</div>
        <div className="flex-1">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default OverwatchRikAdjusted;
