import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Plus,
  Edit3,
  Trash2,
  Folder,
  Tag,
  Search,
  BookOpen,
  Calendar,
  Download,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { noteApi, subjectApi } from '../services/api';

const DEFAULT_FOLDERS = ['Tous', 'G?n?ral', 'Théorie', 'Exercices', 'Examens'];

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFolder, setSelectedFolder] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subjectId: '',
    folder: 'G?n?ral',
    tagsInput: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notesRes, subsRes] = await Promise.all([
        noteApi.getAll(),
        subjectApi.getAll(),
      ]);
      setNotes(notesRes.data);
      setSubjects(subsRes.data);
    } catch (err) {
      console.error('Erreur chargement notes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      folder: selectedFolder !== 'Tous' ? selectedFolder : 'G?n?ral',
      tagsInput: '',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (note, e) => {
    e.stopPropagation();
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content || '',
      subjectId: note.subjectId || '',
      folder: note.folder || 'G?n?ral',
      tagsInput: note.tags ? note.tags.join(', ') : '',
    });
    setOpenModal(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Supprimer définitivement cette note ?')) {
      try {
        await noteApi.delete(id);
        loadData();
      } catch (err) {
        console.error('Erreur suppression note', err);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    const tags = formData.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: formData.title,
      content: formData.content,
      subjectId: formData.subjectId || null,
      folder: formData.folder || 'G?n?ral',
      tags,
    };

    try {
      if (editingNote) {
        await noteApi.update(editingNote.id, payload);
      } else {
        await noteApi.create(payload);
      }
      setOpenModal(false);
      loadData();
    } catch (err) {
      console.error('Erreur sauvegarde note', err);
    }
  };

  const exportNotePdf = (note, e) => {
    e.stopPropagation();
    try {
      const doc = new jsPDF();
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, 210, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Smart Study - Note de cours', 14, 16);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.text(note.title, 14, 36);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Dossier : ${note.folder || 'G?n?ral'} | Exportée le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 43);
      doc.line(14, 46, 196, 46);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(note.content || '', 180);
      doc.text(lines, 14, 55);

      doc.save(`note_${note.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (err) {
      console.error('Erreur export note PDF', err);
    }
  };

  // Filtrage
  const filteredNotes = notes.filter((n) => {
    const matchesFolder = selectedFolder === 'Tous' || n.folder === selectedFolder;
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.content && n.content.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

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
            Notes & Cahiers d'étude
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rédigez, classez dans des dossiers et révisez vos synthèses de cours
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={handleOpenCreate}>
          Nouvelle Note
        </Button>
      </Box>

      {/* Toolbar: Search and Folder Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5 }}>
            {DEFAULT_FOLDERS.map((f) => (
              <Chip
                key={f}
                label={f}
                icon={<Folder size={14} />}
                clickable
                color={selectedFolder === f ? 'primary' : 'default'}
                variant={selectedFolder === f ? 'filled' : 'outlined'}
                onClick={() => setSelectedFolder(f)}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Box>

          <TextField
            size="small"
            placeholder="Rechercher une note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search size={16} style={{ marginRight: 8, color: '#94a3b8' }} />,
            }}
            sx={{ minWidth: 260 }}
          />
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 6 }}>
          <Edit3 size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Aucune note trouvée
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Créez votre première fiche de cours organisée par dossier.
          </Typography>
          <Button variant="contained" size="small" onClick={handleOpenCreate}>
            Créer une note
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {filteredNotes.map((note) => {
            const subject = subjects.find((s) => s.id === note.subjectId);
            return (
              <Grid item xs={12} sm={6} md={4} key={note.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                    },
                  }}
                  onClick={(e) => handleOpenEdit(note, e)}
                >
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={<Folder size={12} />}
                          label={note.folder || 'G?n?ral'}
                          size="small"
                          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                        {subject && (
                          <Chip
                            label={subject.name}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              bgcolor: `${subject.color}15`,
                              color: subject.color,
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Exporter en PDF">
                          <IconButton size="small" onClick={(e) => exportNotePdf(note, e)}>
                            <Download size={15} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" color="error" onClick={(e) => handleDelete(note.id, e)}>
                            <Trash2 size={15} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                      {note.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        flexGrow: 1,
                        lineHeight: 1.6,
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {note.content || 'Note vide.'}
                    </Typography>

                    {note.tags && note.tags.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                        {note.tags.map((t, idx) => (
                          <Chip
                            key={idx}
                            label={`#${t}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modal Edit/Create Note */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingNote ? 'Modifier la note' : 'Nouvelle fiche de révision'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '10px !important' }}>
          <TextField
            label="Titre de la note"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Dossier"
              sx={{ flex: 1 }}
              value={formData.folder}
              onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
            >
              {DEFAULT_FOLDERS.filter((f) => f !== 'Tous').map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Matière"
              sx={{ flex: 1 }}
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            >
              <MenuItem value="">Aucune</MenuItem>
              {subjects.map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Tags (séparés par des virgules)"
            placeholder="Ex : Examen, POO, Formule..."
            fullWidth
            value={formData.tagsInput}
            onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
          />

          <TextField
            label="Contenu de la note"
            multiline
            rows={10}
            fullWidth
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Écrivez vos notes, formules, synthèses ou extraits de code..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Enregistrer la note
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
