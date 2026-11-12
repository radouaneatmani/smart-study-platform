import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tabs,
  Tab,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  History,
  RotateCcw,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { quizApi, documentApi, subjectApi } from '../services/api';

export default function Quizzes() {
  const [searchParams] = useSearchParams();
  const initialDocId = searchParams.get('documentId');

  const [activeTab, setActiveTab] = useState(0); // 0: Passer Quiz, 1: Générer, 2: Historique
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active quiz session
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const [evaluation, setEvaluation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Generator form
  const [genDocId, setGenDocId] = useState(initialDocId || '');
  const [genTopic, setGenTopic] = useState('');
  const [genSubjectId, setGenSubjectId] = useState('');
  const [genCount, setGenCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [quizRes, docRes, subRes, attRes] = await Promise.all([
        quizApi.getAll(),
        documentApi.getAll(),
        subjectApi.getAll(),
        quizApi.getAttempts(),
      ]);
      setQuizzes(quizRes.data);
      setDocuments(docRes.data);
      setSubjects(subRes.data);
      setAttempts(attRes.data);

      if (initialDocId) {
        setGenDocId(initialDocId);
        setActiveTab(1); // open generator if redirected from doc
      } else if (quizRes.data.length > 0) {
        setSelectedQuizId(quizRes.data[0].id);
      }
    } catch (err) {
      console.error('Erreur chargement quiz', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setUserAnswers({});
    setEvaluation(null);
  };

  const handleOptionChange = (questionIndex, optionIndex) => {
    if (evaluation) return; // locked after submission
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    const currentQuiz = quizzes.find((q) => q.id === selectedQuizId);
    if (!currentQuiz) return;

    const answersList = currentQuiz.questions.map((_, idx) =>
      userAnswers[idx] !== undefined ? userAnswers[idx] : -1
    );

    try {
      setSubmitting(true);
      const res = await quizApi.submit({
        quizId: selectedQuizId,
        selectedAnswers: answersList,
      });
      setEvaluation(res.data);
      // Reload attempts
      const attRes = await quizApi.getAttempts();
      setAttempts(attRes.data);
    } catch (err) {
      console.error('Erreur soumission quiz', err);
      alert('Erreur lors de la correction du quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setGenerating(true);
      const res = await quizApi.generate({
        documentId: genDocId || null,
        topic: genTopic || null,
        subjectId: genSubjectId || null,
        questionCount: genCount,
      });

      setQuizzes((prev) => [res.data, ...prev]);
      setSelectedQuizId(res.data.id);
      setUserAnswers({});
      setEvaluation(null);
      setActiveTab(0); // switch to taking the quiz
    } catch (err) {
      console.error('Erreur génération quiz', err);
      alert("Erreur lors de la génération du quiz par l'IA");
    } finally {
      setGenerating(false);
    }
  };

  const currentQuiz = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Quiz & Auto-Évaluations IA
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Générez des QCMs intelligents basés sur vos cours, testez vos réflexes et calculez votre score
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Sparkles size={18} />}
          onClick={() => setActiveTab(1)}
        >
          Générer un nouveau Quiz
        </Button>
      </Box>

      {/* Navigation Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab label="Passer le Quiz" sx={{ fontWeight: 600 }} />
          <Tab label="Générateur de Quiz IA" sx={{ fontWeight: 600 }} />
          <Tab label={`Historique & Scores (${attempts.length})`} sx={{ fontWeight: 600 }} />
        </Tabs>
      </Card>

      {/* TAB 0 : PASSER LE QUIZ */}
      {activeTab === 0 && (
        <Box>
          {quizzes.length === 0 ? (
            <Card sx={{ textAlign: 'center', p: 6 }}>
              <HelpCircle size={44} color="#6366f1" style={{ marginBottom: 12 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Aucun quiz disponible
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Générez votre premier QCM d'entraînement à l'aide du moteur d'IA.
              </Typography>
              <Button variant="contained" size="small" onClick={() => setActiveTab(1)}>
                Générer un quiz IA
              </Button>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {/* Left Selector Column */}
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, px: 1 }}>
                    Sélectionner un Quiz ({quizzes.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {quizzes.map((q) => {
                      const isSelected = q.id === selectedQuizId;
                      return (
                        <Box
                          key={q.id}
                          onClick={() => handleSelectQuiz(q.id)}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: isSelected ? 'primary.main' : 'action.hover',
                            color: isSelected ? '#ffffff' : 'text.primary',
                            transition: 'all 0.15s',
                            '&:hover': {
                              bgcolor: isSelected ? 'primary.dark' : 'action.selected',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {q.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: isSelected ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}
                          >
                            {q.questions.length} questions • {new Date(q.createdAt).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Card>
              </Grid>

              {/* Right Quiz Runner Column */}
              <Grid item xs={12} md={8}>
                {currentQuiz && (
                  <Card>
                    <CardContent sx={{ p: 3.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {currentQuiz.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentQuiz.description}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${currentQuiz.questions.length} Questions`}
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>

                      {/* Score Result Card when evaluated */}
                      {evaluation && (
                        <Card
                          sx={{
                            mb: 3.5,
                            p: 3,
                            bgcolor: evaluation.attempt.percentage >= 70 ? 'success.light' : 'warning.light',
                            color: '#ffffff',
                            borderRadius: 3,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Award size={32} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                Score : {evaluation.attempt.score} / {evaluation.attempt.totalQuestions} ({evaluation.attempt.percentage}%)
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.95 }}>
                                {evaluation.feedback}
                              </Typography>
                            </Box>
                            <Button
                              variant="contained"
                              sx={{ bgcolor: '#ffffff', color: '#1e293b', fontWeight: 700, '&:hover': { bgcolor: '#f1f5f9' } }}
                              startIcon={<RotateCcw size={16} />}
                              onClick={() => {
                                setUserAnswers({});
                                setEvaluation(null);
                              }}
                            >
                              Recommencer
                            </Button>
                          </Box>
                        </Card>
                      )}

                      {/* Questions List */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                        {currentQuiz.questions.map((q, qIdx) => {
                          const chosenOption = userAnswers[qIdx];
                          const isCorrect = evaluation && evaluation.correctAnswers[qIdx] === chosenOption;
                          const correctOption = evaluation ? evaluation.correctAnswers[qIdx] : null;

                          return (
                            <Box
                              key={qIdx}
                              sx={{
                                p: 2.5,
                                borderRadius: 2.5,
                                bgcolor: 'action.hover',
                                border: 1,
                                borderColor: evaluation
                                  ? isCorrect
                                    ? '#10b981'
                                    : '#ef4444'
                                  : 'divider',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                                <Chip
                                  label={`Q${qIdx + 1}`}
                                  size="small"
                                  color="primary"
                                  sx={{ fontWeight: 700, height: 24 }}
                                />
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, flexGrow: 1 }}>
                                  {q.question}
                                </Typography>
                                {evaluation && (
                                  isCorrect ? (
                                    <CheckCircle2 color="#10b981" size={24} />
                                  ) : (
                                    <XCircle color="#ef4444" size={24} />
                                  )
                                )}
                              </Box>

                              {/* Options */}
                              <RadioGroup
                                value={chosenOption !== undefined ? chosenOption : ''}
                                onChange={(e) => handleOptionChange(qIdx, parseInt(e.target.value))}
                              >
                                {q.options.map((opt, optIdx) => {
                                  const letters = ['A', 'B', 'C', 'D'];
                                  let highlightColor = 'transparent';
                                  if (evaluation) {
                                    if (optIdx === correctOption) {
                                      highlightColor = 'rgba(16, 185, 129, 0.15)';
                                    } else if (optIdx === chosenOption && !isCorrect) {
                                      highlightColor = 'rgba(239, 68, 68, 0.15)';
                                    }
                                  }

                                  return (
                                    <Box
                                      key={optIdx}
                                      sx={{
                                        p: 1.2,
                                        mb: 1,
                                        borderRadius: 2,
                                        bgcolor: highlightColor,
                                        border: 1,
                                        borderColor:
                                          evaluation && optIdx === correctOption
                                            ? '#10b981'
                                            : evaluation && optIdx === chosenOption
                                            ? '#ef4444'
                                            : 'divider',
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <FormControlLabel
                                        value={optIdx}
                                        disabled={Boolean(evaluation)}
                                        control={<Radio size="small" />}
                                        label={
                                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                              {letters[optIdx]}.
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                              {opt}
                                            </Typography>
                                          </Box>
                                        }
                                        sx={{ width: '100%', m: 0 }}
                                      />
                                    </Box>
                                  );
                                })}
                              </RadioGroup>

                              {/* Explanation if evaluated */}
                              {evaluation && (
                                <Alert
                                  severity={isCorrect ? 'success' : 'info'}
                                  sx={{ mt: 1.5, borderRadius: 2 }}
                                >
                                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                                    Explication didactique :
                                  </Typography>
                                  <Typography variant="body2">
                                    {evaluation.explanations[qIdx] || q.explanation}
                                  </Typography>
                                </Alert>
                              )}
                            </Box>
                          );
                        })}
                      </Box>

                      {/* Submit button */}
                      {!evaluation && (
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            size="large"
                            disabled={submitting || Object.keys(userAnswers).length === 0}
                            onClick={handleSubmitQuiz}
                            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircle2 size={18} />}
                            sx={{ px: 4 }}
                          >
                            {submitting ? 'Correction...' : 'Valider et Calculer mon Score'}
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {/* TAB 1 : GENERATEUR IA */}
      {activeTab === 1 && (
        <Card sx={{ maxWidth: 700, mx: 'auto' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Sparkles size={28} color="#6366f1" />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Générateur de Quiz Automatique par l'IA
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  L'IA conçoit des questions à choix multiples pertinentes avec 4 options (A, B, C, D) et explications.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                select
                label="Basé sur un document téléversé (optionnel)"
                fullWidth
                value={genDocId}
                onChange={(e) => setGenDocId(e.target.value)}
              >
                <MenuItem value="">-- Choisir un document ou saisir un thème --</MenuItem>
                {documents.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.title} ({d.fileType})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Ou Thématique spécifique du quiz"
                placeholder="Ex : Polymorphisme en Java, ACID en SQL, Arbres binaires..."
                fullWidth
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  label="Matière associée"
                  sx={{ flex: 1 }}
                  value={genSubjectId}
                  onChange={(e) => setGenSubjectId(e.target.value)}
                >
                  <MenuItem value="">Général</MenuItem>
                  {subjects.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Nombre de questions"
                  sx={{ width: 180 }}
                  value={genCount}
                  onChange={(e) => setGenCount(parseInt(e.target.value))}
                >
                  <MenuItem value={3}>3 questions</MenuItem>
                  <MenuItem value={5}>5 questions</MenuItem>
                  <MenuItem value={7}>7 questions</MenuItem>
                  <MenuItem value={10}>10 questions</MenuItem>
                </TextField>
              </Box>

              <Button
                variant="contained"
                size="large"
                disabled={generating || (!genDocId && !genTopic.trim())}
                onClick={handleGenerateQuiz}
                startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <Sparkles size={18} />}
                sx={{ mt: 1, py: 1.5 }}
              >
                {generating ? "Génération par l'IA en cours..." : 'Générer le Quiz maintenant'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* TAB 2 : HISTORIQUE DES TENTATIVES */}
      {activeTab === 2 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <History size={20} color="#6366f1" /> Historique de vos tentatives
            </Typography>

            {attempts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucune tentative enregistrée. Passez un quiz pour voir vos scores s'afficher ici.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {attempts.map((att) => (
                  <Box
                    key={att.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {att.quizTitle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Complété le {new Date(att.completedAt).toLocaleString('fr-FR')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {att.score} / {att.totalQuestions}
                      </Typography>
                      <Chip
                        label={`${att.percentage}%`}
                        color={att.percentage >= 80 ? 'success' : att.percentage >= 50 ? 'warning' : 'error'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
