// index.js
const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const app = express();
app.use(cors());

// Configuration Azure Key Vault
const vaultName = process.env.KEY_VAULT_NAME || "<TON-VAULT-NAME>";
const kvUrl = `https://${vaultName}.vault.azure.net`;
const credential = new DefaultAzureCredential();
const client = new SecretClient(kvUrl, credential);

// Fonction récupérant la configuration SQL depuis Key Vault
async function getDbConfig() {
  const [userSec, pwdSec, serverSec, dbSec] = await Promise.all([
    client.getSecret("DB-USER"),
    client.getSecret("DB-PASSWORD"),
    client.getSecret("DB-SERVER"),
    client.getSecret("DB-NAME"),
  ]);
  return {
    user: userSec.value,
    password: pwdSec.value,
    server: serverSec.value,
    database: dbSec.value,
    options: { encrypt: true, trustServerCertificate: false }
  };
}

// Route de santé
app.get("/", (req, res) => {
  res.send("✅ Serveur backend en ligne !");
});

// Route API testant la connexion SQL
app.get("/api/hello", async (req, res) => {
  try {
    const config = await getDbConfig();
    await sql.connect(config);
    const result = await sql.query`SELECT TOP 1 message FROM Messages`;
    res.json({ message: result.recordset[0]?.message || "Aucun message" });
  } catch (err) {
    console.error("Erreur SQL:", err);
    res.status(500).send(`❌ Erreur serveur : ${err.message}`);
  }
});

// Démarrage du serveur
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Serveur démarré sur le port ${port}`);
});
