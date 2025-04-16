import { useState } from "react";

const UpdateDecision = ({ sessionBacktestId }) => {
  const [decision, setDecision] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    if (!decision) {
      setMessage("❌ Veuillez choisir une décision.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Utilisateur non authentifié !");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5001/api/sessions/updateSessionDecision/${sessionBacktestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ decision }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Décision mise à jour !");
      } else {
        setMessage(`❌ Erreur : ${data.error || "Échec de la mise à jour"}`);
      }
    } catch (err) {
      console.error("❌ Erreur réseau :", err);
      setMessage("❌ Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col text-white">
      <div className="text-lg font-bold mb-2">📋 Valider la session</div>

      <select
        value={decision}
        onChange={(e) => setDecision(e.target.value)}
        className="w-full rounded bg-gray-800 text-white text-sm p-2 mb-4"
        disabled={loading}
      >
        <option value="">Choisir une décision</option>
        <option value="valid">Valid</option>
        <option value="invalid">Invalid</option>
        <option value="recommandé">Recommandé</option>
      </select>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className={`text-white text-xs p-2 rounded-lg font-medium transition-colors duration-200 w-1/2 mb-2 ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-cyan-600 hover:bg-cyan-700"
        }`}
      >
        {loading ? "Mise à jour..." : "Modifier"}
      </button>

      {message && <div className="text-sm mt-2">{message}</div>}
    </div>
  );
};

export default UpdateDecision;
