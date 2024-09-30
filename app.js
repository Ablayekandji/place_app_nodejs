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
    //const resultats = [];
    const resultats = new Map();
    if (!nomRecherche) {
      return res.status(202).json({ message: "Paramètre 'nom' manquant." });
    }
  
    const nomRechercheSansAccents = removeAccents(nomRecherche.toLowerCase());

    fs.createReadStream('region_de_dakar_places_v7_last.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Vérifie si le lieu contient le nom recherché (recherche non sensible à la casse)
        const lieuSansAccents = removeAccents(row.lieu.toLowerCase());
        if (lieuSansAccents.includes(nomRechercheSansAccents.toLowerCase())) {
          // Convertir latitude et longitude en float
          const lieuKey = lieuSansAccents;
          if (!resultats.has(lieuKey)) {
            // Convertir latitude et longitude en float
            const lieu = {
              lieu: row.lieu,
              latitude: parseFloat(row.latitude), // Conversion en float
              longitude: parseFloat(row.longitude) // Conversion en float
            };
            resultats.set(lieuKey, lieu); // Ajouter le lieu unique à la Map
          }
        }
      })
      .on('end', () => {
        const lieuxUniques = Array.from(resultats.values());
        if (lieuxUniques.length > 0) {
            // Trier les résultats en fonction de la similarité avec 'nomRecherche'
            lieuxUniques.sort((a, b) => {
              const distanceA = levenshtein.get(nomRechercheSansAccents, removeAccents(a.lieu.toLowerCase()));
              const distanceB = levenshtein.get(nomRechercheSansAccents, removeAccents(b.lieu.toLowerCase()));
              return distanceA - distanceB; // Trier par distance croissante
            });
    
            res.json(lieuxUniques); // Retourne les résultats uniques triés au format JSON
          } else {
          res.status(202).json({ message: `Aucun lieu trouvé pour '${nomRecherche}'.` });
        }
      })
      .on('error', (err) => {
        res.status(500).json({ message: 'Erreur lors de la lecture du fichier.' });
    });
  });
  
  // Démarrer le serveur
  app.listen(3000, () => {
    console.log(`Serveur lancé sur le port ${3000}`);
  });