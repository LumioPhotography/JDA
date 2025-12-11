import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, KeyRound, User as UserIcon, Lock, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, id: string) => void;
  teamLogo: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, teamLogo }) => {
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
    onLogin(UserRole.COACH, coachPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden font-sans">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-zinc-800">
        
        {/* Header */}
        <div className="bg-black p-8 text-center border-b-4 border-teal-500">
          <div className="mx-auto w-32 h-32 mb-6 relative">
            <div className="w-full h-full rounded-full border-4 border-teal-500 shadow-2xl bg-black overflow-hidden flex items-center justify-center">
               {teamLogo ? (
                 <img src={teamLogo} alt="Academy Logo" className="w-full h-full object-cover" />
               ) : (
                 <Shield size={48} className="text-white" />
               )}
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter brand-font italic">
            JDA <span className="text-teal-500">COACHING</span>
          </h1>
          <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase mt-2">
            & ACADEMY PORTAL
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setActiveTab('parent'); setError(''); }}
            className={`flex-1 py-4 text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'parent' 
                ? 'text-black border-b-2 border-teal-500 bg-gray-50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            Player Login
          </button>
          <button
            onClick={() => { setActiveTab('coach'); setError(''); }}
            className={`flex-1 py-4 text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'coach' 
                ? 'text-black border-b-2 border-teal-500 bg-gray-50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            Coach Portal
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
            <form onSubmit={handleParentLogin} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Player Name
                </label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luke Skehill"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-bold text-gray-800 text-sm"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Access Code
                </label>
                <div className="relative group">
                  <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-bold text-gray-800 text-sm"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black hover:bg-zinc-800 text-white font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 border-2 border-transparent hover:border-teal-500 uppercase tracking-wide text-sm"
              >
                View Report Card <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleCoachLogin} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Coach Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-bold text-gray-800 text-sm"
                    value={coachPass}
                    onChange={(e) => setCoachPass(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                Access Dashboard <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
             <p className="text-[10px] text-gray-400 font-bold uppercase">v2.0 • JDA Elite Performance</p>
        </div>
      </div>
    </div>
  );
};

export default Login;