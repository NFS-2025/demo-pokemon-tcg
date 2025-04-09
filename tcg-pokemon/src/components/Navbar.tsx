import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpenText as Cards, Swords, User as UserIcon, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">Pokémon TCG</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <Link to="/collection" className="flex items-center space-x-1 hover:text-blue-600">
                <Cards className="w-5 h-5" />
                <span>Collection</span>
              </Link>
              <Link to="/battle" className="flex items-center space-x-1 hover:text-blue-600">
                <Swords className="w-5 h-5" />
                <span>Battle</span>
              </Link>
              <Link to="/profile" className="flex items-center space-x-1 hover:text-blue-600">
                <UserIcon className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-800"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}