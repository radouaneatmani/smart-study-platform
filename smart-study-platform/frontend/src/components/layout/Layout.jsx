import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Sparkles,
  Edit3,
  HelpCircle,
  Layers,
  Bot,
  Calendar,
  User,
  LogOut,
  Moon,
  Sun,
  Menu as MenuIcon,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../theme/ThemeContext';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { text: 'Tableau de bord', icon: LayoutDashboard, path: '/' },
  { text: 'Matières', icon: BookOpen, path: '/subjects' },
  { text: 'Documents', icon: FileText, path: '/documents' },
  { text: 'Résumés IA', icon: Sparkles, path: '/summaries', badge: 'IA' },
  { text: 'Notes & Dossiers', icon: Edit3, path: '/notes' },
  { text: 'Quiz IA', icon: HelpCircle, path: '/quizzes', badge: 'IA' },
  { text: 'Flashcards', icon: Layers, path: '/flashcards' },
  { text: 'Tuteur IA', icon: Bot, path: '/tutor', badge: 'IA' },
  { text: 'Planificateur', icon: Calendar, path: '/study-planner' },
  { text: 'Mon Profil', icon: User, path: '/profile' },
];

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Sparkles size={22} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
            Smart Study
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Plateforme IA
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.6 }} />

      {/* Nav List */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.6 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '10px',
                  py: 1.1,
                  px: 1.8,
                  backgroundColor: isSelected ? 'primary.main' : 'transparent',
                  color: isSelected ? '#ffffff' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isSelected ? 'primary.dark' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                  },
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: isSelected ? '#ffffff' : 'text.secondary',
                  }}
                >
                  <Icon size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.92rem',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(99, 102, 241, 0.12)',
                      color: isSelected ? '#fff' : 'primary.main',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mx: 2, opacity: 0.6 }} />

      {/* User Info footer */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 38,
            height: 38,
            fontWeight: 700,
            fontSize: '0.95rem',
          }}
        >
          {user?.fullName ? user.fullName[0].toUpperCase() : 'E'}
        </Avatar>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {user?.fullName || 'Alexandre Martin'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email || 'etudiant@smartstudy.com'}
          </Typography>
        </Box>
        <Tooltip title="D'connexion">
          <IconButton size="small" onClick={handleLogout} sx={{ color: 'text.secondary' }}>
            <LogOut size={18} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backdropFilter: 'blur(10px)',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(11, 15, 25, 0.85)' : 'rgba(248, 250, 252, 0.85)',
          borderBottom: 1,
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon size={22} />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
            {NAV_ITEMS.find((item) => item.path === location.pathname)?.text || 'Smart Study Platform'}
          </Typography>

          {/* Action icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={mode === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}>
              <IconButton onClick={toggleTheme} color="inherit" sx={{ bgcolor: 'action.hover' }}>
                {mode === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Mon Compte">
              <IconButton onClick={handleMenuOpen} sx={{ p: 0.5, ml: 0.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34, fontSize: '0.85rem' }}>
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'E'}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 3,
                sx: { minWidth: 180, mt: 1, borderRadius: 2 },
              }}
            >
              <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                <ListItemIcon><User size={18} /></ListItemIcon>
                Mon Profil
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon sx={{ color: 'error.main' }}><LogOut size={18} /></ListItemIcon>
                D'connexion
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Navigation Drawers */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: 'background.paper' },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
