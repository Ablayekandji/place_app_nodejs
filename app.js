const fs = require('fs');
const csv = require('csv-parser');
const express = require('express');
const app = express();

// Endpoint pour rechercher des lieux
app.get('/recherche', (req, res) => {
    const nomRecherche = req.query.name.toLowerCase();
    const resultats = [];

    fs.createReadStream('dakar_place_v6.csv')
        .pipe(csv())
        .on('data', (row) => {
            if (row.lieu.toLowerCase().startsWith(nomRecherche) || row.lieu.toLowerCase().includes(nomRecherche)) {
                const lieu = {
                    lieu: row.lieu,
                    latitude: parseFloat(row.latitude), 
                    longitude: parseFloat(row.longitude)
                  };
                resultats.push(lieu);
            }
        })
        .on('end', () => {
            if (resultats.length > 0) {
                res.json(resultats);
            } else {
                res.status(202).json({ message: `Aucun lieu trouvé pour '${nomRecherche}'.` });
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
