import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from "react-hot-toast";

export function Login() {
  const [username, setUsername] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      auth(username.trim());
    }
  };
  
  
    const auth = async (email: string) => {
      try {
        const result = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/Inscription/check-email?email=${email}`, {
        method: 'GET',
        headers: {
          'X-API-Key': `NFM-2025-react-api-key`
        }
        })
        if (result.ok) {
          const data = await result.json();
          console.log('Server response:', data);
          if (data.isRegistered) {
            login(username);
            navigate('/');
            toast.success('Connection réussie !');
          }
          else {
            toast.error('Email not found. Please register first.');
          } 
        } else {
          console.error('Error logging in :', result.statusText);
        } 
      }
      catch (error) {
        console.error('Error logging in :', error);
      }
    }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Pokémon TCG</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your username"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Playing
          </button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="font-medium text-blue-600 hover:text-blue-500">
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}