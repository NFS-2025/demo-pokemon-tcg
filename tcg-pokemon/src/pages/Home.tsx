import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenText as Cards, Swords, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Pokémon TCG</h1>
          <p className="text-xl text-gray-600">
            Hello, {user?.username}! Ready to build your deck and battle?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            to="/collection"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <Cards className="w-12 h-12 text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Collection</h2>
            <p className="text-gray-600">Build and manage your Pokémon deck</p>
          </Link>

          <Link
            to="/battle"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <Swords className="w-12 h-12 text-red-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Battle</h2>
            <p className="text-gray-600">Challenge other trainers to a duel</p>
          </Link>

          <Link
            to="/profile"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <User className="w-12 h-12 text-green-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profile</h2>
            <p className="text-gray-600">View your stats and achievements</p>
          </Link>
        </div>
      </div>
    </div>
  );
}