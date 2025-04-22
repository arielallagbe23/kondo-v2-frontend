import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Inscription = () => {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerif, setPasswordVerif] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== passwordVerif) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    const payload = {
      nickname,
      email,
      password,
      password_verif: passwordVerif,
      type_abonnement_id: 1, // ✅ Valeur fixe
      type_user_id: 2, // ✅ Valeur fixe
    };

    try {
      const response = await fetch("http://localhost:5001/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription.");
      }

      console.log("✅ Inscription réussie !");
      navigate("/connexion");
    } catch (err) {
      console.error("❌ Erreur d'inscription :", err);
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-cyan-500">Inscription</h2>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="text"
            placeholder="Pseudo"
            className="w-full p-3 border rounded-md dark:bg-gray-700"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Adresse email"
            className="w-full p-3 border rounded-md mt-3 dark:bg-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full p-3 border rounded-md mt-3 dark:bg-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmation du mot de passe"
            className="w-full p-3 border rounded-md mt-3 dark:bg-gray-700"
            value={passwordVerif}
            onChange={(e) => setPasswordVerif(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-cyan-500 text-white py-2 rounded-md mt-4 hover:bg-cyan-600 transition"
          >
            S'inscrire
          </button>
        </form>

        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Déjà inscrit ? {" "}
          <a href="/connexion" className="text-cyan-500 hover:underline">
            Connectez-vous
          </a>
        </p>
      </div>
    </div>
  );
};

export default Inscription;
