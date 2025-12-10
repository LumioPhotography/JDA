import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, KeyRound, User as UserIcon, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, id: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'parent' | 'coach'>('parent');
  const [playerId, setPlayerId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [coachPass, setCoachPass] = useState('');
  const [error, setError] = useState('');

  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(UserRole.PARENT, JSON.stringify({ playerId, accessCode }));
  };

  const handleCoachLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (coachPass === 'admin') {
      onLogin(UserRole.COACH, 'coach1');
    } else {
      setError('Invalid Coach Password (Try "admin")');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-zinc-800">
        
        {/* Header */}
        <div className="bg-black p-8 text-center border-b-4 border-teal-500">
          <div className="mx-auto bg-zinc-900 w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg border-2 border-teal-500">
            <Shield className="text-teal-400 w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">JDA ACADEMY</h1>
          <p className="text-teal-500 text-xs font-bold tracking-widest uppercase mt-2">Player Performance Portal</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setActiveTab('parent'); setError(''); }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${
              activeTab === 'parent' 
                ? 'text-black border-b-2 border-teal-500 bg-gray-50' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            PARENT LOGIN
          </button>
          <button
            onClick={() => { setActiveTab('coach'); setError(''); }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${
              activeTab === 'coach' 
                ? 'text-black border-b-2 border-teal-500 bg-gray-50' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            COACH PORTAL
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-bold text-center">
              {error}
            </div>
          )}

          {activeTab === 'parent' ? (
            <form onSubmit={handleParentLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Player Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luke Skehill"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all font-medium"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Access Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all font-medium"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                   Try "Luke Skehill" with code "1234"
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 border border-black hover:border-teal-500/50"
              >
                VIEW REPORT CARD
              </button>
            </form>
          ) : (
            <form onSubmit={handleCoachLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Coach Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all font-medium"
                    value={coachPass}
                    onChange={(e) => setCoachPass(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                   Password is "admin"
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99]"
              >
                ACCESS DASHBOARD
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;