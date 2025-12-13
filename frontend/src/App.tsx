import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

const AppContent: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'dashboard' | 'admin'>(
    user ? (isAdmin ? 'admin' : 'dashboard') : 'login'
  );

  React.useEffect(() => {
    if (user) {
      setCurrentPage(isAdmin ? 'admin' : 'dashboard');
    } else {
      setCurrentPage('login');
    }
  }, [user, isAdmin]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Sweet Shop Management</h1>
              <p className="text-gray-600 mt-2">Please login or register to continue</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex mb-4">
                <button
                  onClick={() => setCurrentPage('login')}
                  className={`flex-1 py-2 px-4 text-center rounded-l-lg ${
                    currentPage === 'login'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setCurrentPage('register')}
                  className={`flex-1 py-2 px-4 text-center rounded-r-lg ${
                    currentPage === 'register'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Register
                </button>
              </div>
              
              {currentPage === 'login' ? <Login /> : <Register />}
              
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                <p className="font-semibold">Test Accounts:</p>
                <p>Admin: admin@example.com / admin123</p>
                <p>User: user@example.com / user123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'admin' && <AdminPanel />}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;