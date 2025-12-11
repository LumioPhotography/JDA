import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ParentDashboard from './components/ParentDashboard';
import CoachDashboard from './components/CoachDashboard';
import { UserRole, Player, Coach, Team } from './types';
import { storage } from './services/storage';
import { MOCK_PLAYERS, MOCK_COACHES, MOCK_TEAMS } from './constants';
import { Loader2, Wifi } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamLogo, setTeamLogo] = useState<string>("");

  const [currentUser, setCurrentUser] = useState<Coach | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loggedInPlayerId, setLoggedInPlayerId] = useState<string | null>(null);

  // Debugging Version
  useEffect(() => {
    console.log("JDA App Version 2.2 Loaded");
  }, []);

  const fetchData = async () => {
    try {
      const [fetchedPlayers, fetchedCoaches, fetchedTeams, fetchedLogo] = await Promise.all([
        storage.fetchPlayers(),
        storage.fetchCoaches(),
        storage.fetchTeams(),
        storage.fetchTeamLogo()
      ]);

      // Sanitization: Handle legacy data (0-100 stats -> 1-5 stats) and missing fields
      const sanitizedPlayers = (fetchedPlayers.length > 0 ? fetchedPlayers : MOCK_PLAYERS).map(p => {
          return {
              ...p,
              // Default legacy players to ACADEMY if undefined
              branch: p.branch || 'ACADEMY',
              // Default legacy players to Unassigned team if undefined
              teamId: p.teamId || (p.branch === 'COACHING' ? undefined : 'Unassigned'),
              reportCards: p.reportCards?.map(rc => ({
                  ...rc,
                  // Convert old stats if they are > 5 (legacy data was 0-100)
                  stats: rc.stats.map(s => ({
                      ...s,
                      value: s.value > 5 ? Math.round(s.value / 20) : s.value,
                      fullMark: 5
                  })),
                  overallRating: rc.overallRating > 5 ? parseFloat((rc.overallRating / 20).toFixed(1)) : rc.overallRating,
                  attendance: {
                      ...rc.attendance,
                      attendanceScore: rc.attendance.attendanceScore > 5 ? Math.round(rc.attendance.attendanceScore / 2) : rc.attendance.attendanceScore, // Legacy was 0-10
                      commitmentScore: rc.attendance.commitmentScore > 5 ? Math.round(rc.attendance.commitmentScore / 2) : rc.attendance.commitmentScore
                  },
                  ratingsSummary: {
                      ...rc.ratingsSummary,
                      applicationScore: rc.ratingsSummary.applicationScore > 5 ? Math.round(rc.ratingsSummary.applicationScore / 2) : rc.ratingsSummary.applicationScore,
                      behaviourScore: rc.ratingsSummary.behaviourScore > 5 ? Math.round(rc.ratingsSummary.behaviourScore / 2) : rc.ratingsSummary.behaviourScore,
                  },
                  // FIX: Ensure targets array exists to prevent build error
                  targets: rc.targets || [],
                  strengths: rc.strengths || [],
                  coachFooterNote: rc.coachFooterNote || ""
              })) || []
          } as Player;
      });

      setPlayers(sanitizedPlayers);
      setCoaches(fetchedCoaches.length > 0 ? fetchedCoaches : MOCK_COACHES);
      setTeams(fetchedTeams.length > 0 ? fetchedTeams : MOCK_TEAMS);
      setTeamLogo(fetchedLogo);
    } catch (error) {
      console.error("Critical error fetching data:", error);
      // Fallback to mocks if everything fails
      setPlayers(MOCK_PLAYERS);
      setCoaches(MOCK_COACHES);
      setTeams(MOCK_TEAMS);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
      const unsubscribe = storage.subscribeToUpdates(() => {
        console.log("Remote change detected, refreshing data...");
        fetchData();
      });
      return () => unsubscribe();
    };
    init();
  }, []);

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    storage.savePlayer(updatedPlayer);
  };

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers(prev => [...prev, newPlayer]);
    storage.savePlayer(newPlayer);
  };

  const handleDeletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    storage.deletePlayer(id);
  }

  const handleUpdateCoaches = (updatedCoaches: Coach[]) => {
    setCoaches(updatedCoaches);
    updatedCoaches.forEach(c => storage.saveCoach(c));
  };

  const handleAddTeam = (newTeam: Team) => {
    setTeams(prev => [...prev, newTeam]);
    storage.saveTeam(newTeam);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white gap-6">
        <Loader2 className="animate-spin text-teal-500" size={48} />
        <p className="text-xs font-bold text-teal-500/50 uppercase tracking-widest">Loading JDA Portal...</p>
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
        teams={teams}
        onUpdatePlayer={handleUpdatePlayer} 
        onAddPlayer={handleAddPlayer}
        onDeletePlayer={handleDeletePlayer}
        onUpdateCoaches={handleUpdateCoaches}
        onAddTeam={handleAddTeam}
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