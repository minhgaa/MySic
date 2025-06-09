import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import './index.css';
import Mainpage from './pages/mainpage';
import { AuthProvider } from './hooks/authContext';
import { useAuth } from './hooks/authContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Artist from './pages/artist';
import Category from './pages/category';
import SongManagement from './pages/admin/SongManagement';
import UserManagement from './pages/admin/UserManagement';
import Dashboard from './pages/admin/Dashboard';
import Statistics from './pages/admin/Statistics';
import GenreManagement from './pages/admin/GenreManagement';
import Playlist from './pages/playlist';
import Profile from './pages/profile';

function AppRoutes() {
  const { isAdmin } = useAuth();

  // If user is admin, only show admin routes
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/songs" element={<SongManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/stats" element={<Statistics />} />
          <Route path="/admin/genres" element={<GenreManagement />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    );
  }

  // Regular user routes
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Mainpage />} />
        <Route path="/artist" element={<Artist />} />
        <Route path="/category" element={<Category />} />
        <Route path="/playlist/:id" element={<Playlist />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Redirect any unknown routes to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
