import React from "react";

const FilteredMemo = ({ filteredTransactions, capital2 }) => {
  if (!filteredTransactions.length) {
    return <p className="text-center text-gray-500">Aucune transaction trouvée.</p>;
  }

  console.log("🔍 Valeur de `capital2` avant conversion:", capital2, "Type:", typeof capital2);

  // ✅ Conversion sécurisée de capital2
  const capitalNumerique = capital2 !== undefined ? parseFloat(capital2) : 200000;
  console.log("✅ Valeur de `capitalNumerique` après conversion:", capitalNumerique, "Type:", typeof capitalNumerique);

  // 🔹 Calcul des bénéfices en % et en cash
  let totalBeneficePourcentage = 0;

  filteredTransactions.forEach((transaction) => {
    const { resultat_id, risque, rrp } = transaction;
    const risquePourcentage = parseFloat(risque) / 100 || 0;
    const rrpFloat = parseFloat(rrp) || 1;

    let beneficePourcentage = 0;

    switch (resultat_id) {
      case 1: // Break Even (BE)
        beneficePourcentage = 0;
        break;
      case 2: // Stop Loss (SL)
        beneficePourcentage = -risquePourcentage;
        break;
      case 3: // Take Profit (TP)
      case 4: // SL->TP
        beneficePourcentage = risquePourcentage * rrpFloat;
        break;
      default:
        beneficePourcentage = 0;
    }

    totalBeneficePourcentage += beneficePourcentage;
  });

  // ✅ Calcul du capital final
  const capitalFinal = capitalNumerique + (capitalNumerique * totalBeneficePourcentage);
  console.log("💰 Capital final calculé:", capitalFinal, "Type:", typeof capitalFinal);

  // ✅ Détermination de la couleur du capital final
  const capitalColor = capitalFinal > capitalNumerique ? "text-green-400" : capitalFinal < capitalNumerique ? "text-red-400" : "text-gray-300";

  // 🔹 Nombre total de transactions filtrées
  const nombreTransactions = filteredTransactions.length;

  // ✅ Extraction des dates
  console.log("📆 Transactions avec dates d'entrée :", filteredTransactions.map(t => t.date_entree));

  const dates = filteredTransactions
    .map((transaction) => new Date(transaction.date_entree))
    .filter((date) => !isNaN(date.getTime())); // Filtrer uniquement les dates valides

  if (dates.length === 0) {
    console.warn("⚠️ Aucune date valide trouvée.");
  }

  // ✅ Calcul de la durée de visualisation en jours
  const datePlusAncienne = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
  const datePlusRecente = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

  let dureeVisualisation = datePlusRecente && datePlusAncienne
    ? Math.max(1, Math.ceil((datePlusRecente - datePlusAncienne) / (1000 * 60 * 60 * 24)))
    : 0;

  console.log("📅 Date la plus ancienne:", datePlusAncienne);
  console.log("📅 Date la plus récente:", datePlusRecente);
  console.log("⏳ Durée de visualisation:", dureeVisualisation, "jours");

  // ✅ Conversion en mois, semaines et jours
  const mois = Math.floor(dureeVisualisation / 30);
  const semaines = Math.floor((dureeVisualisation % 30) / 7);
  const jours = (dureeVisualisation % 30) % 7;

  let dureeTexte = "";
  if (mois > 0) dureeTexte += `${mois} mois `;
  if (semaines > 0) dureeTexte += `${semaines} semaine${semaines > 1 ? "s" : ""} `;
  if (jours > 0) dureeTexte += `${jours} jour${jours > 1 ? "s" : ""}`;

  dureeTexte = dureeTexte.trim() || "0 jour";

  return (
    <div className="h-full text-sm text-gray-300 flex flex-col">
      <div className="text-lg font-bold mb-1">Memo</div>
      <p>
        Vous êtes passé de <span className="font-semibold">{capital2}$</span> à 
        <span className={`font-semibold ${capitalColor}`}> {capitalFinal.toFixed(2)}$</span>, 
        ce qui représente une 
        <span className={`font-semibold ${totalBeneficePourcentage >= 0 ? "text-green-400" : "text-red-400"}`}>
          {totalBeneficePourcentage >= 0 ? ` bénéfice de ${(totalBeneficePourcentage * 100).toFixed(2)}% ` : ` perte de ${(totalBeneficePourcentage * 100).toFixed(2)}%`} 
        </span> 
        sur <span className="font-semibold">{nombreTransactions}</span> transactions,
      </p>
      <p>
        pendant <span className="font-semibold">{dureeTexte}</span>.
      </p>
    </div>
  );
};

export default FilteredMemo;
