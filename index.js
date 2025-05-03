// index.js
const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());

// Configuration Azure SQL
const config = {
  user: process.env.DB_USER, // doit inclure @nomduserv
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// Route de test
app.get("/", (req, res) => {
  res.send("✅ Serveur backend en ligne !");
});

// Route API testant SQL
app.get("/api/hello", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT TOP 1 message FROM Messages`;
    res.json({ message: result.recordset[0]?.message || "Aucun message" });
  } catch (err) {
    console.error("Erreur SQL:", err);
    res.status(500).send(`❌ Erreur serveur : ${err.message}`);
  }
});

// Lancer le serveur
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Serveur démarré sur le port ${port}`);
});
