import React, { useEffect, useState } from "react";

const TimeMetrics = ({ transactionSummaryFilteredTransactions }) => {
  const [bestDay, setBestDay] = useState(null);
  const [worstDay, setWorstDay] = useState(null);
  const [bestTradingHour, setBestTradingHour] = useState(null);
  const [averageTradeDuration, setAverageTradeDuration] = useState(null);

  useEffect(() => {
    if (transactionSummaryFilteredTransactions.length === 0) return;

    // 🗓️ Mapping jours et heures
    const daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    let dayProfits = {};
    let hourSuccessRate = {};
    let tradeDurations = [];

    transactionSummaryFilteredTransactions.forEach((trade) => {
      const date = new Date(trade.date_entree);
      const day = daysOfWeek[date.getDay()];
      const hour = date.getHours();

      // 🔥 Détermination des trades réussis et perdus
      const isWin = trade.resultat_id === 3 || trade.resultat_id === 4; // SL->TP, TP et BE
      const isLoss = trade.resultat_id === 2; // SL uniquement

      // 📆 Calcul des profits par jour
      const profit = isWin ? trade.risque * trade.rrp : -trade.risque;
      dayProfits[day] = (dayProfits[day] || 0) + profit;

      // ⏰ Calcul du taux de réussite par heure
      if (!hourSuccessRate[hour]) {
        hourSuccessRate[hour] = { wins: 0, losses: 0 };
      }
      if (isWin) {
        hourSuccessRate[hour].wins++;
      }
      if (isLoss) {
        hourSuccessRate[hour].losses++;
      }

      // ⏳ Calcul de la durée des trades (exemple si on a une date de sortie)
      if (trade.date_sortie) {
        const sortieDate = new Date(trade.date_sortie);
        tradeDurations.push((sortieDate - date) / (1000 * 60)); // Convertir en minutes
      }
    });

    // 📆 Trouver le meilleur et pire jour
    const sortedDays = Object.entries(dayProfits).sort((a, b) => b[1] - a[1]);
    if (sortedDays.length > 0) {
      setBestDay(sortedDays[0][0]); // Jour avec le plus de gains
      setWorstDay(sortedDays[sortedDays.length - 1][0]); // Jour avec le plus de pertes
    }

    // ⏰ Trouver l'heure avec le meilleur taux de réussite
    const bestHour = Object.entries(hourSuccessRate)
      .map(([hour, { wins, losses }]) => ({
        hour,
        successRate: wins / (wins + losses),
      }))
      .sort((a, b) => b.successRate - a.successRate)[0];

    if (bestHour) {
      setBestTradingHour(`${bestHour.hour}h - ${parseInt(bestHour.hour) + 2}h (${(bestHour.successRate * 100).toFixed(0)}%)`);
    }

    // ⏳ Calculer la durée moyenne des trades
    if (tradeDurations.length > 0) {
      const avgDuration = tradeDurations.reduce((a, b) => a + b, 0) / tradeDurations.length;
      setAverageTradeDuration(`${avgDuration.toFixed(1)} min`);
    } else {
      setAverageTradeDuration("Données insuffisantes");
    }
  }, [transactionSummaryFilteredTransactions]);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg w-full mx-auto h-full">
      <h2 className="text-lg font-bold flex items-center space-x-2">
        <span>Metrics temporelles</span>
      </h2>

      <div className="mt-4">
        <p className="text-sm text-gray-400"><strong>Meilleur jour de trading :</strong></p>
        <p className="text-lg font-bold text-green-400">{bestDay || "Données insuffisantes"}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-400">📉 <strong>Pire jour de trading :</strong></p>
        <p className="text-lg font-bold text-red-400">{worstDay || "Données insuffisantes"}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-400">⏰ <strong>Heure de trading la plus rentable :</strong></p>
        <p className="text-lg font-bold text-yellow-400">{bestTradingHour || "Données insuffisantes"}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-400">⏳ <strong>Durée moyenne des trades :</strong></p>
        <p className="text-lg font-bold text-blue-400">{averageTradeDuration}</p>
      </div>
    </div>
  );
};

export default TimeMetrics;
