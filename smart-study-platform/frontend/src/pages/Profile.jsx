import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  User,
  Key,
  Clock,
  Shield,
  CheckCircle,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [targetHours, setTargetHours] = useState(user?.targetStudyHoursPerWeek || 10);
  const [geminiKey, setGeminiKey] = useState(user?.geminiApiKey || '');
  const [openaiKey, setOpenaiKey] = useState(user?.openaiApiKey || '');
  const [newPassword, setNewPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      await updateProfile({
        fullName,
        targetStudyHoursPerWeek: targetHours,
        geminiApiKey: geminiKey,
        openaiApiKey: openaiKey,
        newPassword: newPassword || undefined,
      });
      setSuccessMsg('Profil mis à jour avec succès !');
      setNewPassword('');
    } catch (err) {
      console.error('Erreur mise à jour profil', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 750, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Mon Profil étudiant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gérez vos informations personnelles, vos objectifs d'étude et vos clés d'accès IA
      </Typography>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}

      <Card sx={{ p: 1 }}>
        <CardContent sx={{ p: 3.5 }}>
          {/* Header Identity */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 4 }}>
            <Avatar
              sx={{
                width: 68,
                height: 68,
                bgcolor: 'primary.main',
                fontSize: '1.8rem',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              }}
            >
              {fullName ? fullName[0].toUpperCase() : 'E'}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {fullName || 'étudiant'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Identifiant : @{user?.username} ? {user?.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3.5 }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nom complet"
                  fullWidth
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Objectif d'heures d'étude par semaine"
                  type="number"
                  fullWidth
                  InputProps={{ inputProps: { min: 1, max: 80 } }}
                  value={targetHours}
                  onChange={(e) => setTargetHours(parseInt(e.target.value) || 10)}
                  helperText="Sert de référence pour le tableau de bord"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Key size={16} color="#6366f1" /> Clés API IA Personnalisées (Optionnel)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Si vous laissez vide, la plateforme utilise son moteur d'IA pédagogique intégré. Vous pouvez ?galement renseigner votre propre clé Google Gemini ou OpenAI.
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Clé Google Gemini API"
                  type="password"
                  placeholder="AIzaSy..."
                  fullWidth
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Clé OpenAI API"
                  type="password"
                  placeholder="sk-..."
                  fullWidth
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield size={16} color="#6366f1" /> Sécurité du Compte
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Nouveau mot de passe (laisser vide pour ne pas changer)"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />}
                  sx={{ px: 4 }}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
