import { Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import AnalyticsPage from '../pages/AnalyticsPage';
import HistoryPage from '../pages/HistoryPage';
import Simulation from '../pages/Simulation';
import Rules from '../pages/Rules';
import Records from '../pages/Records';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/layout/ProtectedRoute';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <ProtectedRoute allowedRoles={['viewer', 'admin']}>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/analytics"
      element={
        <ProtectedRoute allowedRoles={['viewer', 'admin']}>
          <AnalyticsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/records"
      element={
        <ProtectedRoute allowedRoles={['viewer', 'admin']}>
          <Records />
        </ProtectedRoute>
      }
    />
    <Route
      path="/simulation"
      element={
        <ProtectedRoute allowedRoles={['simulator']}>
          <Simulation />
        </ProtectedRoute>
      }
    />
    <Route
      path="/rules"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Rules />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;