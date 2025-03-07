import React from "react";

const OverwatchExplication = () => {
  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-4">
        Résumé des Stratégies de Gestion du Risque
      </h2>

      <div className="space-y-4">
        <div className="flex space-x-4">
          {/* Risque de base */}
          <div className="bg-gray-700 p-4 rounded-lg w-[50%]">
            <h3 className="text-xl font-semibold text-cyan-300">
              1. Risque de Base (Risque fixe)
            </h3>
            <p className="text-gray-300">
              Le risque est fixé à 0.5% du capital initial, quel que soit le PNL
              cumulé des transactions. Cela permet de limiter les pertes tout en
              ayant une approche conservatrice.
            </p>
            <ul className="text-gray-500">
              <li>- Risque constant : 0.5% du capital</li>
              <li>- Aucun ajustement basé sur le PNL.</li>
            </ul>
          </div>

          {/* Risque Ajusté */}
          <div className="bg-gray-700 p-4 rounded-lg w-[50%]">
            <h3 className="text-xl font-semibold text-orange-400">
              2. Risque Ajusté (RiskAdjusted)
            </h3>
            <p className="text-gray-300">
              Le risque commence à 0.5%, et augmente en fonction du PNL cumulé.
              Si le PNL dépasse certaines valeurs clés, le risque passe à 1%,
              puis à 2%, 4%, et enfin 5% en fonction des paliers du PNL.
            </p>
            <ul className="text-gray-500">
              <li>- PNL &gt;= 25% : Risque à 5%</li>
              <li>- PNL entre 14% et 25% : Risque à 4%</li>
              <li>- PNL entre 6% et 14% : Risque à 2%</li>
              <li>- PNL entre 3% et 6% : Risque à 1%</li>
              <li>- PNL &gt;= 3% : Risque à 0.5%</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          {/* Risque Ajusté II */}
          <div className="bg-gray-700 p-4 rounded-lg w-[50%]">
            <h3 className="text-xl font-semibold text-purple-400">
              3. Risque Ajusté II (Retour en arrière)
            </h3>
            <p className="text-gray-300">
              Ce modèle ajuste également le risque en fonction du PNL, mais
              introduit un retour automatique à une valeur de risque inférieure
              si le PNL baisse sous certains seuils. Cela vise à protéger le
              capital.
            </p>
            <ul className="text-gray-500">
              <li>- PNL &gt;= 3% : Risque à 1%</li>
              <li>- PNL &lt; 3% : Risque à 0.5%</li>
              <li>
                - Retour automatique : Si le PNL descend sous 3%, le risque
                revient à 0.5%.
              </li>
            </ul>
          </div>

          {/* Risque Ajusté III (Intérêt Composé) */}
          <div className="bg-gray-700 p-4 rounded-lg w-[50%]">
            <h3 className="text-xl font-semibold text-blue-400">
              4. Risque Ajusté III (Intérêt Composé)
            </h3>
            <p className="text-gray-300">
              Ce modèle applique une approche d'intérêt composé où le risque est
              ajusté à 1% à partir d'un PNL de 3%. Le risque est calculé de
              manière cumulative à partir du PNL précédent, arrondi à 2
              décimales.
            </p>
            <ul className="text-gray-500">
              <li>- PNL entre 0 et 3% : Risque à 0.5%</li>
              <li>
                - PNL &gt;= 3% : Risque à 1% avec calcul d’intérêt composé
              </li>
              <li>- Retour à 0.5% si le PNL descend en dessous de 3%.</li>
              <li>
                - Le risque est mis à jour en fonction du PNL cumulé, et ajusté
                en continu via une méthode d’intérêt composé.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverwatchExplication;
