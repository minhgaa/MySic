import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import './index.css';
import Mainpage from './pages/mainpage';
import { AuthProvider } from './hooks/authContext';
import ProtectedRoute from './components/ProtectedRoute';
import Artist from './pages/artist';
import Category from './pages/category';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Mainpage />} />
        <Route path="/artist" element={<Artist />} />
        <Route path="/category" element={<Category />} />
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
