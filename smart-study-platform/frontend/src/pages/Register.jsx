import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, login } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;
    try {
      setLoading(true);
      setErrorMsg('');
      await register(username, email, password, fullName);
      // Connexion directe
      await login(username, password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'radial-gradient(circle at top, rgba(99,102,241,0.15) 0%, rgba(15,23,42,0) 70%)',
      }}
    >
      <Card sx={{ maxWidth: 480, width: '100%', p: 1, borderRadius: 4, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}>
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                mb: 1.5,
                boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Sparkles size={28} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Rejoindre Smart Study
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Créez votre compte pour booster vos apprentissages avec l'IA
            </Typography>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nom complet"
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex : Alexandre Martin"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Nom d'utilisateur"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex : amartin"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Adresse email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex : alexandre@etudiant.fr"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Mot de passe"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Minimum 6 caractères"
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <UserPlus size={18} />}
              sx={{ py: 1.3, fontWeight: 700 }}
            >
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Vous avez déjà un compte ?{' '}
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Se connecter
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
