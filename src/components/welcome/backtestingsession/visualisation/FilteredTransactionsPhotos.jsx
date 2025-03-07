import React, { useEffect, useState } from "react";
import axios from "axios";

const FilteredTransactionsPhotos = ({ sessionBacktestId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/sessions/photos/${sessionBacktestId}`);
        setPhotos(response.data.photos);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des photos :", error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionBacktestId) {
      fetchPhotos();
    }
  }, [sessionBacktestId]);

  return (
    <div className="w-full h-auto p-2 overflow-hidden">
      <div className="w-full overflow-x-auto flex space-x-2" style={{ whiteSpace: "nowrap" }}>
        {loading ? (
          <p className="text-gray-500">Chargement des photos...</p>
        ) : photos.length > 0 ? (
          photos.map((photo, index) => (
            <img
              key={index}
              src={photo.photo_url}
              alt={`Photo ${index + 1}`}
              className="h-[500px] w-auto rounded-lg shadow-lg"
              style={{ display: "inline-block", maxWidth: "100%", minWidth: "800px" }}
              onError={(e) => { e.target.src = "https://via.placeholder.com/800"; }}
            />
          ))
        ) : (
          <p className="text-gray-500">Aucune photo disponible.</p>
        )}
      </div>
    </div>
  );
};

export default FilteredTransactionsPhotos;
