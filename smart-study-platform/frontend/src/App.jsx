import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './context/AuthContext';

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Documents from './pages/Documents';
import Summaries from './pages/Summaries';
import Notes from './pages/Notes';
import Quizzes from './pages/Quizzes';
import Flashcards from './pages/Flashcards';
import AITutor from './pages/AITutor';
import StudyPlanner from './pages/StudyPlanner';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="documents" element={<Documents />} />
        <Route path="summaries" element={<Summaries />} />
        <Route path="notes" element={<Notes />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="tutor" element={<AITutor />} />
        <Route path="study-planner" element={<StudyPlanner />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
