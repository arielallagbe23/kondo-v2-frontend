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

const getQuarter = (date) => {
  const month = new Date(date).getMonth() + 1;
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
};

const TryToTakeRiskAsYoungIAm = ({ transactionSummaryFilteredTransactions }) => {
  const [capitalInitial, setCapitalInitial] = useState(100000);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0, minRotation: 0 },
      },
      y: { grid: { display: false } },
    },
  };

  const quartersData = { Q1: [], Q2: [], Q3: [], Q4: [] };

  transactionSummaryFilteredTransactions.forEach((tx) => {
    const quarter = getQuarter(tx.date_entree);
    quartersData[quarter].push(tx);
  });

  const calculateQuarterPNL = (transactions) => {
    let pnlPercent = 0;
    let pnlCurve = [];
  
    transactions.forEach((tx) => {
      let risk = parseFloat(tx.risque) * 2; // RISQUE FIXE *2
      const rrp = parseFloat(tx.rrp);
      let gain = 0;
  
      if (tx.resultat === 'SL') {
        gain = -risk;
      } else if (tx.resultat === 'TP' || tx.resultat === 'SL->TP') {
        gain = risk * rrp;
      } else if (tx.resultat === 'BE') {
        gain = 0;
      }
  
      pnlPercent += gain;
  
      pnlCurve.push({
        x: new Date(tx.date_entree).toLocaleDateString("fr-FR"),
        y: pnlPercent,
      });
    });

    const profitCash = (pnlPercent / 100) * capitalInitial;

    return { pnlPercent, profitCash, pnlCurve, totalTrades: transactions.length };
  };

  return (
    <div className="bg-white dark:bg-gray-900 w-full flex flex-col space-y-4 rounded-lg p-4">
      <div className="flex space-x-2 items-center">
        <label className="text-sm text-gray-500">Capital Initial</label>
        <input
          type="number"
          value={capitalInitial}
          onChange={(e) => setCapitalInitial(Number(e.target.value))}
          className="p-2 border rounded w-40 text-sm text-black"
          placeholder="100000"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
          const { pnlPercent, profitCash, pnlCurve, totalTrades } = calculateQuarterPNL(quartersData[quarter]);

          return (
            <div
              key={quarter}
              className="p-4 rounded-xl flex flex-col w-full h-[300px] justify-start"
            >
              <div className="text-lg font-bold mb-2">{quarter}</div>

              <div className="w-full h-[200px]">
                <Line
                  data={{
                    labels: pnlCurve.map((p) => p.x),
                    datasets: [
                      {
                        label: "PNL %",
                        data: pnlCurve.map((p) => p.y),
                        borderColor: "#3b82f6",
                        backgroundColor: "#3b82f6",
                        tension: 0.3,
                        pointRadius: 0,
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={options}
                />
              </div>

              <div className="text-left text-xs pt-2">
                <div>Bénéfice {quarter} : {pnlPercent.toFixed(2)} %</div>
                <div>Bénéfice : {profitCash.toFixed(2)} $</div>
                <div>Nombre de trades : {totalTrades}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TryToTakeRiskAsYoungIAm;