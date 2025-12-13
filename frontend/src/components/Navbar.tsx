import React from 'react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: 'dashboard' | 'admin') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Sweet Shop Management</h1>
        
        {user && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-3 py-1 rounded ${
                currentPage === 'dashboard'
                  ? 'bg-blue-800'
                  : 'hover:bg-blue-700'
              }`}
            >
              Dashboard
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setCurrentPage('admin')}
                className={`px-3 py-1 rounded ${
                  currentPage === 'admin'
                    ? 'bg-blue-800'
                    : 'hover:bg-blue-700'
                }`}
              >
                Admin Panel
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <span>Welcome, {user.name}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                isAdmin ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                {user.role}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-700 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;