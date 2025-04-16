import React from "react";

const TradeFrequencyStats = ({ transactionSummaryFilteredTransactions }) => {
  const tradesByDay = {};
  const tradesByWeek = {};

  transactionSummaryFilteredTransactions.forEach((tx) => {
    if (!tx.date_entree) return;

    const date = new Date(tx.date_entree);
    const dayKey = date.toLocaleDateString("fr-FR");

    const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;

    tradesByDay[dayKey] = (tradesByDay[dayKey] || 0) + 1;
    tradesByWeek[weekKey] = (tradesByWeek[weekKey] || 0) + 1;
  });

  const tradesPerDay = Object.values(tradesByDay);
  const tradesPerWeek = Object.values(tradesByWeek);

  const average = (arr) => arr.reduce((acc, val) => acc + val, 0) / arr.length || 0;
  const max = (arr) => Math.max(...arr);
  const min = (arr) => Math.min(...arr);

  return (
    <div className="bg-white dark:bg-gray-900 w-full p-4 rounded-xl">
      <h2 className="text-lg font-bold mb-4">Fréquence des Trades</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-bold mb-1">Par Semaine</div>
          <div>Moyenne : {average(tradesPerWeek).toFixed(2)} trades</div>
          <div>Max : {max(tradesPerWeek)} trades</div>
          <div>Min : {min(tradesPerWeek)} trades</div>
        </div>

        <div>
          <div className="font-bold mb-1">Par Jour</div>
          <div>Moyenne : {average(tradesPerDay).toFixed(2)} trades</div>
          <div>Max : {max(tradesPerDay)} trades</div>
          <div>Min : {min(tradesPerDay)} trades</div>
        </div>
      </div>
    </div>
  );
};

export default TradeFrequencyStats;
 