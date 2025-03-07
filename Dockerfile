# Utilisez l'image officielle Node.js
FROM node:14

# Définissez le répertoire de travail
WORKDIR /app

# Copiez les fichiers React dans le conteneur
COPY . .

# Installez les dépendances
RUN npm install

# Construisez l'application React
RUN npm run build

# Exposez le port pour l'application React (ajustez-le selon vos besoins)
EXPOSE 3003

# Commande pour démarrer l'application React
CMD ["npm", "start"]
 