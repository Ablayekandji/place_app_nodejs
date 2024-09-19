const fs = require('fs');
const csv = require('csv-parser');
const express = require('express');
const levenshtein = require('fast-levenshtein');
const app = express();

// Endpoint pour rechercher des lieux
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
app.get('/recherche', (req, res) => {
    const nomRecherche = req.query.name;
    const resultats = [];
  
    if (!nomRecherche) {
      return res.json({ message: "Paramètre 'nom' manquant." });
    }
  
    const nomRechercheSansAccents = removeAccents(nomRecherche.toLowerCase());

    fs.createReadStream('dakar_place_v6.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Vérifie si le lieu contient le nom recherché (recherche non sensible à la casse)
        const lieuSansAccents = removeAccents(row.lieu.toLowerCase());
        if (lieuSansAccents.includes(nomRechercheSansAccents.toLowerCase())) {
          // Convertir latitude et longitude en float
          const lieu = {
            lieu: row.lieu,
            latitude: parseFloat(row.latitude), // Conversion en float
            longitude: parseFloat(row.longitude) // Conversion en float
          };
          resultats.push(lieu);
        }
      })
      .on('end', () => {
        if (resultats.length > 0) {
          // Trier les résultats en fonction de la similarité avec 'nomRecherche'
          resultats.sort((a, b) => {
            const distanceA = levenshtein.get(nomRecherche.toLowerCase(), a.lieu.toLowerCase());
            const distanceB = levenshtein.get(nomRecherche.toLowerCase(), b.lieu.toLowerCase());
            return distanceA - distanceB; // Trier par distance croissante
          });
  
          res.json(resultats); // Retourne les résultats triés au format JSON
        } else {
          res.json({ message: `Aucun lieu trouvé pour '${nomRecherche}'.` });
        }
      });
  });
  
  // Démarrer le serveur
  app.listen(3000, () => {
    console.log(`Serveur lancé sur le port ${3000}`);
  });