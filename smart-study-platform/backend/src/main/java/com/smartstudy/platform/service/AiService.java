package com.smartstudy.platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartstudy.platform.dto.response.SummaryResponse;
import com.smartstudy.platform.model.ChatMessage;
import com.smartstudy.platform.model.Flashcard;
import com.smartstudy.platform.model.QuizQuestion;
import com.smartstudy.platform.model.StudyPlan;
import com.smartstudy.platform.model.StudySession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiService {
    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    @Value("${smartstudy.ai.gemini-api-key:}")
    private String defaultGeminiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SummaryResponse generateSummary(String text, String userApiKey) {
        if (text == null || text.isBlank()) {
            return new SummaryResponse(
                    "Aucun contenu fourni.",
                    "Veuillez televerser un document valide.",
                    List.of("Texte manquant")
            );
        }

        String geminiKey = (userApiKey != null && !userApiKey.isBlank()) ? userApiKey : defaultGeminiKey;
        if (geminiKey != null && !geminiKey.isBlank()) {
            try {
                return callGeminiForSummary(text, geminiKey);
            } catch (Exception e) {
                logger.warn("Echec Gemini, repli moteur local: {}", e.getMessage());
            }
        }

        return generateLocalSummary(text);
    }

    private SummaryResponse callGeminiForSummary(String text, String apiKey) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
        String prompt = "Tu es un tuteur universitaire expert. Analyse le document et genere un JSON strict: " +
                "{\"shortSummary\": \"...\", \"detailedSummary\": \"...\", \"keyConcepts\": [\"...\"]}.\n" +
                "Texte:\n" + truncateText(text, 5000);

        Map<String, Object> reqBody = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

        String raw = restTemplate.postForObject(url, entity, String.class);
        JsonNode root = objectMapper.readTree(raw);
        String aiText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        JsonNode json = objectMapper.readTree(cleanJsonString(aiText));

        String shortSummary = json.path("shortSummary").asText();
        String detailedSummary = json.path("detailedSummary").asText();
        List<String> keyConcepts = new ArrayList<>();
        if (json.has("keyConcepts") && json.path("keyConcepts").isArray()) {
            json.path("keyConcepts").forEach(item -> keyConcepts.add(item.asText()));
        }
        return new SummaryResponse(shortSummary, detailedSummary, keyConcepts);
    }

    private SummaryResponse generateLocalSummary(String text) {
        String clean = text.replaceAll("\\s+", " ").trim();
        List<String> sentences = Arrays.stream(clean.split("(?<=[.!?])\\s+"))
                .filter(s -> s.length() > 15)
                .collect(Collectors.toList());

        Set<String> keywords = extractKeywords(text);
        List<String> keyConcepts = new ArrayList<>(keywords).stream().limit(6).collect(Collectors.toList());
        if (keyConcepts.isEmpty()) {
            keyConcepts = List.of("Concepts Cles", "Architecture et Principes", "Methodologie Pratique");
        }

        StringBuilder shortSb = new StringBuilder();
        int count = 0;
        for (String s : sentences) {
            shortSb.append(s).append(" ");
            count++;
            if (count >= 2) break;
        }
        if (shortSb.isEmpty()) {
            shortSb.append("Ce document presente les notions fondamentales et indispensables pour la reussite de votre cours.");
        }

        StringBuilder detSb = new StringBuilder();
        detSb.append("### Analyse Structurée du Document\n\n");
        detSb.append("Le document developpe les axes d'apprentissage suivants :\n\n");

        int sIdx = 0;
        for (String concept : keyConcepts) {
            detSb.append("#### • ").append(capitalize(concept)).append("\n");
            if (sIdx < sentences.size()) {
                detSb.append(sentences.get(sIdx)).append(" ");
                sIdx++;
            } else {
                detSb.append("Notion cle appliquee aux methodes et solutions du programme.\n");
            }
            detSb.append("\n");
        }
        detSb.append("### Synthese\nLa bonne assimilation de ces notions est cruciale pour les epreuves d'examen et les travaux pratiques.");

        return new SummaryResponse(shortSb.toString().trim(), detSb.toString(), keyConcepts);
    }

    public List<QuizQuestion> generateQuiz(String topic, String contextText, int questionCount, String userApiKey) {
        int count = Math.max(3, Math.min(questionCount, 10));
        String geminiKey = (userApiKey != null && !userApiKey.isBlank()) ? userApiKey : defaultGeminiKey;

        if (geminiKey != null && !geminiKey.isBlank()) {
            try {
                return callGeminiForQuiz(topic, contextText, count, geminiKey);
            } catch (Exception e) {
                logger.warn("Echec Gemini pour Quiz, utilisation moteur local: {}", e.getMessage());
            }
        }

        return generateLocalQuiz(topic, contextText, count);
    }

    private List<QuizQuestion> callGeminiForQuiz(String topic, String contextText, int count, String apiKey) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
        String prompt = "Genere " + count + " questions QCM en francais sur: '" + topic + "'. Contexte: " + truncateText(contextText, 3000) +
                ". Retourne un JSON array valide: [{\"question\":\"...\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"correctOptionIndex\":0,\"explanation\":\"...\"}]";

        Map<String, Object> reqBody = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

        String raw = restTemplate.postForObject(url, entity, String.class);
        JsonNode root = objectMapper.readTree(raw);
        String aiText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        JsonNode arr = objectMapper.readTree(cleanJsonString(aiText));

        List<QuizQuestion> list = new ArrayList<>();
        if (arr.isArray()) {
            for (JsonNode qNode : arr) {
                List<String> options = new ArrayList<>();
                qNode.path("options").forEach(opt -> options.add(opt.asText()));
                list.add(new QuizQuestion(
                        qNode.path("question").asText(),
                        options,
                        qNode.path("correctOptionIndex").asInt(0),
                        qNode.path("explanation").asText()
                ));
            }
        }
        return list;
    }

    private List<QuizQuestion> generateLocalQuiz(String topic, String contextText, int count) {
        List<QuizQuestion> questions = new ArrayList<>();
        String combined = (topic + " " + (contextText != null ? contextText : "")).toLowerCase();

        if (combined.contains("java") || combined.contains("objet") || combined.contains("polymorphisme")) {
            questions.add(new QuizQuestion(
                    "Qu'est-ce que le polymorphisme en POO ?",
                    List.of("La faculte d'un objet a prendre plusieurs formes et a adapter son comportement selon sa classe reelle",
                            "L'obligation de compiler le code en binaire sur une seule machine",
                            "Un algorithme d'indexation de bases de donnees",
                            "La destruction automatique d'un thread en memoire"),
                    0,
                    "Le polymorphisme permet d'invoquer une methode definie sur une classe de base dont le comportement varie dynamiquement."));
            questions.add(new QuizQuestion(
                    "Quelle est la classe parente de toutes les classes en Java ?",
                    List.of("java.lang.Class", "java.lang.Object", "java.lang.System", "java.util.Collection"),
                    1,
                    "En Java, chaque classe etend implicitement la classe racine java.lang.Object."));
            questions.add(new QuizQuestion(
                    "Quel est le role principal du Garbage Collector ?",
                    List.of("Recuperer l'espace memoire dans le Heap des objets qui ne sont plus references",
                            "Compiler le bytecode en langage C",
                            "Attribuer les adresses IP sur le reseau",
                            "Chiffrer les requetes HTTP"),
                    0,
                    "Le Garbage Collector s'occupe de desallouer la memoire Heap sans intervention manuelle du developpeur."));
        }

        if (combined.contains("algorithme") || combined.contains("recursion") || combined.contains("tri")) {
            questions.add(new QuizQuestion(
                    "Quelle est la complexite moyenne du tri rapide (Quicksort) ?",
                    List.of("O(n log n)", "O(n^2)", "O(n)", "O(1)"),
                    0,
                    "Quicksort fonctionne sur le principe 'diviser pour regner' avec une complexite moyenne en O(n log n)."));
            questions.add(new QuizQuestion(
                    "Que se produit-il si une fonction recursive ne possede aucun cas de base ?",
                    List.of("Une erreur StackOverflowError par debordement de la pile d'appels",
                            "Le programme s'arrete normalement",
                            "La fonction s'execute en temps O(1)",
                            "Le code est automatiquement optimise par le compilateur"),
                    0,
                    "Sans cas de base, les appels de fonction s'empilent sans interruption jusqu'a epuiser la memoire de la pile."));
        }

        if (combined.contains("systeme") || combined.contains("processus") || combined.contains("os")) {
            questions.add(new QuizQuestion(
                    "Quelle difference fondamentale distingue un processus d'un thread ?",
                    List.of("Le processus possede son propre espace d'adressage memoire, les threads d'un processus partagent le meme espace",
                            "Un processus n'a pas besoin de processeur pour tourner",
                            "Un thread ne peut jamais partager de memoire",
                            "Les processus ne peuvent pas communiquer entre eux"),
                    0,
                    "L'isolation memoire caracterise le processus, tandis que les threads partagent les segments de code et de donnees du processus."));
        }

        if (combined.contains("sgbd") || combined.contains("sql") || combined.contains("base")) {
            questions.add(new QuizQuestion(
                    "Que garantit la propriete d'Atomicite (A dans ACID) ?",
                    List.of("Que la transaction s'execute entierement ou pas du tout",
                            "Que les requetes sont traitees par un seul coeur CPU",
                            "Que les donnees sont dupliquees sur trois serveurs",
                            "Que les tables sont obligatoirement partitionnees"),
                    0,
                    "L'atomicite assure qu'en cas d'erreur en cours de transaction, toutes les modifications sont annulees (rollback)."));
        }

        while (questions.size() < count) {
            int qId = questions.size() + 1;
            questions.add(new QuizQuestion(
                    "Concernant les concepts de " + (topic != null ? topic : "ce cours") + ", quelle regle est indispensable ? (Q" + qId + ")",
                    List.of("Respecter les principes de modularite, d'encapsulation et de gestion des erreurs",
                            "Ecrire tout le code dans une seule fonction principale",
                            "Ignorer les exceptions et debordements",
                            "Desactiver toute verification d'integrite"),
                    0,
                    "La separation des responsabilites et la securite des echanges sont requises dans tout systeme logiciel moderne."));
        }

        return questions.stream().limit(count).collect(Collectors.toList());
    }

    public List<Flashcard> generateFlashcards(String userId, String subjectId, String documentId, String topic, String contextText, int cardCount, String userApiKey) {
        int count = Math.max(4, Math.min(cardCount, 12));
        List<Flashcard> list = new ArrayList<>();
        String combined = (topic + " " + (contextText != null ? contextText : "")).toLowerCase();

        if (combined.contains("java") || combined.contains("objet") || combined.contains("polymorphisme")) {
            list.add(new Flashcard(userId, subjectId, documentId,
                    "Qu'est-ce qu'une API REST ?",
                    "Un style d'architecture pour concevoir des services web stateless avec requetes HTTP standard (GET, POST, etc.) et donnees JSON."));
            list.add(new Flashcard(userId, subjectId, documentId,
                    "Qu'est-ce que l'encapsulation en POO ?",
                    "Le principe de restreindre l'acces direct aux champs d'un objet en passant par des methodes dediees (getters/setters)."));
            list.add(new Flashcard(userId, subjectId, documentId,
                    "Quelle est la difference entre une Interface et une Classe Abstraite ?",
                    "Une interface definit uniquement un contrat d'operations. Une classe abstraite peut fournir un squelette d'implementation et un etat."));
        }

        if (combined.contains("algorithme") || combined.contains("recursion")) {
            list.add(new Flashcard(userId, subjectId, documentId,
                    "Qu'est-ce que la récursion ?",
                    "Une fonction qui se rappelle elle-meme sur une version reduite du probleme jusqu'a atteindre une condition d'arret appelee cas de base."));
            list.add(new Flashcard(userId, subjectId, documentId,
                    "Qu'est-ce que la complexite temporelle O(log n) ?",
                    "Une complexite logarithmique ou la taille du probleme est divisee par deux a chaque etape (exemple : recherche dichotomique)."));
        }

        if (combined.contains("systeme") || combined.contains("os")) {
            list.add(new Flashcard(userId, subjectId, documentId,
                    "Qu'est-ce que la pagination (Paging) en OS ?",
                    "Une methode de gestion memoire decoupage de l'espace d'adressage virtuel en pages et de la RAM physique en cadres (frames)."));
            list.add(new Flashcard(userId, subjectId, documentId,
                    "Qu'est-ce qu'un interblocage (Deadlock) ?",
                    "Une situation ou deux ou plusieurs processus sont mutuellement bloques en attendant une ressource detenue par l'autre."));
        }

        if (combined.contains("sgbd") || combined.contains("sql")) {
            list.add(new Flashcard(userId, subjectId, documentId,
                    "Que signifie ACID en bases de donnees ?",
                    "Atomicite, Coherence, Isolation et Durabilite : les 4 piliers garantissant la fiabilite transactionnelle."));
            list.add(new Flashcard(userId, subjectId, documentId,
                    "Qu'est-ce qu'un index de base de donnees ?",
                    "Une structure accelerant la recherche de lignes (souvent en B-Tree) au detriment d'un cout accru a l'insertion et mise a jour."));
        }

        while (list.size() < count) {
            int cardNum = list.size() + 1;
            list.add(new Flashcard(userId, subjectId, documentId,
                    "Concept essentiel #" + cardNum + " (" + (topic != null ? topic : "Revision") + ")",
                    "Principe fondamental a maitriser pour l'examen. Consultez les syntheses de cours et pratiquez regulierement."));
        }

        return list.stream().limit(count).collect(Collectors.toList());
    }

    public String chatWithTutor(String prompt, String documentContext, List<ChatMessage> history, String userApiKey) {
        String geminiKey = (userApiKey != null && !userApiKey.isBlank()) ? userApiKey : defaultGeminiKey;

        if (geminiKey != null && !geminiKey.isBlank()) {
            try {
                return callGeminiForChat(prompt, documentContext, history, geminiKey);
            } catch (Exception e) {
                logger.warn("Echec Gemini Chat: {}", e.getMessage());
            }
        }

        return generateLocalTutorResponse(prompt, documentContext);
    }

    private String callGeminiForChat(String prompt, String documentContext, List<ChatMessage> history, String apiKey) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
        StringBuilder sb = new StringBuilder();
        sb.append("Tu es le Tuteur IA de Smart Study. Tu es pedagogique, encourageant et clair.\n\n");
        if (documentContext != null && !documentContext.isBlank()) {
            sb.append("Document de cours de l'etudiant :\n").append(truncateText(documentContext, 3000)).append("\n\n");
        }
        sb.append("Question : ").append(prompt);

        Map<String, Object> reqBody = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", sb.toString())))));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

        String raw = restTemplate.postForObject(url, entity, String.class);
        JsonNode root = objectMapper.readTree(raw);
        return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
    }

    private String generateLocalTutorResponse(String prompt, String documentContext) {
        String p = prompt.toLowerCase();

        if (p.contains("recursion") || p.contains("recursivite") || p.contains("récursion")) {
            return "### Comprendre la Récursion en Informatique 💡\n\n" +
                    "La **récursion** est une méthode où une fonction **s'appelle elle-même** pour résoudre un problème en sous-problèmes plus simples.\n\n" +
                    "#### Les 2 composants obligatoires :\n" +
                    "1. **Le cas de base** : condition qui arrête les appels récursifs (sinon : `StackOverflowError`).\n" +
                    "2. **Le cas récursif** : l'appel à la fonction avec une valeur se rapprochant du cas de base.\n\n" +
                    "#### Exemple classique en Java :\n" +
                    "```java\n" +
                    "public int factorielle(int n) {\n" +
                    "    if (n <= 1) return 1; // 1. Cas de base\n" +
                    "    return n * factorielle(n - 1); // 2. Cas recursif\n" +
                    "}\n" +
                    "```\n\n" +
                    "💡 **Conseil d'étude** : Pensez aux poupées russes : on ouvre chaque poupée jusqu'à la plus petite, puis on referme tout !";
        }

        if (p.contains("polymorphisme") || p.contains("poo") || p.contains("objet")) {
            return "### Le Polymorphisme en POO 🧩\n\n" +
                    "Le **polymorphisme** permet à des objets de types différents d'être manipulés au travers d'une même interface ou classe parente.\n\n" +
                    "- **Surcharge (Overloading)** : plusieurs méthodes avec le même nom mais des paramètres différents.\n" +
                    "- **Redéfinition (Overriding)** : une classe fille redéfinit le comportement d'une méthode de sa classe mère.\n\n" +
                    "```java\n" +
                    "Forme f = new Cercle();\n" +
                    "f.dessiner(); // Appelle dynamiquement dessiner() du Cercle !\n" +
                    "```\n" +
                    "Cela offre une extensibilité maximale sans modifier le code existant.";
        }

        if (p.contains("pdf") || p.contains("document") || p.contains("cours")) {
            if (documentContext != null && !documentContext.isBlank()) {
                SummaryResponse sum = generateLocalSummary(documentContext);
                return "### Explication de votre document de cours 📚\n\n" +
                        "**Résumé :** " + sum.getShortSummary() + "\n\n" +
                        "**Concepts fondamentaux identifiés :**\n" +
                        sum.getKeyConcepts().stream().map(c -> "• **" + c + "**").collect(Collectors.joining("\n")) + "\n\n" +
                        "Posez-moi n'importe quelle question sur ces points, je vous l'explique pas à pas !";
            }
        }

        return "### Explication du Tuteur IA 🎓\n\n" +
                "Concernant **\"" + prompt + "\"** :\n\n" +
                "1. **Définition** : C'est une notion incontournable pour consolider vos acquis.\n" +
                "2. **Mise en application** : Pratiquez régulièrement avec des exercices ciblés et des questions de quiz.\n" +
                "3. **Mémorisation** : Utilisez les Flashcards générées pour ancrer ce concept dans votre mémoire à long terme.\n\n" +
                "Avez-vous besoin d'un exemple concret ou d'un exercice d'entraînement ?";
    }

    public StudyPlan generateStudyPlan(String userId, String subjectId, String subjectName, LocalDate examDate, int availableHoursPerWeek) {
        StudyPlan plan = new StudyPlan();
        plan.setUserId(userId);
        plan.setSubjectId(subjectId);
        plan.setSubjectName(subjectName != null ? subjectName : "Module d'etude");
        plan.setTitle("Programme d'Etude Personnalise - " + plan.getSubjectName());
        plan.setExamDate(examDate);
        plan.setAvailableHoursPerWeek(availableHoursPerWeek > 0 ? availableHoursPerWeek : 8);

        LocalDate today = LocalDate.now();
        long daysUntilExam = ChronoUnit.DAYS.between(today, examDate);
        if (daysUntilExam <= 0) daysUntilExam = 14;
        plan.setTotalDaysRemaining((int) daysUntilExam);

        List<StudySession> sessions = new ArrayList<>();
        String[] daysFr = {"Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"};
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        String[] topics = {
                "Concepts cles et bases theoriques",
                "Mecanismes avances et architecture",
                "Resolution d'exercices pratiques",
                "Revision des pieges d'examen et cas limites",
                "Auto-evaluation intensive par Flashcards",
                "Simulation d'examen blanc",
                "Synthese globale et consolidation"
        };

        int sessionCount = Math.min((int) daysUntilExam, 14);
        int hoursPerSession = Math.max(45, (availableHoursPerWeek * 60) / Math.min(sessionCount, 7));

        for (int i = 0; i < sessionCount; i++) {
            LocalDate date = today.plusDays(i + 1);
            String dayName = daysFr[date.getDayOfWeek().getValue() - 1];
            String topic = topics[i % topics.length];
            String tip = (i == sessionCount - 1)
                    ? "Derniere relecture des fiches et bon repos !"
                    : "Appliquez la methode Pomodoro (25 min de concentration, 5 min de pause).";

            sessions.add(new StudySession(dayName, date.format(dtf), topic, hoursPerSession, tip));
        }

        plan.setSessions(sessions);
        plan.setStrategicAdvice("Rythme conseille : " + availableHoursPerWeek + "h par semaine. Utilisez activement les quiz pour mesurer votre progression.");
        return plan;
    }

    private Set<String> extractKeywords(String text) {
        Set<String> set = new LinkedHashSet<>();
        Pattern p = Pattern.compile("\\b[A-Z][a-zA-Z0-9_-]{3,}\\b|\\b(?:algorithme|structure|donnees|systeme|processus|thread|memoire|objet|classe|polymorphisme|heritage|transaction|index|sql|securite|reseau|api|rest)\\b", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        while (m.find() && set.size() < 8) {
            String w = m.group().toLowerCase();
            if (w.length() > 3) set.add(capitalize(w));
        }
        return set;
    }

    private String cleanJsonString(String raw) {
        String c = raw.trim();
        if (c.startsWith("```json")) c = c.substring(7);
        else if (c.startsWith("```")) c = c.substring(3);
        if (c.endsWith("```")) c = c.substring(0, c.length() - 3);
        return c.trim();
    }

    private String truncateText(String text, int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max);
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
