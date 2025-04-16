import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrement des éléments nécessaires pour Bar Chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OverwatchPerformance = ({ overwatchFilteredTransactions }) => {
  const [sharpeRatio, setSharpeRatio] = useState(null);
  const [winRate, setWinRate] = useState(0);
  const [lossRate, setLossRate] = useState(0);
  const [beRate, setBeRate] = useState(0);
  const [advice, setAdvice] = useState("");
  const [winStreak, setWinStreak] = useState(0);
  const [loseStreak, setLoseStreak] = useState(0);

  useEffect(() => {
    if (!overwatchFilteredTransactions.length) return;

    const resultCounts = {
      BE: overwatchFilteredTransactions.filter((t) => t.resultat_id === 1)
        .length,
      SL: overwatchFilteredTransactions.filter((t) => t.resultat_id === 2)
        .length,
      TP: overwatchFilteredTransactions.filter((t) => t.resultat_id === 3)
        .length,
      SLTP: overwatchFilteredTransactions.filter((t) => t.resultat_id === 4)
        .length,
    };

    const totalTrades = overwatchFilteredTransactions.length;
    setWinRate(((resultCounts.TP + resultCounts.SLTP) / totalTrades) * 100);
    setLossRate((resultCounts.SL / totalTrades) * 100);
    setBeRate((resultCounts.BE / totalTrades) * 100);

    const gains = overwatchFilteredTransactions
      .filter((t) => t.resultat_id === 3 || t.resultat_id === 4)
      .map((t) => t.risque * t.rrp);

    const pertes = overwatchFilteredTransactions
      .filter((t) => t.resultat_id === 2)
      .map((t) => -t.risque);

    const rendements = [...gains, ...pertes];

    if (rendements.length > 1) {
      const moyenne =
        rendements.reduce((acc, val) => acc + val, 0) / rendements.length;
      const ecartType = Math.sqrt(
        rendements
          .map((r) => Math.pow(r - moyenne, 2))
          .reduce((acc, val) => acc + val, 0) / rendements.length
      );
      const ratio = moyenne / ecartType;
      setSharpeRatio(ratio);

      switch (true) {
        case ratio < 0:
          setAdvice(
            "🚨 Attention, ton trading est trop risqué et non rentable. Revois ta stratégie !"
          );
          break;
        case ratio >= 0 && ratio < 0.5:
          setAdvice(
            "⚠️ Ton trading est instable. Diminue ton risque et améliore la cohérence de ta stratégie."
          );
          break;
        case ratio >= 0.5 && ratio < 1:
          setAdvice(
            "🟡 Tu es sur la bonne voie, mais ton trading peut être optimisé."
          );
          break;
        case ratio >= 1 && ratio < 2:
          setAdvice(
            "✅ Bon trading ! Tu gères bien le risque et la rentabilité."
          );
          break;
        case ratio >= 2:
          setAdvice("🚀 Excellent ! Ton trading est très efficace et stable.");
          break;
        default:
          setAdvice("");
      }
    } else {
      setSharpeRatio(null);
      setAdvice("📉 Pas assez de trades pour évaluer la performance.");
    }

    let maxWinStreak = 0,
      maxLoseStreak = 0;
    let currentWinStreak = 0,
      currentLoseStreak = 0;

    overwatchFilteredTransactions.forEach((t) => {
      if (t.resultat_id === 3 || t.resultat_id === 4) {
        currentWinStreak++;
        currentLoseStreak = 0;
      } else if (t.resultat_id === 2) {
        currentLoseStreak++;
        currentWinStreak = 0;
      }
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      maxLoseStreak = Math.max(maxLoseStreak, currentLoseStreak);
    });

    setWinStreak(maxWinStreak);
    setLoseStreak(maxLoseStreak);
  }, [overwatchFilteredTransactions]);

  // 📊 Données du graphique en barres
  const barData = {
    labels: ["Win Rate", "Loss Rate", "Break Even"],
    datasets: [
      {
        label: "Performance en %",
        data: [winRate, lossRate, beRate],
        backgroundColor: ["rgb(0, 230, 230)", "rgb(255, 0, 102)", "#FFC107"],
        borderRadius: { topLeft: 10, topRight: 10 },
        barThickness: 40,
      },
    ],
  };

  // 🎛 Options du graphique
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { padding: 10 },
      },
      y: {
        grid: { display: false },
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: Math.max(winRate, lossRate, beRate) + 5,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="space-x-4  text-white rounded-lg w-full mx-auto h-full flex">
      {/* 📝 Informations et conseils à droite */}
      <div className="w-1/2 bg-gray-900 h-auto p-4 rounded-lg">
        <h2 className="text-lg font-bold mb-4">📊 Performance du Trading</h2>

        <p className="text-sm text-gray-400">🔥 Plus longue série de gains :</p>
        <p className="text-2xl font-bold text-green-400">{winStreak} trades</p>

        <p className="text-sm text-gray-400 mt-2">
          ❄️ Plus longue série de pertes :
        </p>
        <p className="text-2xl font-bold text-red-400">{loseStreak} trades</p>

        <div className="mt-4">
          <p className="text-sm text-gray-400">
            <strong>Ratio de Sharpe :</strong> <br />
            <span className="text-gray-500 text-xs">
              (Il mesure la rentabilité ajustée au risque. Un ratio plus élevé
              signifie un meilleur équilibre entre risque et performance.)
            </span>
          </p>
          {sharpeRatio !== null ? (
            <p
              className={`text-lg font-bold ${sharpeRatio > 1 ? "text-green-400" : "text-red-400"}`}
            >
              {sharpeRatio.toFixed(2)}
            </p>
          ) : (
            <p className="text-gray-400">Données insuffisantes</p>
          )}
        </div>

        {advice && (
          <div className="mt-3 p-3 bg-gray-700 rounded-lg text-sm text-yellow-300">
            💡 <strong>Conseil :</strong> {advice}
          </div>
        )}
      </div>

      {/* 📊 Graphique à gauche */}
      <div className="w-1/2 h-auto flex items-center bg-gray-900 p-4 rounded-lg">
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
};

export default OverwatchPerformance;
