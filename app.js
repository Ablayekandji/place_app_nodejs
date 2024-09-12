const fs = require('fs');
const csv = require('csv-parser');
const express = require('express');
const app = express();

// Endpoint pour rechercher des lieux
app.get('/recherche', (req, res) => {
    const nomRecherche = req.query.nom.toLowerCase();
    const resultats = [];

    fs.createReadStream('region_de_dakar_places.csv')
        .pipe(csv())
        .on('data', (row) => {
            if (row.lieu.toLowerCase().startsWith(nomRecherche) || row.lieu.toLowerCase().includes(nomRecherche)) {
                resultats.push(row);
            }
        })
        .on('end', () => {
            if (resultats.length > 0) {
                res.json(resultats);
            } else {
                res.json({ message: `Aucun lieu trouvé pour '${nomRecherche}'.` });
            }
        })
        .on('error', (err) => {
            res.status(500).json({ message: 'Erreur lors de la lecture du fichier.' });
        });
});

// Démarrer le serveur sur le port 3000
app.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
});
