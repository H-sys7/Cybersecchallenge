const puppeteer = require("puppeteer");

(async () => {
  console.log("🤖 Lancement du Bot Administrateur...");
  // Lancement du navigateur (Headless = invisible)
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  try {
    // 1. L'Admin se connecte
    console.log("🤖 L'Admin se connecte...");
    await page.goto("http://localhost:3000/login.html"); // On créera cette page simple ou on simulera via API

    // Simulation de cookie (Plus simple que de remplir le formulaire)
    await page.setCookie({
      name: "user",
      value: "admin",
      domain: "localhost",
      url: "http://localhost:3000",
    });

    console.log("🤖 L'Admin visite la galerie des uploads...");
    // 2. L'Admin va voir la page où se trouve le piège
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });

    // On attend un peu que les scripts (et donc le virus) s'exécutent
    await new Promise((r) => setTimeout(r, 5000));

    console.log("🤖 L'Admin a fini sa ronde.");
  } catch (e) {
    console.error("Erreur du bot:", e);
  }

  await browser.close();
})();
