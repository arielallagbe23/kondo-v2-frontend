import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Connexion = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialiser l'erreur

    try {
      const response = await fetch("http://localhost:5001/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      // Stocker le token JWT et l'ID utilisateur dans le localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_id", data.user_id); // 🔥 Ajout du stockage de user_id
      
      console.log("✅ Connexion réussie !");
      console.log("🔹 Token JWT :", data.token);
      console.log("🔹 User ID :", data.user_id);

      // Rediriger vers la page principale
      navigate("/home");

      // 🔄 Recharger la page pour mettre à jour la navbar
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (err) {
      console.error("❌ Erreur de connexion :", err);
      setError(err.message);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-cyan-500">Connexion</h2>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="email"
            placeholder="Adresse email"
            className="w-full p-3 border rounded-md dark:bg-gray-700"
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

          <button
            type="submit"
            className="w-full bg-cyan-500 text-white py-2 rounded-md mt-4 hover:bg-cyan-600 transition"
          >
            Se connecter
          </button>
        </form>

        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Pas encore inscrit ?{" "}
          <a href="/inscription" className="text-cyan-500 hover:underline">
            Créez un compte
          </a>
        </p>
      </div>
    </div>
  );
};

export default Connexion;
