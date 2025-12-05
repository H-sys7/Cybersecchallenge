Rapport de Sécurité : Injection XSS Persistante via SVG
Projet : Nuit de l'Info - Site Événementiel "CyberNight" Type de faille : Stored XSS (Cross-Site Scripting Stocké) Vecteur d'attaque : Upload de fichier image (SVG) Niveau de risque : 🔴 CRITIQUE

1. Description de la Vulnérabilité
   L'application permet aux utilisateurs d'uploader des documents (badges, justificatifs) via l'interface du Chatbot. Le site accepte les fichiers au format SVG (Scalable Vector Graphics) sans validation stricte du contenu ni nettoyage (sanitization).

Le problème réside dans la manière dont le fichier est restitué à l'utilisateur : L'application utilise la balise HTML <object> pour afficher l'image uploadée. Contrairement à une balise <img> classique, la balise <object> demande au navigateur d'interpréter le fichier SVG comme un document XML complet.

Si le fichier SVG contient des balises <script>, le code JavaScript qu'elles contiennent est exécuté immédiatement dans le contexte du navigateur de la victime.

2. Protocole de Reproduction (Proof of Concept)
   Pour observer la vulnérabilité en action sur notre plateforme de démonstration :

Lien d'accès : [INSÉRER TON LIEN ICI]

Étapes :
Accès : Rendez-vous sur la page d'accueil du site événementiel.

Interaction : Ouvrez le Chatbot en cliquant sur la bulle en bas à droite.

Upload : Cliquez sur l'icône Trombone (📎) pour joindre un fichier.

Injection : Sélectionnez le fichier malveillant virus.svg fourni (ou tout SVG contenant un script).

Exécution : Dès que l'image s'affiche dans la conversation :

Le script caché s'exécute.

L'interface du site est modifiée (changement de couleur, messages d'alerte).

L'intégrité visuelle et fonctionnelle de la page est compromise.

3. Analyse Technique
   Code Vulnérable (Frontend)
   Le développeur a utilisé la balise <object> pour garantir le rendu vectoriel, sans conscience des risques d'exécution de code :

JavaScript

// Mauvaise pratique identifiée
messageDiv.innerHTML = `<object data="${urlFichier}" type="image/svg+xml"></object>`;
Charge Utile (Payload SVG)
Le fichier virus.svg est un fichier XML valide qui contient une charge JavaScript dissimulée :

XML

<svg xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="red" />
  
  <script type="text/javascript">
      // Envoie un signal au site parent pour déclencher l'effet "HACKED"
      window.top.postMessage('HACKED', '*');
  </script>
</svg>
4. Impact Potentiel
Dans un scénario réel, cette faille permettrait à un attaquant de :

Voler de session (Session Hijacking) : Récupérer les cookies document.cookie et voler la session des administrateurs ou des autres utilisateurs voyant l'image.

Phishing (Hameçonnage) : Afficher de faux formulaires de connexion par-dessus le site légitime pour voler des mots de passe.

Redirection : Forcer la redirection des visiteurs vers un site malveillant.

Actions non consenties (CSRF) : Forcer l'utilisateur à effectuer des actions à son insu (ex: supprimer des données, changer un mot de passe).

5. Comment se protéger (Remédiation)
   Pour corriger cette faille, plusieurs niveaux de défense doivent être mis en place :

A. Changement de Balise (Solution immédiate)
Remplacer la balise <object> ou <iframe> par la balise <img>. Les navigateurs modernes bloquent l'exécution de scripts à l'intérieur d'une balise <img> pour les fichiers SVG.

HTML

<img src="/uploads/image.svg" alt="Fichier utilisateur">
B. Content Security Policy (CSP)
Configurer les en-têtes HTTP pour interdire l'exécution de scripts inline ou provenant de sources non fiables.

HTTP

Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
L'instruction object-src 'none' empêcherait spécifiquement le chargement de plugins ou d'objets SVG exécutables.

C. Nettoyage (Sanitization)
Traiter les fichiers SVG côté serveur avant de les enregistrer. Utiliser des librairies comme DOMPurify (JS) ou defusedxml (Python) pour retirer toutes les balises <script> et les attributs événementiels (onload, onclick) du code XML du SVG.

D. Isolation (Sandboxing)
Servir les fichiers uploadés depuis un sous-domaine différent (ex: cdn.site.com au lieu de site.com). Ainsi, même si un script s'exécute, il n'aura pas accès aux cookies et au stockage local du domaine principal (Same-Origin Policy).

Ce document a été réalisé dans le cadre de la Nuit de l'Info à des fins pédagogiques pour démontrer l'importance de la validation des entrées utilisateurs
