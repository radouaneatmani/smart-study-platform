import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Checkbox,
  LinearProgress,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
} from 'lucide-react';
import { aiApi, subjectApi } from '../services/api';

export default function StudyPlanner() {
  const [subjects, setSubjects] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form
  const [subjectId, setSubjectId] = useState('');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21); // default 3 weeks
    return d.toISOString().split('T')[0];
  });
  const [availableHours, setAvailableHours] = useState(10);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, plansRes] = await Promise.all([
        subjectApi.getAll(),
        aiApi.getStudyPlans(),
      ]);
      setSubjects(subsRes.data);
      if (subsRes.data.length > 0) setSubjectId(subsRes.data[0].id);
      setStudyPlans(plansRes.data);
      if (plansRes.data.length > 0) {
        setSelectedPlan(plansRes.data[0]);
      }
    } catch (err) {
      console.error('Erreur chargement planning', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!examDate) return;
    try {
      setGenerating(true);
      const res = await aiApi.generateStudyPlan({
        subjectId: subjectId || null,
        examDate,
        availableHoursPerWeek: availableHours,
      });

      setStudyPlans((prev) => [res.data, ...prev]);
      setSelectedPlan(res.data);
    } catch (err) {
      console.error('Erreur génération plan', err);
      alert("Erreur lors de la génération du programme d'étude");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleSession = async (sessionId) => {
    if (!selectedPlan) return;
    try {
      const res = await aiApi.toggleSession(selectedPlan.id, sessionId);
      setSelectedPlan(res.data);
      setStudyPlans((prev) => prev.map((p) => (p.id === res.data.id ? res.data : p)));
    } catch (err) {
      console.error('Erreur toggle session', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  const completedCount = selectedPlan?.sessions?.filter((s) => s.completed).length || 0;
  const totalCount = selectedPlan?.sessions?.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Planificateur d'étude Intelligent
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Générez un rétro-planning sur-mesure pour aborder votre examen en toute confiance
          </Typography>
        </Box>
      </Box>

      {/* Input Form Card */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sparkles size={20} color="#6366f1" /> Paramétrer mon programme d'examen
        </Typography>

        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Matière à réviser"
              fullWidth
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              {subjects.map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Date de l'examen"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Heures disponibles / semaine"
              type="number"
              fullWidth
              InputProps={{ inputProps: { min: 2, max: 50 } }}
              value={availableHours}
              onChange={(e) => setAvailableHours(parseInt(e.target.value) || 10)}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              disabled={generating || !examDate}
              onClick={handleGenerate}
              startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <Calendar size={18} />}
              sx={{ px: 4, py: 1.3 }}
            >
              {generating ? 'Calcul du programme IA...' : 'Générer mon programme de révision'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Existing Plans Selector if multiple */}
      {studyPlans.length > 1 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto', py: 0.5 }}>
          {studyPlans.map((p) => (
            <Chip
              key={p.id}
              label={`${p.subjectName} (${p.totalDaysRemaining} jours)`}
              clickable
              color={selectedPlan?.id === p.id ? 'primary' : 'default'}
              variant={selectedPlan?.id === p.id ? 'filled' : 'outlined'}
              onClick={() => setSelectedPlan(p)}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>
      )}

      {/* Selected Study Plan Details */}
      {selectedPlan ? (
        <Box>
          {/* Plan Header Card */}
          <Card sx={{ mb: 3, p: 3.5, background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(236,72,153,0.06) 100%)', border: 1, borderColor: 'primary.light' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box>
                <Chip label={selectedPlan.subjectName} color="primary" sx={{ fontWeight: 700, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {selectedPlan.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Examen prévu le <strong>{new Date(selectedPlan.examDate).toLocaleDateString('fr-FR')}</strong> — {selectedPlan.totalDaysRemaining} jours restants
                </Typography>
              </Box>

              {/* Progress Dial */}
              <Box sx={{ minWidth: 200 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Progression : {completedCount}/{totalCount} sessions
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {progressPercent}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressPercent}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>

            {/* Strategic Advice Alert */}
            {selectedPlan.strategicAdvice && (
              <Alert severity="info" icon={<Lightbulb size={20} />} sx={{ borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedPlan.strategicAdvice}
                </Typography>
              </Alert>
            )}
          </Card>

          {/* Sessions Timeline List */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
                Planning des Séances d'étude Active
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedPlan.sessions?.map((session, idx) => (
                  <Box
                    key={session.id || idx}
                    onClick={() => handleToggleSession(session.id)}
                    sx={{
                      p: 2.2,
                      borderRadius: 2.5,
                      border: 1,
                      borderColor: session.completed ? 'success.main' : 'divider',
                      bgcolor: session.completed ? 'rgba(16, 185, 129, 0.06)' : 'action.hover',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'all 0.15s',
                      '&:hover': {
                        bgcolor: session.completed ? 'rgba(16, 185, 129, 0.1)' : 'action.selected',
                      },
                    }}
                  >
                    <Checkbox
                      checked={session.completed}
                      color="success"
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleToggleSession(session.id)}
                    />

                    <Box sx={{ minWidth: 100 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: session.completed ? 'text.secondary' : 'text.primary' }}>
                        {session.day}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.date}
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          textDecoration: session.completed ? 'line-through' : 'none',
                          color: session.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {session.topic}
                      </Typography>
                      {session.tips && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                          ?? {session.tips}
                        </Typography>
                      )}
                    </Box>

                    <Chip
                      icon={<Clock size={14} />}
                      label={`${session.durationMinutes} min`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Card sx={{ textAlign: 'center', p: 6 }}>
          <Calendar size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Aucun programme de révision actif
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Renseignez la date de votre examen et vos heures disponibles pour générer votre planning automatique.
          </Typography>
        </Card>
      )}
    </Box>
  );
}
