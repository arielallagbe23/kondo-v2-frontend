import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

// Palette de couleurs vives
const quarterColors = [
  "#00E0D8", // Teal
  "#FF4081", // Rose
  "#9C27B0", // Violet
  "#FFC107"  // Jaune
];

const QuarterlyDoughnutChart = ({ transactionSummaryFilteredTransactions }) => {
  const transactions = transactionSummaryFilteredTransactions;

  // Calcul des bénéfices par trimestre
  const quarterlyData = useMemo(() => {
    const quarters = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

    transactions.forEach((trx) => {
      if (!trx.date_entree) return;
      const dateObj = new Date(trx.date_entree);
      const month = dateObj.getMonth() + 1;

      const risque = parseFloat(trx.risque) || 0;
      const rrp = parseFloat(trx.rrp) || 0;
      let benef = 0;

      if (trx.resultat === "SL") {
        benef = -risque;
      } else if (trx.resultat === "BE") {
        benef = 0;
      } else if (trx.resultat === "TP" || trx.resultat === "SL->TP") {
        benef = risque * rrp;
      }

      if (month >= 1 && month <= 3) {
        quarters.Q1 += benef;
      } else if (month >= 4 && month <= 6) {
        quarters.Q2 += benef;
      } else if (month >= 7 && month <= 9) {
        quarters.Q3 += benef;
      } else if (month >= 10 && month <= 12) {
        quarters.Q4 += benef;
      }
    });

    // Arrondi à 2 décimales
    quarters.Q1 = parseFloat(quarters.Q1.toFixed(2));
    quarters.Q2 = parseFloat(quarters.Q2.toFixed(2));
    quarters.Q3 = parseFloat(quarters.Q3.toFixed(2));
    quarters.Q4 = parseFloat(quarters.Q4.toFixed(2));

    return [
      { name: "Q1", benefice: quarters.Q1 },
      { name: "Q2", benefice: quarters.Q2 },
      { name: "Q3", benefice: quarters.Q3 },
      { name: "Q4", benefice: quarters.Q4 }
    ];
  }, [transactions]);

  return (
    <div className="bg-gray-900 text-white rounded-lg w-full p-4 h-auto">
      <h2 className="text-lg font-bold mb-4">Bénéfices par Trimestre</h2>
      <div style={{ width: "100%", height: 500 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={quarterlyData}
              dataKey="benefice"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={190}
              innerRadius={120} // Donut
              label
            >
              {quarterlyData.map((entry, index) => (
                <Cell
                  key={`cell-quarter-${index}`}
                  fill={quarterColors[index % quarterColors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            {/* Legend supprimé */}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Légende personnalisée en bas */}
      <div className="flex justify-center space-x-4 mt-4">
        {quarterlyData.map((entry, index) => (
          <div key={entry.name} className="flex items-center space-x-2">
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: quarterColors[index],
                borderRadius: 4
              }}
            />
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuarterlyDoughnutChart;
