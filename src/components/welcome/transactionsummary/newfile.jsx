import React, { useMemo } from "react";

const ClassementActifsParPNL = ({ transactionSummaryFilteredTransactions = [] }) => {
  const classement = useMemo(() => {
    const stats = {};

    transactionSummaryFilteredTransactions.forEach((tx) => {
      const nomActif = tx.nom_actif;
      const rrp = parseFloat(tx.rrp) || 0;
      const risque = parseFloat(tx.risque) || 0;
      const resultat = tx.resultat;

      if (!stats[nomActif]) stats[nomActif] = 0;

      if (resultat === "TP" || resultat === "SL->TP") {
        stats[nomActif] += risque * 2 * rrp;
      } else if (resultat === "SL") {
        stats[nomActif] -= risque * 2;
      }
      // BE = 0 → rien à faire
    });

    return Object.entries(stats)
      .map(([nom, pnl]) => ({
        nom,
        pnl: parseFloat(pnl.toFixed(2)),
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [transactionSummaryFilteredTransactions]);

  return (
    <div className="bg-white dark:bg-gray-900 w-full rounded-lg p-4 space-y-2@">
      <ul className="space-y-2">
        {classement.map((actif, index) => (
          <li
            key={actif.nom}
            className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1"
          >
            <span className="font-medium">{index + 1}. {actif.nom}</span>
            <span
              className={`font-bold ${
                actif.pnl >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {actif.pnl} %
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassementActifsParPNL;
