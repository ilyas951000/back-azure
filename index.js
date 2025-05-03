// backend/index.js
const express = require("express");
const sql = require("mssql");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

// Configuration de la connexion SQL
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

// Route racine pour vérifier que l'API est en ligne
app.get("/", (req, res) => {
  res.send("✅ Serveur backend en ligne !");
});

// Exemple de route métier
app.get("/api/hello", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT TOP 1 message FROM Messages`;
    res.json({ message: result.recordset[0]?.message || "Aucun message" });
  } catch (err) {
    console.error("Erreur SQL:", err);
    res.status(500).send("Erreur serveur");
  }
});

// Démarrage du serveur
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Serveur backend démarré sur http://localhost:${port}`);
});
