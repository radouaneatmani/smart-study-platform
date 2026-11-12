import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  UploadCloud,
  FileText,
  Sparkles,
  HelpCircle,
  Layers,
  Bot,
  Trash2,
  Eye,
  Plus,
  FileCode,
} from 'lucide-react';
import { documentApi, subjectApi } from '../services/api';

export default function Documents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectFilter = searchParams.get('subjectId');

  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload dialog
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectFilter || '');
  const [autoSummary, setAutoSummary] = useState(true);
  const [uploading, setUploading] = useState(false);

  // View text dialog
  const [viewDoc, setViewDoc] = useState(null);

  useEffect(() => {
    loadData();
  }, [subjectFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsRes, subsRes] = await Promise.all([
        documentApi.getAll(subjectFilter),
        subjectApi.getAll(),
      ]);
      setDocuments(docsRes.data);
      setSubjects(subsRes.data);
    } catch (err) {
      console.error('Erreur chargement documents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', docTitle);
      if (selectedSubjectId) formData.append('subjectId', selectedSubjectId);
      formData.append('generateAiSummary', autoSummary);

      await documentApi.upload(formData);
      setOpenUploadModal(false);
      setUploadFile(null);
      setDocTitle('');
      loadData();
    } catch (err) {
      console.error('Erreur upload document', err);
      alert('Erreur lors du téléversement du document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Supprimer ce document ?')) {
      try {
        await documentApi.delete(id);
        loadData();
      } catch (err) {
        console.error('Erreur suppression', err);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
            Documents & Supports de Cours
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Téléversez vos fichiers PDF, DOCX ou TXT pour activer l'analyse IA
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenUploadModal(true)}
        >
          Téléverser un document
        </Button>
      </Box>

      {/* Filter by subject banner if active */}
      {subjectFilter && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Filtre actif :
          </Typography>
          <Chip
            label={subjects.find((s) => s.id === subjectFilter)?.name || 'Matière'}
            onDelete={() => navigate('/documents')}
            color="primary"
            size="small"
          />
        </Box>
      )}

      {documents.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 6, borderStyle: 'dashed' }}>
          <UploadCloud size={48} color="#6366f1" style={{ marginBottom: 16 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Aucun document téléversé
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ajoutez vos supports de cours (PDF, DOCX, TXT) pour générer automatiquement des résumés, des quiz et des fiches mémo.
          </Typography>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setOpenUploadModal(true)}>
            Téléverser mon premier cours
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {documents.map((doc) => {
            const subject = subjects.find((s) => s.id === doc.subjectId);
            return (
              <Grid item xs={12} md={6} key={doc.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: doc.fileType === 'PDF' ? '#ef444415' : '#3b82f615',
                            color: doc.fileType === 'PDF' ? '#ef4444' : '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <FileText size={22} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {doc.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {doc.fileName} — {formatFileSize(doc.fileSize)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Aperçu du texte extrait">
                          <IconButton size="small" onClick={() => setViewDoc(doc)}>
                            <Eye size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" color="error" onClick={(e) => handleDelete(doc.id, e)}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {subject && (
                      <Chip
                        label={subject.name}
                        size="small"
                        sx={{
                          mb: 1.5,
                          bgcolor: `${subject.color}18`,
                          color: subject.color,
                          fontWeight: 600,
                          fontSize: '0.72rem',
                        }}
                      />
                    )}

                    {doc.shortSummary ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {doc.shortSummary}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                        Texte extrait ({doc.extractedText ? `${doc.extractedText.length} caractères` : 'aucun texte'}). Résumé en attente.
                      </Typography>
                    )}

                    {/* AI Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Sparkles size={14} />}
                        onClick={() => navigate(`/summaries?documentId=${doc.id}`)}
                      >
                        Résumé
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<HelpCircle size={14} />}
                        onClick={() => navigate(`/quizzes?documentId=${doc.id}`)}
                      >
                        Quiz
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Layers size={14} />}
                        onClick={() => navigate(`/flashcards?documentId=${doc.id}`)}
                      >
                        Flashcards
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Bot size={14} />}
                        onClick={() => navigate(`/tutor?documentId=${doc.id}`)}
                      >
                        Tuteur
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modal Upload */}
      <Dialog open={openUploadModal} onClose={() => !uploading && setOpenUploadModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Téléverser un cours</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '10px !important' }}>
          <Box
            sx={{
              p: 3,
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: 'action.hover',
            }}
            component="label"
          >
            <UploadCloud size={40} color="#6366f1" style={{ marginBottom: 8 }} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {uploadFile ? uploadFile.name : 'Cliquez ou glissez un fichier ici'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Formats acceptés : PDF, DOCX, TXT (Max 50 Mo)
            </Typography>
            <input
              type="file"
              hidden
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
            />
          </Box>

          <TextField
            label="Titre du document"
            placeholder="Ex : Algorithmique Avancée - Chapitre 1"
            fullWidth
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
          />

          <TextField
            select
            label="Matière associée (optionnel)"
            fullWidth
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            <MenuItem value="">Aucune</MenuItem>
            {subjects.map((sub) => (
              <MenuItem key={sub.id} value={sub.id}>
                {sub.name}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Checkbox
                checked={autoSummary}
                onChange={(e) => setAutoSummary(e.target.checked)}
                color="primary"
              />
            }
            label="Générer automatiquement le résumé IA et les concepts clés dès le téléversement"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button disabled={uploading} onClick={() => setOpenUploadModal(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            disabled={!uploadFile || uploading}
            onClick={handleUpload}
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadCloud size={18} />}
          >
            {uploading ? 'Traitement IA en cours...' : 'Téléverser'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal View Document Text */}
      <Dialog open={Boolean(viewDoc)} onClose={() => setViewDoc(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {viewDoc?.title} - Texte extrait
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 500 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {viewDoc?.extractedText || 'Aucun texte extrait du document.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewDoc(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
