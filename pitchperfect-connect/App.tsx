import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ParentDashboard from './components/ParentDashboard';
import CoachDashboard from './components/CoachDashboard';
import { UserRole, Player, Coach } from './types';
import { storage } from './services/storage';
import { MOCK_PLAYERS, MOCK_COACHES } from './constants';
import { Loader2, Wifi } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [teamLogo, setTeamLogo] = useState<string>("");

  const [currentUser, setCurrentUser] = useState<Coach | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loggedInPlayerId, setLoggedInPlayerId] = useState<string | null>(null);

  // Helper to fetch all data
  const fetchData = async () => {
    // We attempt to fetch from Supabase. 
    // If keys are missing/invalid, storage service returns [] and we fall back to MOCK data.
    const [fetchedPlayers, fetchedCoaches, fetchedLogo] = await Promise.all([
      storage.fetchPlayers(),
      storage.fetchCoaches(),
      storage.fetchTeamLogo()
    ]);

    setPlayers(fetchedPlayers.length > 0 ? fetchedPlayers : MOCK_PLAYERS);
    setCoaches(fetchedCoaches.length > 0 ? fetchedCoaches : MOCK_COACHES);
    setTeamLogo(fetchedLogo);
  };

  // Initial Data Load & Real-time Subscription
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // 1. Load initial data
      await fetchData();
      setLoading(false);

      // 2. Subscribe to Real-time Changes
      // This will only work if the API keys are valid. If not, it just won't receive updates.
      const unsubscribe = storage.subscribeToUpdates(() => {
        console.log("Remote change detected, refreshing data...");
        fetchData();
      });

      return () => {
        unsubscribe();
      };
    };

    init();
  }, []);

  // --- Actions ---

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    // Optimistic Update (Update UI immediately)
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    storage.savePlayer(updatedPlayer);
  };

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers(prev => [...prev, newPlayer]);
    storage.savePlayer(newPlayer);
  };

  const handleUpdateCoaches = (updatedCoaches: Coach[]) => {
    setCoaches(updatedCoaches);
    updatedCoaches.forEach(c => storage.saveCoach(c));
  };

  const handleUpdateTeamLogo = (newUrl: string) => {
    setTeamLogo(newUrl);
    storage.saveTeamLogo(newUrl);
  };

  const handleLogin = (role: UserRole, credentials: string) => {
    if (role === UserRole.COACH) {
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

  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white gap-6">
        <Loader2 className="animate-spin text-teal-500" size={48} />
        <p className="text-sm font-bold tracking-widest uppercase text-gray-500 flex items-center gap-2">
          <Wifi size={16} /> Connecting to Cloud...
        </p>
      </div>
    );
  }

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
        onUpdateTeamLogo={handleUpdateTeamLogo}
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