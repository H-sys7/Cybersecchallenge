const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Création du dossier uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Config Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Route d'upload
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier" });
  console.log(
    `[SERVEUR] Fichier reçu via le Chatbot : ${req.file.originalname}`
  );

  // On renvoie le chemin pour que le chatbot puisse l'afficher
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

app.listen(PORT, () => {
  console.log(`🚀 Site Événementiel lancé sur http://localhost:${PORT}`);
});

const PORT = process.env.PORT || 3000; // Render va remplir process.env.PORT

server.listen(PORT, () => {
    console.log(`🔥 Serveur lancé sur le port ${PORT}`);
});
