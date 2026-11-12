import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Sparkles,
  Download,
  FileText,
  Bookmark,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { documentApi, aiApi } from '../services/api';

export default function Summaries() {
  const [searchParams] = useSearchParams();
  const initialDocId = searchParams.get('documentId') || '';

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(initialDocId);
  const [customText, setCustomText] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await documentApi.getAll();
      setDocuments(res.data);
      if (initialDocId) {
        const found = res.data.find((d) => d.id === initialDocId);
        if (found) {
          if (found.shortSummary || found.detailedSummary) {
            setSummary({
              shortSummary: found.shortSummary,
              detailedSummary: found.detailedSummary,
              keyConcepts: found.keyConcepts || [],
            });
          }
        }
      } else if (res.data.length > 0) {
        setSelectedDocId(res.data[0].id);
        if (res.data[0].shortSummary) {
          setSummary({
            shortSummary: res.data[0].shortSummary,
            detailedSummary: res.data[0].detailedSummary,
            keyConcepts: res.data[0].keyConcepts || [],
          });
        }
      }
    } catch (err) {
      console.error('Erreur chargement documents', err);
    }
  };

  const handleDocChange = (docId) => {
    setSelectedDocId(docId);
    const doc = documents.find((d) => d.id === docId);
    if (doc && (doc.shortSummary || doc.detailedSummary)) {
      setSummary({
        shortSummary: doc.shortSummary,
        detailedSummary: doc.detailedSummary,
        keyConcepts: doc.keyConcepts || [],
      });
    } else {
      setSummary(null);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const payload = selectedDocId
        ? { documentId: selectedDocId }
        : { text: customText };

      const res = await aiApi.summarize(payload);
      setSummary(res.data);
    } catch (err) {
      console.error('Erreur génération résumé', err);
      alert("Erreur lors de la génération du résumé par l'IA");
    } finally {
      setLoading(false);
    }
  };

  const exportToPdf = () => {
    if (!summary) return;
    setExporting(true);
    try {
      const doc = new jsPDF();
      const currentDoc = documents.find((d) => d.id === selectedDocId);
      const title = currentDoc ? currentDoc.title : 'Résumé de Cours IA';

      // Header
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Smart Study Platform - Résumé IA', 14, 18);

      // Document Title
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(15);
      doc.text(title, 14, 40);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Document: ${currentDoc ? currentDoc.fileName : 'Texte libre'} | Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 47);
      doc.line(14, 51, 196, 51);

      let yPos = 60;

      // 1. Résumé Court
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('1. Résumé Synthétique', 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const shortLines = doc.splitTextToSize(summary.shortSummary || '', 180);
      doc.text(shortLines, 14, yPos);
      yPos += shortLines.length * 6 + 10;

      // 2. Concepts clés
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('2. Notions et Concepts Clés', 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      if (summary.keyConcepts && summary.keyConcepts.length > 0) {
        summary.keyConcepts.forEach((concept) => {
          doc.text(`? ${concept}`, 18, yPos);
          yPos += 6;
        });
      }
      yPos += 6;

      // Check for page overflow
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      // 3. Résumé Détaillé
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('3. Analyse et Synthèse Approfondie', 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const detailedClean = (summary.detailedSummary || '').replace(/###|####|\*\*/g, '');
      const detailedLines = doc.splitTextToSize(detailedClean, 180);
      doc.text(detailedLines, 14, yPos);

      // Save PDF
      doc.save(`resume_${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (e) {
      console.error('Erreur export PDF', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Résumés Intelligents par l'IA
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Synthétisez vos supports de cours en résumés courts, détaillés et fiches de concepts clés
          </Typography>
        </Box>
        {summary && (
          <Button
            variant="outlined"
            startIcon={<Download size={18} />}
            onClick={exportToPdf}
            disabled={exporting}
          >
            {exporting ? 'Génération...' : 'Exporter en PDF'}
          </Button>
        )}
      </Box>

      {/* Selection card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              select
              label="Sélectionner un document téléversé"
              sx={{ minWidth: 320, flexGrow: 1 }}
              value={selectedDocId}
              onChange={(e) => handleDocChange(e.target.value)}
            >
              <MenuItem value="">-- Saisie de texte libre --</MenuItem>
              {documents.map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>
                  {doc.title} ({doc.fileName})
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Sparkles size={18} />}
              disabled={loading || (!selectedDocId && !customText.trim())}
              onClick={handleGenerate}
              sx={{ px: 3 }}
            >
              {loading ? "Analyse par l'IA..." : 'Générer le résumé'}
            </Button>
          </Box>

          {!selectedDocId && (
            <TextField
              label="Collez ici le texte de votre cours à résumer"
              multiline
              rows={4}
              fullWidth
              sx={{ mt: 2 }}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Ex : Collez un chapitre sur les systèmes de fichiers ou la programmation Java..."
            />
          )}
        </CardContent>
      </Card>

      {/* Summary Output Area */}
      {summary ? (
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
              <Tab label="1. Résumé Court" sx={{ fontWeight: 600 }} />
              <Tab label="2. Résumé Détaillé" sx={{ fontWeight: 600 }} />
              <Tab label="3. Concepts Clés" sx={{ fontWeight: 600 }} />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 3.5 }}>
            {tabValue === 0 && (
              <Box>
                <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                  Ce résumé court condense les points capitaux en quelques phrases percutantes, idéal pour une relecture rapide la veille de l'examen.
                </Alert>
                <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                  {summary.shortSummary}
                </Typography>
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.8,
                    '& h3': { color: 'primary.main', fontWeight: 700, mt: 1, mb: 1 },
                    '& h4': { fontWeight: 600, mt: 1.5, mb: 0.5 },
                  }}
                >
                  {summary.detailedSummary}
                </Typography>
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Notions essentielles extraites par l'IA à retenir impérativement :
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
                  {summary.keyConcepts && summary.keyConcepts.map((concept, i) => (
                    <Chip
                      key={i}
                      label={concept}
                      color="primary"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        py: 2,
                        px: 1,
                        fontSize: '0.9rem',
                        borderColor: 'primary.main',
                      }}
                      icon={<CheckCircle2 size={16} />}
                    />
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  ?? Conseil : Transformez ces concepts en cartes de révision dans l'onglet Flashcards pour une mémorisation active !
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ textAlign: 'center', p: 6 }}>
          <FileText size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Prêt à générer votre résumé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sélectionnez un document téléversé ci-dessus ou collez du texte, puis cliquez sur <strong>Générer le résumé</strong>.
          </Typography>
        </Card>
      )}
    </Box>
  );
}
