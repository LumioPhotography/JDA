import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ParentDashboard from './components/ParentDashboard';
import CoachDashboard from './components/CoachDashboard';
import { UserRole, Player } from './types';
import { MOCK_PLAYERS } from './constants';

const App: React.FC = () => {
  // Initialize players from LocalStorage if available, otherwise use MOCK_PLAYERS
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('jda_players');
    return saved ? JSON.parse(saved) : MOCK_PLAYERS;
  });

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loggedInPlayerId, setLoggedInPlayerId] = useState<string | null>(null);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem('jda_players', JSON.stringify(players));
  }, [players]);

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };

  const handleLogin = (role: UserRole, credentials: string) => {
    if (role === UserRole.COACH) {
      setUserRole(UserRole.COACH);
    } else {
      try {
        const { playerId, accessCode } = JSON.parse(credentials);
        
        // Find player in the CURRENT state (not just MOCK constants)
        const player = players.find(p => 
          (p.name.toLowerCase() === playerId.toLowerCase() || p.id === playerId) && 
          p.accessCode === accessCode
        );

        if (player) {
          setLoggedInPlayerId(player.id);
          setUserRole(UserRole.PARENT);
        } else {
          alert('Invalid Credentials. Try "Luke Skehill" with code "1234"');
        }
      } catch (e) {
        console.error("Login Parsing Error");
      }
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoggedInPlayerId(null);
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  if (userRole === UserRole.COACH) {
    return (
      <CoachDashboard 
        players={players} 
        onUpdatePlayer={handleUpdatePlayer} 
        onLogout={handleLogout} 
      />
    );
  }

  // Find the most up-to-date player object
  const activePlayer = players.find(p => p.id === loggedInPlayerId);

  if (userRole === UserRole.PARENT && activePlayer) {
    return <ParentDashboard player={activePlayer} onLogout={handleLogout} />;
  }

  return <div>Error loading application state.</div>;
};

export default App;