package com.smartstudy.platform.service;

import com.smartstudy.platform.model.*;
import com.smartstudy.platform.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private StudyDocumentRepository documentRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private FlashcardRepository flashcardRepository;

    @Autowired
    private StudyPlanRepository studyPlanRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        logger.info("Verification des donnees initiales...");

        User demoUser = userRepository.findByUsername("etudiant").orElseGet(() -> {
            User u = new User("etudiant", "etudiant@smartstudy.com", passwordEncoder.encode("etudiant123"), "Alexandre Martin");
            u.setTargetStudyHoursPerWeek(12);
            return userRepository.save(u);
        });

        String userId = demoUser.getId();

        if (subjectRepository.countByUserId(userId) == 0) {
            logger.info("Creation des 5 matieres obligatoires...");
            Subject subAlgo = subjectRepository.save(new Subject(userId, "Algorithmique", "Structures de donnees, tri, recherche et complexite", "#3b82f6", "Binary"));
            Subject subOs = subjectRepository.save(new Subject(userId, "Systèmes d'exploitation", "Gestion des processus, threads, memoire virtuelle", "#10b981", "Cpu"));
            Subject subJava = subjectRepository.save(new Subject(userId, "Java", "POO, polymorphisme, streams et JVM", "#f59e0b", "Coffee"));
            Subject subAi = subjectRepository.save(new Subject(userId, "Intelligence artificielle", "Apprentissage supervise, reseaux de neurones et LLM", "#8b5cf6", "Brain"));
            Subject subDb = subjectRepository.save(new Subject(userId, "Systemes de gestion de bases de donnees", "Modeles relationnels, SQL, indexation et ACID", "#ec4899", "Database"));

            StudyDocument docJava = new StudyDocument();
            docJava.setUserId(userId);
            docJava.setSubjectId(subJava.getId());
            docJava.setTitle("Introduction a la Programmation Objet en Java");
            docJava.setFileName("cours_java_poo.pdf");
            docJava.setFileType("PDF");
            docJava.setFileSize(245760);
            docJava.setExtractedText("Le langage Java est un langage oriente objet moderne. Il repose sur les 4 piliers de la POO : l'encapsulation, l'heritage, le polymorphisme et l'abstraction. La JVM execute le bytecode portable. Le Garbage Collector gere automatiquement la memoire heap.");
            docJava.setShortSummary("Synthese des fondamentaux du langage Java et des piliers majeurs de la POO.");
            docJava.setDetailedSummary("### Points Cles du Cours Java\n- **Portabilite JVM** : Compilation en bytecode.\n- **Encapsulation & Polymorphisme** : Modularite du code.\n- **Garbage Collector** : Gestion automatique du heap.");
            docJava.setKeyConcepts(List.of("Encapsulation", "Polymorphisme", "Machine Virtuelle Java (JVM)", "Bytecode", "Garbage Collector"));
            documentRepository.save(docJava);

            Note note = new Note();
            note.setUserId(userId);
            note.setSubjectId(subAlgo.getId());
            note.setTitle("Synthese sur la complexite algorithmique");
            note.setContent("## Echelles de Complexite\n- O(1) : Temps constant\n- O(log n) : Dichotomie\n- O(n log n) : Tris optimaux (Quicksort, Mergesort)\n- O(n^2) : Tris naifs");
            note.setFolder("Theorie");
            note.setTags(List.of("Algorithmique", "Complexite"));
            noteRepository.save(note);

            flashcardRepository.save(new Flashcard(userId, subJava.getId(), docJava.getId(),
                    "Qu'est-ce que le polymorphisme ?",
                    "La capacite d'un objet a prendre plusieurs formes et reagir a un meme appel selon sa classe concrete."));
            flashcardRepository.save(new Flashcard(userId, subOs.getId(), null,
                    "Qu'est-ce que la memoire virtuelle ?",
                    "Un mecanisme combinant la RAM physique et le swap disque pour fournir un espace d'adressage lineaire et isole."));
            flashcardRepository.save(new Flashcard(userId, subDb.getId(), null,
                    "Que signifie ACID ?",
                    "Atomicite, Coherence, Isolation et Durabilite des transactions SQL."));

            Quiz quiz = new Quiz();
            quiz.setUserId(userId);
            quiz.setSubjectId(subJava.getId());
            quiz.setDocumentId(docJava.getId());
            quiz.setTitle("QCM Evaluation - Fondamentaux Java & POO");
            quiz.setDescription("Testez votre maitrise des concepts fondamentaux de Java");

            quiz.setQuestions(List.of(
                    new QuizQuestion("Qu'est-ce que le polymorphisme en Java ?",
                            List.of("La faculte d'un objet a repondre differemment a un meme appel selon sa classe concrete",
                                    "Un algorithme d'allocation memoire exclusive",
                                    "Un protocole reseau de communication",
                                    "Une exception levee lors d'une division par zero"),
                            0,
                            "Le polymorphisme permet l'invocation de methodes avec resolution dynamique a l'execution."),
                    new QuizQuestion("Quelle est la classe racine de tous les objets en Java ?",
                            List.of("java.lang.Class", "java.lang.Object", "java.lang.System", "java.util.Base"),
                            1,
                            "Toutes les classes Java heritent directement ou indirectement de java.lang.Object."),
                    new QuizQuestion("Quelle zone memoire est nettoyee par le Garbage Collector ?",
                            List.of("La memoire Heap (Tas)", "La memoire Stack (Pile)", "Le registre d'instructions", "Le BIOS"),
                            0,
                            "Le Garbage Collector desalloue les objets orphelins dans le Heap.")
            ));
            Quiz savedQuiz = quizRepository.save(quiz);

            QuizAttempt attempt = new QuizAttempt();
            attempt.setUserId(userId);
            attempt.setQuizId(savedQuiz.getId());
            attempt.setQuizTitle(savedQuiz.getTitle());
            attempt.setScore(3);
            attempt.setTotalQuestions(3);
            attempt.setPercentage(100.0);
            attempt.setSelectedAnswers(List.of(0, 1, 0));
            quizAttemptRepository.save(attempt);

            StudyPlan plan = new StudyPlan();
            plan.setUserId(userId);
            plan.setSubjectId(subJava.getId());
            plan.setSubjectName("Java");
            plan.setTitle("Plan de preparation Examen Final Java");
            plan.setExamDate(LocalDate.now().plusWeeks(3));
            plan.setAvailableHoursPerWeek(10);
            plan.setTotalDaysRemaining(21);
            plan.setStrategicAdvice("Etudier 2h par jour avec des sessions Pomodoro. Reviser les Flashcards quotidiennement.");
            plan.setSessions(List.of(
                    new StudySession("Lundi", "15/09/2026", "Revision POO et interfaces", 90, "Faire des diagrammes UML"),
                    new StudySession("Mercredi", "17/09/2026", "Collections et Generics", 90, "Comparer List et Set"),
                    new StudySession("Vendredi", "19/09/2026", "Streams et Lambdas", 120, "Pratiquer les filtres et maps"),
                    new StudySession("Samedi", "20/09/2026", "Session QCM intensif", 60, "Passer les quiz")
            ));
            studyPlanRepository.save(plan);

            logger.info("Donnees chargees avec succes !");
        }
    }
}
