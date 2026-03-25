import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'ganesk') {
      sessionStorage.setItem('admin_password', password);
      navigate('/admin');
    } else {
      setError('Invalid admin password');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl"
      >
        <div className="flex flex-col items-center mb-8">
           <img src="/assets/logo/gk_logo.png" alt="Logo" className="w-16 h-16 mb-4 filter invert" />
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-zinc-400" />
          </div>
          <h1 className="text-2xl font-light text-white tracking-widest uppercase">Admin Concierge</h1>
          <p className="text-zinc-500 text-sm mt-2">Restricted Access Area</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-tighter text-zinc-500 mb-2 ml-1">
              Admin Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-zinc-600 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center font-medium uppercase tracking-tighter">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-white text-black py-4 rounded-lg font-medium hover:bg-zinc-200 transition-colors uppercase tracking-widest text-xs"
          >
            Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
