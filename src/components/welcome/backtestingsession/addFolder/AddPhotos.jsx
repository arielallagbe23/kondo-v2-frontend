import React, { useState } from "react";
import axios from "axios";

const AddPhotos = ({ sessionBacktestId, showAlert }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // 📌 Gestion de la sélection de fichier
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + selectedImages.length > 10) {
      showAlert("Vous ne pouvez sélectionner que 10 images maximum.", "error");
      return;
    }
    setSelectedImages((prevImages) => [...prevImages, ...files]);
  };

  // 📌 Envoi des images vers le backend
  const handleImageUpload = async () => {
    if (selectedImages.length === 0) {
      showAlert("Veuillez sélectionner au moins une image.", "error");
      return;
    }

    setUploadingImages(true);

    try {
      const uploadPromises = selectedImages.map((image) => {
        const formData = new FormData();
        formData.append("photo", image);
        formData.append("session_backtest_id", sessionBacktestId);

        return axios.post("http://localhost:5001/api/sessions/photos/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      });

      const responses = await Promise.all(uploadPromises);
      const uploadedUrls = responses.map((res) => res.data.photoUrl);

      setUploadedImages((prevUrls) => [...prevUrls, ...uploadedUrls]);
      setSelectedImages([]); // Reset après envoi
      showAlert("Toutes les images ont été envoyées avec succès !", "success");

    } catch (error) {
      console.error("❌ Erreur lors de l'upload des images :", error);
      showAlert("Erreur lors de l'upload des images.", "error");
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <div className="px-2 py-4 bg-white dark:bg-gray-900 rounded-lg mt-4 h-auto w-full">
      <div className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Ajouter des images</div>

      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900 text-xs font-extralight"/>

      <button
        onClick={handleImageUpload}
        disabled={uploadingImages}
        className="mt-4 p-2 bg-cyan-600 text-white text-xs rounded-lg hover:bg-cyan-700 transition font-extralight"
      >
        {uploadingImages ? "Envoi en cours..." : "Uploader les images"}
      </button>

      {/* Aperçu des images sélectionnées */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {selectedImages.map((image, index) => (
          <div key={index} className="relative">
            <img src={URL.createObjectURL(image)} alt={`Prévisualisation ${index + 1}`} className="w-32 h-32 object-cover rounded-lg"/>
          </div>
        ))}
      </div>

      {/* Affichage des images après upload */}
      <div className="">
        {uploadedImages.map((url, index) => (
          <div key={index} className="relative">
            <img src={url} alt={`Image ${index + 1}`} className="w-32 h-32 object-cover rounded-lg"/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddPhotos;
