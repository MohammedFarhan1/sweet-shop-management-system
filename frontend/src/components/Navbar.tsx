import React from 'react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">🍭 Sweet Shop</h1>
        
        {user && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1 rounded ${currentPage === 'dashboard' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}
            >
              Dashboard
            </button>
            
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1 rounded ${currentPage === 'admin' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}
              >
                Admin Panel
              </button>
            )}
            
            <span className="text-sm">
              {user.name} ({user.role})
            </span>
            
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
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