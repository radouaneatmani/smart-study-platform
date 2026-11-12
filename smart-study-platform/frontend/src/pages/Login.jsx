import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Link,
  Chip,
} from '@mui/material';
import { Sparkles, LogIn, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, quickDemoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    try {
      setLoading(true);
      setErrorMsg('');
      await login(username, password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true);
      setErrorMsg('');
      await quickDemoLogin();
      navigate('/');
    } catch (err) {
      setErrorMsg('Erreur de connexion démo');
    } finally {
      setDemoLoading(false);
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
      <Card sx={{ maxWidth: 450, width: '100%', p: 1, borderRadius: 4, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}>
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
              Smart Study Platform
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connectez-vous pour accéder à votre espace d'étude IA
            </Typography>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {/* Quick Demo Login Button */}
          <Button
            variant="outlined"
            fullWidth
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
            startIcon={demoLoading ? <CircularProgress size={16} /> : <UserCheck size={18} />}
            sx={{
              py: 1.2,
              mb: 2.5,
              borderColor: 'primary.main',
              color: 'primary.main',
              fontWeight: 700,
              bgcolor: 'rgba(99, 102, 241, 0.06)',
              '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.12)' },
            }}
          >
            {demoLoading ? 'Connexion...' : 'Connexion Démo en 1 clic (Alexandre Martin)'}
          </Button>

          <Divider sx={{ mb: 2.5 }}>
            <Typography variant="caption" color="text.secondary">
              OU AVEC VOS IDENTIFIANTS
            </Typography>
          </Divider>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nom d'utilisateur ou Email"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Mot de passe"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LogIn size={18} />}
              sx={{ py: 1.3, fontWeight: 700 }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Pas encore de compte ?{' '}
              <Link component={RouterLink} to="/register" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Créer un compte étudiant
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
