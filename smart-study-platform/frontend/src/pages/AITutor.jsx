import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Avatar,
  Chip,
  MenuItem,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  BookOpen,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { aiApi, documentApi, subjectApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SUGGESTIONS = [
  'Explique-moi la récursion.',
  'Explique-moi ce PDF.',
  "Qu'est-ce que le polymorphisme ?",
  'Que signifie ACID en SGBD ?',
  'Donne-moi un exemple concret en Java.',
];

export default function AITutor() {
  const [searchParams] = useSearchParams();
  const initialDocId = searchParams.get('documentId');

  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedDocId, setSelectedDocId] = useState(initialDocId || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    loadMetadataAndHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMetadataAndHistory = async () => {
    try {
      const [docsRes, subsRes, histRes] = await Promise.all([
        documentApi.getAll(),
        subjectApi.getAll(),
        aiApi.getTutorHistory({ documentId: selectedDocId || undefined }),
      ]);
      setDocuments(docsRes.data);
      setSubjects(subsRes.data);

      if (histRes.data && histRes.data.length > 0) {
        setMessages(histRes.data);
      } else {
        // Message d'accueil initial
        setMessages([
          {
            role: 'assistant',
            content: `Bonjour ${user?.fullName || 'étudiant'} ! ?? Je suis votre Tuteur d'étude IA personnel.\n\nJe peux vous expliquer n'importe quel concept technique (comme la récursion, les algorithmes de tri, le polymorphisme, les bases de données ACID...), ou analyser en profondeur un document PDF que vous avez téléversé.\n\nPosez-moi une question ci-dessous ou cliquez sur une suggestion pour d'marrer !`,
          },
        ]);
      }
    } catch (err) {
      console.error('Erreur chargement tuteur', err);
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await aiApi.tutorChat({
        message: text,
        documentId: selectedDocId || null,
        subjectId: selectedSubjectId || null,
      });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Erreur tuteur chat', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Désolé, une erreur est survenue lors de la communication avec le tuteur.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', height: 'calc(100vh - 130px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Card */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Bot size={24} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Tuteur Pédagogique IA
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Toujours disponible pour vous d'bloquer et vulgariser vos cours
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              select
              size="small"
              label="Contexte du document"
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">-- Poser sur tout le cours --</MenuItem>
              {documents.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.title} ({d.fileType})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      </Card>

      {/* Chat Messages Body */}
      <Card sx={{ flexGrow: 1, overflowY: 'auto', p: 3, mb: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                gap: 1.5,
              }}
            >
              {!isUser && (
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 36,
                    height: 36,
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <Bot size={20} />
                </Avatar>
              )}

              <Box
                sx={{
                  maxWidth: '75%',
                  p: 2.2,
                  borderRadius: 3,
                  bgcolor: isUser ? 'primary.main' : 'action.hover',
                  color: isUser ? '#ffffff' : 'text.primary',
                  border: isUser ? 'none' : 1,
                  borderColor: 'divider',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.7,
                    fontSize: '0.95rem',
                    '& code': {
                      fontFamily: 'monospace',
                      bgcolor: isUser ? 'rgba(0,0,0,0.2)' : 'action.selected',
                      p: '2px 6px',
                      borderRadius: '4px',
                    },
                  }}
                >
                  {msg.content}
                </Typography>
              </Box>

              {isUser && (
                <Avatar
                  sx={{
                    bgcolor: 'secondary.main',
                    width: 36,
                    height: 36,
                  }}
                >
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'E'}
                </Avatar>
              )}
            </Box>
          );
        })}

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              <Bot size={20} />
            </Avatar>
            <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Le tuteur rédige son explication...
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={chatEndRef} />
      </Card>

      {/* Suggestion Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, overflowX: 'auto', py: 0.5 }}>
        {SUGGESTIONS.map((s, i) => (
          <Chip
            key={i}
            label={s}
            size="small"
            clickable
            icon={<Lightbulb size={13} />}
            onClick={() => handleSend(s)}
            sx={{ fontWeight: 600, flexShrink: 0 }}
          />
        ))}
      </Box>

      {/* Input Bar */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <TextField
          fullWidth
          placeholder="Posez votre question pédagogique (ex: Explique-moi la récursion, Explique ce PDF...)"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 3,
            '& .MuiOutlinedInput-root': { borderRadius: 3 },
          }}
        />
        <Button
          variant="contained"
          onClick={() => handleSend()}
          disabled={!inputMessage.trim() || loading}
          sx={{ px: 3, borderRadius: 3 }}
        >
          <Send size={18} />
        </Button>
      </Box>
    </Box>
  );
}
