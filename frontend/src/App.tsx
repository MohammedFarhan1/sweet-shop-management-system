import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <Login onNavigate={setCurrentPage} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return user.role === 'ADMIN' ? <AdminPanel /> : <Dashboard />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;