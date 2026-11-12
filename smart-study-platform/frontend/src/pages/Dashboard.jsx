import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  FileText,
  HelpCircle,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  Bot,
  PlusCircle,
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Erreur chargement dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={44} thickness={4} />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Documents téléversés',
      value: stats?.totalDocuments || 0,
      icon: FileText,
      color: '#3b82f6',
      subtext: `${stats?.totalNotes || 0} notes créées`,
      action: () => navigate('/documents'),
    },
    {
      title: 'Score moyen aux quiz',
      value: `${stats?.averageQuizScore || 0}%`,
      icon: HelpCircle,
      color: '#10b981',
      subtext: `${stats?.totalQuizAttempts || 0} tentatives passées`,
      action: () => navigate('/quizzes'),
    },
    {
      title: "Temps d'étude estimé",
      value: `${stats?.estimatedStudyHours || 0}h`,
      icon: Clock,
      color: '#f59e0b',
      subtext: `Objectif : ${user?.targetStudyHoursPerWeek || 10}h / sem`,
      action: () => navigate('/study-planner'),
    },
    {
      title: 'Flashcards actives',
      value: stats?.totalFlashcards || 0,
      icon: Layers,
      color: '#8b5cf6',
      subtext: `${stats?.masteredFlashcards || 0} maîtrisées`,
      action: () => navigate('/flashcards'),
    },
    {
      title: 'Requêtes IA générées',
      value: stats?.aiRequestsCount || 0,
      icon: Sparkles,
      color: '#ec4899',
      subtext: 'Résumés, QCMs, Tuteur',
      action: () => navigate('/tutor'),
    },
  ];

  return (
    <Box>
      {/* Hero Welcome Banner */}
      <Card
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 3.5 },
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
          color: '#ffffff',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 650 }}>
          <Chip
            icon={<Sparkles size={15} color="#fff" />}
            label="Assistance IA Active"
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontWeight: 700,
              mb: 1.5,
              backdropFilter: 'blur(4px)',
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
            Bienvenue, {user?.fullName || 'Étudiant'} 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.92, mb: 2.5, lineHeight: 1.6 }}>
            Prêt à accélérer vos révisions ? Téléversez vos cours, générez des résumés instantanés et testez vos connaissances avec le tuteur intelligent.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/documents')}
              sx={{
                bgcolor: '#ffffff',
                color: '#4f46e5',
                fontWeight: 700,
                '&:hover': { bgcolor: '#f1f5f9' },
              }}
              startIcon={<PlusCircle size={18} />}
            >
              Téléverser un document
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/tutor')}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.7)',
                color: '#ffffff',
                fontWeight: 600,
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
              }}
              startIcon={<Bot size={18} />}
            >
              Poser une question au Tuteur
            </Button>
          </Box>
        </Box>
      </Card>

      {/* 5 Stats KPI Cards */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp size={20} color="#6366f1" /> Vos Métriques Clés
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={2.4} key={idx}>
              <Card
                onClick={stat.action}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${stat.color}15`,
                        color: stat.color,
                      }}
                    >
                      <Icon size={22} />
                    </Box>
                    <ArrowRight size={18} color="#94a3b8" />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                    {stat.subtext}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Two Column Layout: Recent Quiz Scores & Subject Progress */}
      <Grid container spacing={3}>
        {/* Left: Recent Quiz Performance */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Award size={20} color="#10b981" /> Derniers Scores aux Quiz
                </Typography>
                <Button size="small" onClick={() => navigate('/quizzes')} endIcon={<ArrowRight size={16} />}>
                  Voir tout
                </Button>
              </Box>

              {stats?.recentQuizScores && stats.recentQuizScores.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {stats.recentQuizScores.map((scoreItem, i) => (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {scoreItem.quizTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {scoreItem.date}
                          </Typography>
                          <Chip
                            label={`${scoreItem.score}%`}
                            size="small"
                            color={scoreItem.score >= 80 ? 'success' : scoreItem.score >= 50 ? 'warning' : 'error'}
                            sx={{ fontWeight: 700, height: 22 }}
                          />
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={scoreItem.score}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: scoreItem.score >= 80 ? '#10b981' : scoreItem.score >= 50 ? '#f59e0b' : '#ef4444',
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Aucun quiz complété pour le moment.
                  </Typography>
                  <Button variant="contained" size="small" onClick={() => navigate('/quizzes')}>
                    D'marrer un Quiz
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Subjects distribution & Flashcards review */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookOpen size={20} color="#6366f1" /> Vos Matières Actives
                </Typography>
                <Button size="small" onClick={() => navigate('/subjects')} endIcon={<ArrowRight size={16} />}>
                  G?rer
                </Button>
              </Box>

              {stats?.subjectsDistribution && stats.subjectsDistribution.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {stats.subjectsDistribution.map((sub, i) => (
                    <Box
                      key={i}
                      onClick={() => navigate('/subjects')}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        '&:hover': { bgcolor: 'action.selected' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: sub.color || '#6366f1',
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {sub.subjectName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={`${sub.documentsCount} doc`} size="small" variant="outlined" sx={{ height: 22 }} />
                        <Chip label={`${sub.flashcardsCount} flash`} size="small" variant="outlined" sx={{ height: 22 }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucune matière enregistrée.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
