import React, { useEffect, useState } from "react";

const TradingMetrics = ({ transactionSummaryFilteredTransactions }) => {
  const [sharpeRatio, setSharpeRatio] = useState(null);
  const [winStreak, setWinStreak] = useState(0);
  const [loseStreak, setLoseStreak] = useState(0);
  const [advice, setAdvice] = useState("");

  useEffect(() => {
    if (transactionSummaryFilteredTransactions.length === 0) return;

    // 🎯 Définition des transactions gagnantes et perdantes
    const gains = transactionSummaryFilteredTransactions
      .filter((t) => t.resultat_id === 3 || t.resultat_id === 4) // ✅ TP & BE → Gagnants
      .map((t) => t.risque * t.rrp); // Gain net basé sur le RRP

    const pertes = transactionSummaryFilteredTransactions
      .filter((t) => t.resultat_id === 2) // ❌ SL → Perdant
      .map((t) => -t.risque); // Perte = Risque négatif

    const rendements = [...gains, ...pertes]; // Fusionner les valeurs

    // ✅ Calcul du Ratio de Sharpe
    if (rendements.length > 1) {
      const moyenne = rendements.reduce((acc, val) => acc + val, 0) / rendements.length;
      const ecartType = Math.sqrt(
        rendements.map((r) => Math.pow(r - moyenne, 2)).reduce((acc, val) => acc + val, 0) /
          rendements.length
      );
      const ratio = moyenne / ecartType;
      setSharpeRatio(ratio);

      // 🎯 Switch case pour conseils basés sur le Sharpe Ratio
      switch (true) {
        case ratio < 0:
          setAdvice("🚨 Attention, ton trading est trop risqué et non rentable. Revois ta stratégie !");
          break;
        case ratio >= 0 && ratio < 0.5:
          setAdvice("⚠️ Ton trading est instable. Diminue ton risque et améliore la cohérence de ta stratégie.");
          break;
        case ratio >= 0.5 && ratio < 1:
          setAdvice("🟡 Tu es sur la bonne voie, mais ton trading peut être optimisé. Garde un bon équilibre risque/récompense.");
          break;
        case ratio >= 1 && ratio < 2:
          setAdvice("✅ Bon trading ! Tu gères bien le risque et la rentabilité. Continue ainsi !");
          break;
        case ratio >= 2:
          setAdvice("🚀 Excellent ! Ton trading est très efficace et stable. Profite de ton edge !");
          break;
        default:
          setAdvice("");
      }
    } else {
      setSharpeRatio(null); // Pas assez de données
      setAdvice("📉 Pas assez de trades pour évaluer la performance.");
    }

    // ✅ Calcul du Win Streak / Lose Streak
    let maxWinStreak = 0,
      maxLoseStreak = 0;
    let currentWinStreak = 0,
      currentLoseStreak = 0;

    transactionSummaryFilteredTransactions.forEach((t) => {
      if (t.resultat_id === 3 || t.resultat_id === 4) {
        // 🎯 TP et BE comptent comme gains
        currentWinStreak++;
        currentLoseStreak = 0;
      } else if (t.resultat_id === 2) {
        // ❌ SL → Perte
        currentLoseStreak++;
        currentWinStreak = 0;
      }
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      maxLoseStreak = Math.max(maxLoseStreak, currentLoseStreak);
    });

    setWinStreak(maxWinStreak);
    setLoseStreak(maxLoseStreak);
  }, [transactionSummaryFilteredTransactions]);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg w-auto mx-auto h-full">
      <h2 className="text-lg font-bold flex items-center space-x-2">
        <span>Performance du Trading</span>
      </h2>

      <div className="mt-4">
        <p className="text-sm text-gray-400">
          <strong>Ratio de Sharpe :</strong> <br />
          <span className="text-gray-500 text-xs">
            (Il mesure la rentabilité ajustée au risque. Un ratio plus élevé signifie un meilleur équilibre entre risque et performance.)
          </span>
        </p>
        {sharpeRatio !== null ? (
          <p className={`text-lg font-bold ${sharpeRatio > 1 ? "text-green-400" : "text-red-400"}`}>
            {sharpeRatio.toFixed(2)}
          </p>
        ) : (
          <p className="text-gray-400">Données insuffisantes</p>
        )}
      </div>

      {/* Ajout du conseil */}
      {advice && (
        <div className="mt-3 p-3 bg-gray-700 rounded-lg text-sm text-yellow-300">
          💡 <strong>Conseil :</strong> {advice}
        </div>
      )}

      <div className="mt-4">
        <p className="text-sm text-gray-400">🔥 Plus longue série de gains :</p>
        <p className="text-lg font-bold text-green-400">{winStreak} trades</p>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-400">❄️ Plus longue série de pertes :</p>
        <p className="text-lg font-bold text-red-400">{loseStreak} trades</p>
      </div>
    </div>
  );
};

export default TradingMetrics;
