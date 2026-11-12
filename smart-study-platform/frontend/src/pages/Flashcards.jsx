import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Shuffle,
  Trash2,
} from 'lucide-react';
import { flashcardApi, documentApi, subjectApi } from '../services/api';

export default function Flashcards() {
  const [searchParams] = useSearchParams();
  const initialDocId = searchParams.get('documentId');

  const [flashcards, setFlashcards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState('ALL');

  // AI Gen modal
  const [openGenModal, setOpenGenModal] = useState(false);
  const [genDocId, setGenDocId] = useState(initialDocId || '');
  const [genTopic, setGenTopic] = useState('');
  const [genSubjectId, setGenSubjectId] = useState('');
  const [genCount, setGenCount] = useState(6);
  const [generating, setGenerating] = useState(false);

  // Manual create modal
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fcRes, subRes, docRes] = await Promise.all([
        flashcardApi.getAll(),
        subjectApi.getAll(),
        documentApi.getAll(),
      ]);
      setFlashcards(fcRes.data);
      setSubjects(subRes.data);
      setDocuments(docRes.data);

      if (initialDocId) {
        setGenDocId(initialDocId);
        setOpenGenModal(true);
      }
    } catch (err) {
      console.error('Erreur chargement flashcards', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = flashcards.filter((fc) => {
    if (statusFilter === 'ALL') return true;
    return fc.masteryStatus === statusFilter;
  });

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredCards.length || 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % (filteredCards.length || 1));
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setFlashcards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  const handleStatusUpdate = async (status) => {
    const card = filteredCards[currentIndex];
    if (!card) return;

    try {
      const res = await flashcardApi.updateStatus(card.id, status);
      setFlashcards((prev) =>
        prev.map((c) => (c.id === card.id ? res.data : c))
      );
      handleNext();
    } catch (err) {
      console.error('Erreur statut flashcard', err);
    }
  };

  const handleDeleteCard = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Supprimer cette flashcard ?')) {
      try {
        await flashcardApi.delete(id);
        setFlashcards((prev) => prev.filter((c) => c.id !== id));
        if (currentIndex >= filteredCards.length - 1) {
          setCurrentIndex(Math.max(0, filteredCards.length - 2));
        }
      } catch (err) {
        console.error('Erreur suppression', err);
      }
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await flashcardApi.generate({
        documentId: genDocId || null,
        topic: genTopic || null,
        subjectId: genSubjectId || null,
        cardCount: genCount,
      });

      setFlashcards((prev) => [...res.data, ...prev]);
      setOpenGenModal(false);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error('Erreur génération flashcards', err);
      alert("Erreur lors de la génération des cartes mémo");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateManual = async () => {
    if (!newFront.trim() || !newBack.trim()) return;
    try {
      const res = await flashcardApi.create({
        front: newFront,
        back: newBack,
        subjectId: newSubjectId || null,
      });
      setFlashcards((prev) => [res.data, ...prev]);
      setOpenCreateModal(false);
      setNewFront('');
      setNewBack('');
    } catch (err) {
      console.error('Erreur création manuelle', err);
    }
  };

  const currentCard = filteredCards[currentIndex];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Cartes de Révision (Flashcards)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Répétition espacée et mémorisation active alimentées par l'IA
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenCreateModal(true)}
          >
            Créer
          </Button>
          <Button
            variant="contained"
            startIcon={<Sparkles size={18} />}
            onClick={() => setOpenGenModal(true)}
          >
            Générer avec l'IA
          </Button>
        </Box>
      </Box>

      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`Toutes (${flashcards.length})`}
            clickable
            color={statusFilter === 'ALL' ? 'primary' : 'default'}
            onClick={() => { setStatusFilter('ALL'); setCurrentIndex(0); }}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label="à réviser"
            clickable
            color={statusFilter === 'LEARNING' ? 'warning' : 'default'}
            onClick={() => { setStatusFilter('LEARNING'); setCurrentIndex(0); }}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label="Maîtrisées"
            clickable
            color={statusFilter === 'MASTERED' ? 'success' : 'default'}
            onClick={() => { setStatusFilter('MASTERED'); setCurrentIndex(0); }}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Button size="small" startIcon={<Shuffle size={16} />} onClick={handleShuffle}>
          Mélanger les cartes
        </Button>
      </Box>

      {filteredCards.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Aucune flashcard dans cette vue
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Cliquez sur "Générer avec l'IA" pour concevoir instantanément un paquet de cartes de révision.
          </Typography>
          <Button variant="contained" startIcon={<Sparkles size={18} />} onClick={() => setOpenGenModal(true)}>
            Générer un lot de flashcards
          </Button>
        </Card>
      ) : (
        <Box>
          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Carte {currentIndex + 1} sur {filteredCards.length}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {Math.round(((currentIndex + 1) / filteredCards.length) * 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={((currentIndex + 1) / filteredCards.length) * 100}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {/* Interactive Flip Card Container */}
          <Card
            onClick={() => setIsFlipped(!isFlipped)}
            sx={{
              minHeight: 320,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              cursor: 'pointer',
              position: 'relative',
              borderRadius: 4,
              border: 2,
              borderColor: isFlipped ? 'secondary.main' : 'primary.main',
              bgcolor: 'background.paper',
              boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
              transition: 'all 0.25s ease',
              textAlign: 'center',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
              },
            }}
          >
            {/* Top Badge */}
            <Box sx={{ position: 'absolute', top: 16, left: 20, display: 'flex', gap: 1 }}>
              <Chip
                label={isFlipped ? 'VERSO (Réponse)' : 'RECTO (Question)'}
                size="small"
                color={isFlipped ? 'secondary' : 'primary'}
                sx={{ fontWeight: 700, fontSize: '0.75rem' }}
              />
              {currentCard?.masteryStatus === 'MASTERED' && (
                <Chip label="Maîtrisée" size="small" color="success" sx={{ fontWeight: 700 }} />
              )}
            </Box>

            <Tooltip title="Supprimer cette carte">
              <IconButton
                size="small"
                color="error"
                sx={{ position: 'absolute', top: 14, right: 16 }}
                onClick={(e) => handleDeleteCard(currentCard.id, e)}
              >
                <Trash2 size={16} />
              </IconButton>
            </Tooltip>

            {/* Card Content Text */}
            <Box sx={{ maxWidth: 650, my: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.6,
                  color: isFlipped ? 'text.primary' : 'primary.main',
                }}
              >
                {isFlipped ? currentCard?.back : currentCard?.front}
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <RotateCcw size={14} /> Cliquez n'importe o? pour retourner la carte
            </Typography>
          </Card>

          {/* Controls Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ChevronLeft size={18} />}
              onClick={handlePrev}
            >
              Précédente
            </Button>

            {/* Mastery status actions */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<Clock size={16} />}
                onClick={() => handleStatusUpdate('LEARNING')}
              >
                à revoir
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle size={16} />}
                onClick={() => handleStatusUpdate('MASTERED')}
              >
                Je sais (Maîtrisé)
              </Button>
            </Box>

            <Button
              variant="outlined"
              endIcon={<ChevronRight size={18} />}
              onClick={handleNext}
            >
              Suivante
            </Button>
          </Box>
        </Box>
      )}

      {/* Modal Génération IA */}
      <Dialog open={openGenModal} onClose={() => !generating && setOpenGenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Générateur de Flashcards IA</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '10px !important' }}>
          <TextField
            select
            label="Basé sur un document de cours"
            fullWidth
            value={genDocId}
            onChange={(e) => setGenDocId(e.target.value)}
          >
            <MenuItem value="">-- Entrer un sujet manuellement --</MenuItem>
            {documents.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.title} ({d.fileType})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Thématique ou Notion à réviser"
            placeholder="Ex : REST API, POO Java, Arbres et graphes..."
            fullWidth
            value={genTopic}
            onChange={(e) => setGenTopic(e.target.value)}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Matière"
              sx={{ flex: 1 }}
              value={genSubjectId}
              onChange={(e) => setGenSubjectId(e.target.value)}
            >
              <MenuItem value="">G?n?ral</MenuItem>
              {subjects.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Nombre de cartes"
              sx={{ width: 170 }}
              value={genCount}
              onChange={(e) => setGenCount(parseInt(e.target.value))}
            >
              <MenuItem value={4}>4 cartes</MenuItem>
              <MenuItem value={6}>6 cartes</MenuItem>
              <MenuItem value={8}>8 cartes</MenuItem>
              <MenuItem value={12}>12 cartes</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button disabled={generating} onClick={() => setOpenGenModal(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            disabled={generating || (!genDocId && !genTopic.trim())}
            onClick={handleGenerate}
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={18} />}
          >
            {generating ? 'Génération IA...' : 'Générer les cartes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Création Manuelle */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Créer une carte de révision</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '10px !important' }}>
          <TextField
            label="Recto (Question / Notion)"
            placeholder="Ex : Qu'est-ce qu'une API REST ?"
            fullWidth
            multiline
            rows={2}
            value={newFront}
            onChange={(e) => setNewFront(e.target.value)}
          />

          <TextField
            label="Verso (Réponse / Définition concise)"
            placeholder="Ex : REST est un style architectural..."
            fullWidth
            multiline
            rows={4}
            value={newBack}
            onChange={(e) => setNewBack(e.target.value)}
          />

          <TextField
            select
            label="Matière"
            fullWidth
            value={newSubjectId}
            onChange={(e) => setNewSubjectId(e.target.value)}
          >
            <MenuItem value="">Aucune</MenuItem>
            {subjects.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenCreateModal(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateManual}>
            Créer la carte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
