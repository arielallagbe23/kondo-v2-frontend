import React from "react";
import { format, parseISO, startOfWeek, startOfDay } from "date-fns";

const TradeFrequencyStats = ({ transactionSummaryFilteredTransactions }) => {
  if (!transactionSummaryFilteredTransactions || transactionSummaryFilteredTransactions.length === 0) {
    return <p className="text-center text-gray-500">Aucune transaction disponible.</p>;
  }

  // Compter les transactions par semaine
  const weeklyCounts = {};
  const dailyCounts = {};

  transactionSummaryFilteredTransactions.forEach((tx) => {
    const date = parseISO(tx.date_entree);

    const weekKey = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const dayKey = format(startOfDay(date), "yyyy-MM-dd");

    weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
    dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1;
  });

  const weeklyValues = Object.values(weeklyCounts);
  const dailyValues = Object.values(dailyCounts);

  const averagePerWeek = (weeklyValues.reduce((a, b) => a + b, 0) / weeklyValues.length).toFixed(2);
  const maxPerWeek = Math.max(...weeklyValues);
  const minPerWeek = Math.min(...weeklyValues);

  const averagePerDay = (dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length).toFixed(2);
  const maxPerDay = Math.max(...dailyValues);
  const minPerDay = Math.min(...dailyValues);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full">
      <h2 className="text-lg font-semibold mb-4">Statistiques Fréquence de Trading</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-200">
        <div>
          <h3 className="font-bold text-blue-400 mb-1">Par semaine :</h3>
          <p>Moyenne : {averagePerWeek} trades</p>
          <p>Max : {maxPerWeek} trades</p>
          <p>Min : {minPerWeek} trades</p>
        </div>
        <div>
          <h3 className="font-bold text-green-400 mb-1">Par jour :</h3>
          <p>Moyenne : {averagePerDay} trades</p>
          <p>Max : {maxPerDay} trades</p>
          <p>Min : {minPerDay} trades</p>
        </div>
      </div>
    </div>
  );
};

export default TradeFrequencyStats;
