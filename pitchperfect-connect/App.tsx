import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ParentDashboard from './components/ParentDashboard';
import CoachDashboard from './components/CoachDashboard';
import { UserRole, Player, Coach } from './types';
import { MOCK_PLAYERS, MOCK_COACHES, TEAM_LOGO_URL as DEFAULT_LOGO } from './constants';

const App: React.FC = () => {
  // Initialize players from LocalStorage
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem('jda_players');
      // Basic validation: ensure we have an array
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
           // DATA INTEGRITY CHECK:
           // Check if this is "Old Data" missing the new 'stats' structure.
           // If we find a report card that doesn't have a 'stats' array, we assume the data is corrupt/outdated.
           const hasLegacyData = parsed.some((p: any) => 
             Array.isArray(p.reportCards) && p.reportCards.some((r: any) => !r.stats || !Array.isArray(r.stats))
           );

           if (!hasLegacyData) {
             return parsed;
           }
           console.warn("Legacy player data detected (missing stats). Resetting to defaults to prevent crash.");
        }
      }
      return MOCK_PLAYERS;
    } catch (e) {
      console.error("Error loading players:", e);
      return MOCK_PLAYERS;
    }
  });

  // Initialize Coaches from LocalStorage
  const [coaches, setCoaches] = useState<Coach[]>(() => {
    try {
      const saved = localStorage.getItem('jda_coaches');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if the data is stale (Admin missing password field)
        const admin = parsed.find((c: Coach) => c.isAdmin);
        if (admin && admin.password) {
          return parsed;
        }
        console.log("Old data detected. Resetting Coach database to enable Admin login.");
      }
      return MOCK_COACHES;
    } catch (e) {
      console.error("Error loading coaches:", e);
      return MOCK_COACHES;
    }
  });

  // Initialize Team Logo from LocalStorage
  const [teamLogo, setTeamLogo] = useState<string>(() => {
    try {
      return localStorage.getItem('jda_team_logo') || DEFAULT_LOGO;
    } catch (e) {
      console.error("Error loading logo:", e);
      return DEFAULT_LOGO;
    }
  });

  const [currentUser, setCurrentUser] = useState<Coach | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loggedInPlayerId, setLoggedInPlayerId] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem('jda_players', JSON.stringify(players));
    } catch (e) {
      console.error("Failed to save players:", e);
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem('jda_coaches', JSON.stringify(coaches));
    } catch (e) {
      console.error("Failed to save coaches:", e);
    }
  }, [coaches]);

  useEffect(() => {
    try {
      localStorage.setItem('jda_team_logo', teamLogo);
    } catch (e) {
      console.error("Failed to save team logo:", e);
    }
  }, [teamLogo]);

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers(prev => [...prev, newPlayer]);
  };

  const handleUpdateCoaches = (updatedCoaches: Coach[]) => {
    setCoaches(updatedCoaches);
  };

  const handleLogin = (role: UserRole, credentials: string) => {
    if (role === UserRole.COACH) {
      // Credentials is the password entered
      const coach = coaches.find(c => c.password === credentials);
      
      if (coach) {
        setCurrentUser(coach);
        setUserRole(UserRole.COACH);
      } else {
        alert('Invalid Coach Password');
      }
    } else {
      try {
        const { playerId, accessCode } = JSON.parse(credentials);
        
        // Find player in the CURRENT state
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
    setCurrentUser(null);
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} teamLogo={teamLogo} />;
  }

  if (userRole === UserRole.COACH && currentUser) {
    return (
      <CoachDashboard 
        currentUser={currentUser}
        players={players} 
        coaches={coaches}
        onUpdatePlayer={handleUpdatePlayer} 
        onAddPlayer={handleAddPlayer}
        onUpdateCoaches={handleUpdateCoaches}
        onLogout={handleLogout}
        teamLogo={teamLogo}
        onUpdateTeamLogo={setTeamLogo}
      />
    );
  }

  const activePlayer = players.find(p => p.id === loggedInPlayerId);

  if (userRole === UserRole.PARENT && activePlayer) {
    return (
      <ParentDashboard 
        player={activePlayer} 
        coaches={coaches}
        onLogout={handleLogout} 
        teamLogo={teamLogo}
      />
    );
  }

  return <div>Error loading application state.</div>;
};

export default App;