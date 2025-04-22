import React, { useEffect, useState } from "react";

const TimeMetrics = ({ filteredTransactions }) => {
  const [metrics, setMetrics] = useState({
    bestDay: null,
    worstDay: null,
    bestTradingHour: null,
    averageTradeDuration: null,
    minTradeDuration: null,
    maxTradeDuration: null,
  });

  // Calcule la durée en minutes en excluant le week-end (UTC)
  const getMarketOpenDuration = (start, end) => {
    let duration = 0;
    const current = new Date(start);

    while (current < end) {
      const day = current.getUTCDay();
      const hour = current.getUTCHours();

      const isMarketOpen =
        (day >= 1 && day <= 4) || // Lundi à jeudi
        (day === 5 && hour < 22) || // Vendredi avant 22h
        (day === 0 && hour >= 23); // Dimanche après 23h

      if (isMarketOpen) {
        duration += 1;
      }

      current.setMinutes(current.getMinutes() + 1);
    }

    return duration;
  };

  const formatDuration = (minutes) => {
    if (typeof minutes !== "number" || isNaN(minutes)) return "N/A";
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = Math.round(minutes % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}j`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0 || parts.length === 0) parts.push(`${mins}min`);

    return parts.join(" ");
  };

  useEffect(() => {
    if (!filteredTransactions.length) return;

    const daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const dayProfits = {};
    const hourStats = {};
    const tradeDurations = [];

    filteredTransactions.forEach((trade) => {
      const entry = new Date(trade.date_entree);
      const exit = trade.date_sortie ? new Date(trade.date_sortie) : null;
      const day = daysOfWeek[entry.getDay()];
      const hour = entry.getHours();

      const isWin = [3, 4].includes(trade.resultat_id);
      const isLoss = trade.resultat_id === 2;
      const profit = isWin ? trade.risque * trade.rrp : -trade.risque;

      dayProfits[day] = (dayProfits[day] || 0) + profit;

      if (!hourStats[hour]) hourStats[hour] = { wins: 0, losses: 0 };
      if (isWin) hourStats[hour].wins++;
      if (isLoss) hourStats[hour].losses++;

      if (exit) {
        const duration = getMarketOpenDuration(entry, exit);
        tradeDurations.push(duration);
      }
    });

    const sortedDays = Object.entries(dayProfits).sort((a, b) => b[1] - a[1]);
    const bestDay = sortedDays[0]?.[0] || null;
    const worstDay = sortedDays.at(-1)?.[0] || null;

    const bestHour = Object.entries(hourStats)
      .map(([h, { wins, losses }]) => ({
        hour: h,
        rate: wins / (wins + losses || 1),
      }))
      .sort((a, b) => b.rate - a.rate)[0];

    const bestTradingHour = bestHour
      ? `${bestHour.hour}h - ${parseInt(bestHour.hour) + 2}h (${(bestHour.rate * 100).toFixed(0)}%)`
      : null;

    let average = "Données insuffisantes",
      min = null,
      max = null;

    if (tradeDurations.length) {
      const sum = tradeDurations.reduce((a, b) => a + b, 0);
      const avg = sum / tradeDurations.length;
      average = formatDuration(avg);
      min = formatDuration(Math.min(...tradeDurations));
      max = formatDuration(Math.max(...tradeDurations));
    }

    setMetrics({
      bestDay,
      worstDay,
      bestTradingHour,
      averageTradeDuration: average,
      minTradeDuration: min,
      maxTradeDuration: max,
    });
  }, [filteredTransactions]);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg w-full mx-auto h-auto">
      <h2 className="text-lg font-bold mb-4">Metrics temporelles</h2>
      <Metric label="📈 Meilleur jour de trading" value={metrics.bestDay} color="text-green-400" />
      <Metric label="📉 Pire jour de trading" value={metrics.worstDay} color="text-red-400" />
      <Metric label="⏰ Heure de trading la plus rentable" value={metrics.bestTradingHour} color="text-yellow-400" />
      <Metric label="⏳ Durée moyenne des trades" value={metrics.averageTradeDuration} color="text-blue-400" />
      {metrics.minTradeDuration && (
        <Metric label="⏱️ Durée minimale" value={metrics.minTradeDuration} color="text-teal-400" />
      )}
      {metrics.maxTradeDuration && (
        <Metric label="⏱️ Durée maximale" value={metrics.maxTradeDuration} color="text-pink-400" />
      )}
    </div>
  );
};

const Metric = ({ label, value, color }) => (
  <div className="mt-2">
    <p className="text-sm text-gray-400">
      <strong>{label} :</strong>
    </p>
    <p className={`text-md font-medium ${color}`}>{value || "Données insuffisantes"}</p>
  </div>
);

export default TimeMetrics;
