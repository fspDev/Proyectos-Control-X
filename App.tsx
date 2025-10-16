import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { SearchProvider } from './contexts/SearchContext';
import { SidebarProvider } from './contexts/SidebarContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import TableViewPage from './pages/TableViewPage';
import CalendarViewPage from './pages/CalendarViewPage';

function App() {
  // FIX: Explicitly pass children to providers to resolve a complex type inference issue.
  // This makes the relationship clear to the TypeScript compiler.
  const AppRoutes = (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard">
            <Route index element={<DashboardPage />} />
            <Route path="table" element={<TableViewPage />} />
            <Route path="calendar" element={<CalendarViewPage />} />
          </Route>
          <Route path="admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );

  return (
    // FIX: Explicitly passing the `children` prop to the providers to fix the TypeScript error.
    <ThemeProvider children={
      <AuthProvider children={
        <SidebarProvider children={
          <SearchProvider children={AppRoutes} />
        } />
      } />
    } />
  );
}

export default App;