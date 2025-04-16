import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const semesterColors = [
  "#00E0D8", // Vert
  "#FF4081", // Rose
];

const SemesterDoughnutChart = ({ transactionSummaryFilteredTransactions }) => {
  const transactions = transactionSummaryFilteredTransactions;

  // Calcul du bénéfice selon vos règles
  function calculerBenefice(trx) {
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
    return parseFloat(benef.toFixed(2));
  }

  // Calcul des bénéfices par semestre en cumulant les trimestres
  const semesterData = useMemo(() => {
    let Q1 = 0,
      Q2 = 0,
      Q3 = 0,
      Q4 = 0;

    transactions.forEach((trx) => {
      if (!trx.date_entree) return;
      const dateObj = new Date(trx.date_entree);
      const month = dateObj.getMonth() + 1;
      const benef = calculerBenefice(trx);

      if (month >= 1 && month <= 3) {
        Q1 += benef;
      } else if (month >= 4 && month <= 6) {
        Q2 += benef;
      } else if (month >= 7 && month <= 9) {
        Q3 += benef;
      } else if (month >= 10 && month <= 12) {
        Q4 += benef;
      }
    });

    Q1 = parseFloat(Q1.toFixed(2));
    Q2 = parseFloat(Q2.toFixed(2));
    Q3 = parseFloat(Q3.toFixed(2));
    Q4 = parseFloat(Q4.toFixed(2));

    const s1 = parseFloat((Q1 + Q2).toFixed(2));
    const s2 = parseFloat((Q3 + Q4).toFixed(2));

    return [
      { name: "S1", benefice: s1 },
      { name: "S2", benefice: s2 },
    ];
  }, [transactions]);

  return (
    <div className="bg-gray-900 text-white rounded-lg w-full p-4">
      <h2 className="text-lg font-bold mb-4">Bénéfices par Semestre</h2>
      {/* Conteneur du graphique avec une hauteur augmentée */}
      <div style={{ width: "100%", height: 500 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={semesterData}
              dataKey="benefice"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={190}
              innerRadius={120} // Effet donut
              label
            >
              {semesterData.map((entry, index) => (
                <Cell
                  key={`cell-semester-${index}`}
                  fill={semesterColors[index % semesterColors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            {/* Suppression de la légende intégrée */}
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Légende personnalisée en bas */}
      <div className="flex justify-center space-x-4 mt-4">
        {semesterData.map((entry, index) => (
          <div key={entry.name} className="flex items-center space-x-2">
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: semesterColors[index],
                borderRadius: 4,
              }}
            />
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SemesterDoughnutChart;
