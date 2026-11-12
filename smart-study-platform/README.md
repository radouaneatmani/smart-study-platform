# Smart Study Platform (Plateforme d'?tude Intelligente)

Plateforme d?apprentissage moderne aliment?e par l?intelligence artificielle, con?ue pour permettre aux ?tudiants de t?l?verser leurs supports de cours (PDF, DOCX, TXT) et de g?n?rer instantan?ment des r?sum?s, des quiz QCM interactifs, des flashcards de r?vision et de dialoguer avec un tuteur p?dagogique IA.

---

## ??? Technologies Utilis?es

- **Frontend** : React 18, Material UI (MUI v5), React Router DOM v6, Emotion, Lucide Icons, jsPDF & html2canvas, Axios.
- **Backend** : Java 21, Spring Boot 3.3, Spring Security, JWT (JJWT 0.12), Spring Data MongoDB, Apache PDFBox, Apache POI.
- **Base de donn?es** : MongoDB (Port 27017).
- **Intelligence Artificielle** : Moteur hybride :
  - Support de l'API **Google Gemini** et **OpenAI** (configurable via profil ou application.properties)
  - Moteur s?mantique p?dagogique expert int?gr? fonctionnant 100% hors-ligne sans cl? payante requise !

---

## ? Fonctionnalit?s Impl?ment?es de A ? Z

1. **Authentification & Profil S?curis?** :
   - Inscription et Connexion par Token JWT avec cryptage BCrypt des mots de passe.
   - Bouton de **Connexion D?mo en 1 clic** (Alexandre Martin : `etudiant` / `etudiant123`).
   - Gestion du profil, objectifs d'heures d'?tude par semaine et ajout optionnel de cl?s API Gemini / OpenAI.

2. **Gestion des Mati?res** :
   - Pr?-charg?es par d?faut :
     - ?? *Algorithmique*
     - ?? *Syst?mes d?exploitation*
     - ?? *Java*
     - ?? *Intelligence artificielle*
     - ?? *Syst?mes de gestion de bases de donn?es*
   - Cr?ation, modification, code couleur personnalis? et suppression de mati?res.

3. **T?l?versement & Analyse de Documents** :
   - Formats accept?s : **PDF**, **DOCX**, **TXT** (jusqu'? 50 Mo).
   - Extraction automatique du texte avec Apache PDFBox et Apache POI.
   - G?n?ration instantan?e du r?sum? et des concepts cl?s d?s le t?l?versement.

4. **R?sum?s Intelligents par l?IA** :
   - **R?sum? Court** (synth?se ex?cutive).
   - **R?sum? D?taill?** (structure par chapitres et axes d'apprentissage).
   - **Concepts Cl?s** (badges et notions indispensables).
   - **Export en PDF** : bouton d'exportation haute fid?lit? avec mise en page universitaire.

5. **Gestionnaire de Notes & Dossiers** :
   - Cr?ation, modification, suppression et classification dans des dossiers (*G?n?ral*, *Th?orie*, *Exercices*, *Examens*).
   - Syst?me de tags et recherche en temps r?el.
   - Export de n'importe quelle note en PDF.

6. **G?n?rateur & Passage de Quiz IA** :
   - G?n?ration automatique de QCMs ? 4 choix (A, B, C, D) sur base d'un document ou d'un sujet libre.
   - Interface de passage interactive.
   - Correction instantan?e, calcul automatique du score en pourcentage et justifications didactiques pour chaque question.
   - Historique complet des tentatives.

7. **Flashcards R?vision Spac?e** :
   - Cartes recto/verso avec animation 3D au clic.
   - Suivi de la ma?trise : *? revoir*, *Je sais (Ma?tris?)*.
   - G?n?rateur automatique de flashcards par l'IA ou cr?ation manuelle.
   - M?lange al?atoire (Shuffle) et barre de progression.

8. **Tuteur IA P?dagogique** :
   - Chat interactif disponible 24/7.
   - Posez des questions comme : *"Explique-moi la r?cursion"*, *"Explique-moi ce PDF"*, *"Qu'est-ce que le polymorphisme ?"*.
   - S?lecteur de document pour contextualiser les r?ponses sur un cours sp?cifique.

9. **Planificateur d??tude** :
   - L'?tudiant renseigne la date de son examen et ses heures disponibles par semaine.
   - L'IA calcule automatiquement le calendrier jour par jour avec temps allou? et conseils m?thodologiques.
   - Checklist interactive pour cocher les s?ances valid?es.

10. **Tableau de Bord Analytique** :
    - Nombre de documents t?l?vers?s
    - Scores moyens aux quiz et graphique de tendance
    - Temps d'?tude estim?
    - Nombre de flashcards actives et ma?tris?es
    - Nombre total de requ?tes envoy?es ? l'IA
    - R?partition des cours par mati?re

11. **Mode Sombre / Mode Clair** :
    - Th?me sombre et clair soign? avec Material-UI, persistant dans le navigateur.

---

## ?? D?marrage

### 1. D?marrer le Backend
```bash
cd backend
mvn spring-boot:run
# ou ex?cuter le fichier start-backend.bat
```
L'API d?marre sur `http://localhost:8080`.

### 2. D?marrer le Frontend
```bash
cd frontend
npm run dev
# ou ex?cuter le fichier start-frontend.bat
```
L'application web est accessible sur `http://localhost:5173`.

### 3. Identifiants D?mo
- **Nom d'utilisateur** : `etudiant`
- **Mot de passe** : `etudiant123`
*(ou cliquez simplement sur le bouton "Connexion D?mo en 1 clic")*
