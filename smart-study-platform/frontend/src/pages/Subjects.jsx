import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Plus,
  BookOpen,
  Trash2,
  Edit,
  FileText,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { subjectApi } from '../services/api';

const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function Subjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: 'Book',
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await subjectApi.getAll();
      setSubjects(res.data);
    } catch (err) {
      console.error('Erreur chargement matières', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setFormData({ name: '', description: '', color: '#6366f1', icon: 'Book' });
    setOpenModal(true);
  };

  const handleOpenEdit = (subject, e) => {
    e.stopPropagation();
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      color: subject.color || '#6366f1',
      icon: subject.icon || 'Book',
    });
    setOpenModal(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      try {
        await subjectApi.delete(id);
        loadSubjects();
      } catch (err) {
        console.error('Erreur suppression matière', err);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    try {
      if (editingSubject) {
        await subjectApi.update(editingSubject.id, formData);
      } else {
        await subjectApi.create(formData);
      }
      setOpenModal(false);
      loadSubjects();
    } catch (err) {
      console.error('Erreur enregistrement matière', err);
    }
  };

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
            Gestion des Matières
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organisez vos documents, notes et flashcards par discipline
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={handleOpenCreate}
        >
          Nouvelle Matière
        </Button>
      </Box>

      <Grid container spacing={3}>
        {subjects.map((subj) => (
          <Grid item xs={12} sm={6} md={4} key={subj.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                },
              }}
              onClick={() => navigate(`/documents?subjectId=${subj.id}`)}
            >
              {/* Color Header Bar */}
              <Box sx={{ height: 6, bgcolor: subj.color || '#6366f1' }} />

              <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${subj.color || '#6366f1'}18`,
                      color: subj.color || '#6366f1',
                    }}
                  >
                    <BookOpen size={22} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={(e) => handleOpenEdit(subj, e)}>
                        <Edit size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={(e) => handleDelete(subj.id, e)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {subj.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, flexGrow: 1, lineHeight: 1.5 }}>
                  {subj.description || 'Aucune description spécifiée pour cette matière.'}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      icon={<FileText size={14} />}
                      label="Documents"
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Layers size={14} />}
                      label="Flashcards"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <ArrowRight size={18} color="#94a3b8" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal Ajout / Modification */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingSubject ? 'Modifier la matière' : 'Ajouter une nouvelle matière'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '10px !important' }}>
          <TextField
            label="Nom de la matière"
            placeholder="Ex : Algorithmique, Java, Systèmes d'exploitation..."
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <TextField
            label="Description du cours"
            placeholder="Ex : Concepts clés, structures de données, examens..."
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Couleur distinctive
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setFormData({ ...formData, color: c })}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    bgcolor: c,
                    cursor: 'pointer',
                    border: formData.color === c ? '3px solid #ffffff' : 'none',
                    outline: formData.color === c ? `2px solid ${c}` : 'none',
                    transition: 'transform 0.1s',
                    '&:hover': { transform: 'scale(1.1)' },
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingSubject ? 'Mettre à jour' : 'Créer la matière'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
