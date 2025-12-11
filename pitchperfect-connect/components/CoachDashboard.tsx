import React, { useState, useEffect, useRef } from 'react';
import { Player, ReportCard, Stat, StatGroup, Coach, UserRole } from '../types';
import { generateCoachFeedback } from '../services/geminiService';
import { LogOut, Sparkles, User, Save, ChevronRight, Shield, Calendar, Brain, Activity, Zap, Footprints, Settings, Camera, Upload, Users, UserPlus, Lock, HardDrive, AlertTriangle } from 'lucide-react';

interface CoachDashboardProps {
  currentUser: Coach;
  onLogout: () => void;
  players: Player[];
  coaches: Coach[];
  onUpdatePlayer: (player: Player) => void;
  onAddPlayer: (player: Player) => void;
  onUpdateCoaches: (coaches: Coach[]) => void;
  teamLogo: string;
  onUpdateTeamLogo: (logo: string) => void;
}

const STAT_TEMPLATE = {
  Technical: ['Ball Mastery', '1v1 Attacking', '1v1 Defending', 'First Touch', 'Ball Striking', 'Passing Technique', 'Non-Dominant Foot'],
  Tactical: ['Scanning/Awareness', 'Movement off Ball', 'Pos. In Possession', 'Pos. Out Possession', 'Decision Making'],
  Physical: ['Speed/Acceleration', 'Agility & Balance', 'Strength', 'Endurance'],
  Psychological: ['Focus', 'Confidence', 'Coachability', 'Resilience', 'Teamwork', 'Encouraging Others']
};

interface DraftData {
  statValues: Record<string, number>;
  attendance: { score: number; commitment: number; note: string };
  ratings: { app: number; behav: number; note: string };
  coachNotes: string;
  season: string;
  quarter: string;
  generatedFeedback: any;
}

const CoachDashboard: React.FC<CoachDashboardProps> = ({ 
  currentUser, 
  onLogout, 
  players, 
  coaches,
  onUpdatePlayer, 
  onAddPlayer,
  onUpdateCoaches,
  teamLogo, 
  onUpdateTeamLogo 
}) => {
  const [view, setView] = useState<'roster' | 'settings'>('roster');
  const [settingsTab, setSettingsTab] = useState<'branding' | 'coaches' | 'players'>('branding');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DraftData>>({});
  
  // -- Form State --
  const [season, setSeason] = useState('2025/26');
  const [quarter, setQuarter] = useState('Term 2');
  
  const [statValues, setStatValues] = useState<Record<string, number>>({});
  const [attendance, setAttendance] = useState({ score: 9, commitment: 9, note: '' });
  const [ratings, setRatings] = useState({ app: 8, behav: 9, note: '' });
  const [coachNotes, setCoachNotes] = useState('');
  const [generatedFeedback, setGeneratedFeedback] = useState<any>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [openGroup, setOpenGroup] = useState<StatGroup | 'All'>('All');

  // -- New Coach Form State --
  const [newCoach, setNewCoach] = useState({ name: '', email: '', instagram: '', password: '', assignedTeams: '' });
  
  // -- New Player Form State --
  const [newPlayer, setNewPlayer] = useState({ name: '', team: '', position: '', jersey: '', accessCode: '' });

  // Refs
  const teamLogoInputRef = useRef<HTMLInputElement>(null);
  const playerPhotoInputRef = useRef<HTMLInputElement>(null);

  // Filter players based on coach assignments (Admin sees all)
  const myPlayers = currentUser.isAdmin 
    ? players 
    : players.filter(p => currentUser.assignedTeams.includes(p.ageGroup));

  // --- AUTO SAVE / DRAFT LOGIC ---
  useEffect(() => {
    if (!selectedPlayer) return;
    setDrafts(prev => ({
      ...prev,
      [selectedPlayer.id]: {
        statValues, attendance, ratings, coachNotes, season, quarter, generatedFeedback
      }
    }));
  }, [statValues, attendance, ratings, coachNotes, season, quarter, generatedFeedback, selectedPlayer]);

  useEffect(() => {
    if (selectedPlayer) {
      const draft = drafts[selectedPlayer.id];
      if (draft) {
        setStatValues(draft.statValues);
        setAttendance(draft.attendance);
        setRatings(draft.ratings);
        setCoachNotes(draft.coachNotes);
        setSeason(draft.season);
        setQuarter(draft.quarter);
        setGeneratedFeedback(draft.generatedFeedback);
      } else {
        const initialStats: Record<string, number> = {};
        Object.values(STAT_TEMPLATE).flat().forEach(s => initialStats[s] = 70);
        setStatValues(initialStats);
        setAttendance({ score: 9, commitment: 9, note: '' });
        setRatings({ app: 8, behav: 9, note: '' });
        setCoachNotes('');
        setGeneratedFeedback(null);
      }
    }
  }, [selectedPlayer?.id]);

  // --- HANDLERS ---
  const handleGenerateAI = async () => {
    if (!selectedPlayer) return;
    setIsGenerating(true);
    try {
      const statsStr = JSON.stringify(statValues);
      const resultJson = await generateCoachFeedback(selectedPlayer, statsStr, coachNotes);
      const parsed = JSON.parse(resultJson);
      setGeneratedFeedback(parsed);
    } catch (e) {
      alert("Error generating feedback. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveReport = () => {
    if (!selectedPlayer || !generatedFeedback) return;
    
    const statsArray: Stat[] = [];
    (Object.keys(STAT_TEMPLATE) as StatGroup[]).forEach(group => {
      STAT_TEMPLATE[group].forEach(name => {
        statsArray.push({ name, group, value: statValues[name] || 0, fullMark: 100 });
      });
    });

    const overallRating = Math.round(statsArray.reduce((acc, curr) => acc + curr.value, 0) / statsArray.length);

    const newReport: ReportCard = {
      id: `rc-${Date.now()}`,
      season, quarter, date: new Date().toISOString(), overallRating,
      stats: statsArray,
      attendance: { attendanceScore: attendance.score, commitmentScore: attendance.commitment, note: attendance.note },
      ratingsSummary: { applicationScore: ratings.app, behaviourScore: ratings.behav, coachComment: ratings.note },
      finalSummary: generatedFeedback.summary,
      strengths: generatedFeedback.strengths,
      improvements: { keyArea: generatedFeedback.improvements.keyArea, buildOnArea: generatedFeedback.improvements.buildOnArea }
    };

    const updatedPlayer = { ...selectedPlayer, reportCards: [newReport, ...selectedPlayer.reportCards] };
    onUpdatePlayer(updatedPlayer);
    
    const newDrafts = { ...drafts };
    delete newDrafts[selectedPlayer.id];
    setDrafts(newDrafts);
    setGeneratedFeedback(null);
    setCoachNotes('');
    alert("Report Card Published Successfully!");
  };

  const handleAddCoach = (e: React.FormEvent) => {
    e.preventDefault();
    const teams = newCoach.assignedTeams.split(',').map(t => t.trim()).filter(t => t !== '');
    const coach: Coach = {
      id: `coach_${Date.now()}`,
      name: newCoach.name,
      email: newCoach.email,
      instagramHandle: newCoach.instagram,
      password: newCoach.password,
      assignedTeams: teams,
      isAdmin: false,
      role: UserRole.COACH,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newCoach.name}`
    };
    onUpdateCoaches([...coaches, coach]);
    setNewCoach({ name: '', email: '', instagram: '', password: '', assignedTeams: '' });
    alert('Coach Added Successfully');
  };

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const player: Player = {
      id: `p_${Date.now()}`,
      name: newPlayer.name,
      ageGroup: newPlayer.team,
      position: newPlayer.position,
      jerseyNumber: parseInt(newPlayer.jersey) || 0,
      accessCode: newPlayer.accessCode,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newPlayer.name}`,
      reportCards: []
    };
    onAddPlayer(player);
    setNewPlayer({ name: '', team: '', position: '', jersey: '', accessCode: '' });
    alert('Player Added Successfully');
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'team' | 'player') => {
    const file = e.target.files?.[0];
    if (file) {
       // Helper function to resize image
       const processImage = (fileToProcess: File): Promise<string> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = URL.createObjectURL(fileToProcess);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            // Max dimension 350px is sufficient for UI (displayed at ~128px) and keeps size low
            const MAX_DIM = 350; 
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_DIM) {
                height *= MAX_DIM / width;
                width = MAX_DIM;
              }
            } else {
              if (height > MAX_DIM) {
                width *= MAX_DIM / height;
                height = MAX_DIM;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            // Logic: Force JPEG for players to guarantee small size (photos). 
            // Allow PNG for Team Logo to preserve transparency.
            let mimeType = 'image/jpeg';
            let quality = 0.7;

            if (type === 'team' && fileToProcess.type === 'image/png') {
                mimeType = 'image/png';
                quality = 0.8; 
            }

            const dataUrl = canvas.toDataURL(mimeType, quality);
            URL.revokeObjectURL(img.src);
            resolve(dataUrl);
          };
        });
      };

      processImage(file).then(result => {
         if (type === 'team') {
          onUpdateTeamLogo(result);
        } else if (type === 'player' && selectedPlayer) {
          onUpdatePlayer({ ...selectedPlayer, imageUrl: result });
          setSelectedPlayer(prev => prev ? { ...prev, imageUrl: result } : null);
        }
      }).catch(err => {
        console.error("Error processing image", err);
        alert("Failed to process image. Please try another file.");
      });
    }
  };

  const getGroupIcon = (group: StatGroup) => {
     switch (group) {
      case 'Technical': return <Footprints size={18} />;
      case 'Tactical': return <Brain size={18} />;
      case 'Physical': return <Zap size={18} />;
      case 'Psychological': return <Activity size={18} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <nav className="bg-black text-white sticky top-0 z-10 shadow-lg border-b-4 border-teal-500">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="font-black text-xl italic tracking-tighter flex items-center gap-2">
               <Shield className="text-teal-500" />
               JDA ACADEMY <span className="text-teal-500 font-normal not-italic text-sm tracking-widest ml-1 hidden sm:inline">COACH HUB</span>
            </div>
            <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
                <button 
                    onClick={() => setView('roster')} 
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'roster' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Report Cards
                </button>
                <button 
                    onClick={() => setView('settings')} 
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${view === 'settings' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <Settings size={14} /> Settings
                </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                 <HardDrive size={12} className="text-yellow-500" />
                 <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">Device Storage Only</span>
             </div>
             <span className="text-xs font-bold text-gray-500 hidden md:block">Hi, {currentUser.name}</span>
             <button onClick={onLogout} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase transition-colors">
               <LogOut size={18} /> Sign Out
             </button>
          </div>
        </div>
      </nav>

      {/* Warning Banner for Mobile/All users to ensure they understand sync limitations */}
      <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-2 flex items-center justify-center gap-2 text-center">
        <AlertTriangle size={14} className="text-yellow-600" />
        <p className="text-xs font-bold text-yellow-800">
          Offline Mode: Changes saved to this device only. To sync across devices, a Cloud Database connection is required.
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full p-4 lg:p-6 gap-6">
        
        {/* --- SETTINGS VIEW --- */}
        {view === 'settings' && (
            <div className="w-full max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                    {/* Settings Sidebar */}
                    <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4">
                        <div className="space-y-2">
                            <button onClick={() => setSettingsTab('branding')} className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-3 ${settingsTab === 'branding' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <Camera size={18} /> Branding
                            </button>
                            {currentUser.isAdmin && (
                              <button onClick={() => setSettingsTab('coaches')} className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-3 ${settingsTab === 'coaches' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                                  <Users size={18} /> Manage Staff
                              </button>
                            )}
                             <button onClick={() => setSettingsTab('players')} className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-3 ${settingsTab === 'players' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <UserPlus size={18} /> Manage Players
                            </button>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        
                        {/* BRANDING */}
                        {settingsTab === 'branding' && (
                            <div>
                                <h2 className="text-2xl font-black text-black mb-6 pb-4 border-b border-gray-100">Branding Settings</h2>
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">Team Badge / Logo</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center relative overflow-hidden group">
                                            {teamLogo ? (
                                                <img src={teamLogo} alt="Team Logo" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <Upload className="text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <input type="file" ref={teamLogoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'team')} />
                                            <button onClick={() => teamLogoInputRef.current?.click()} className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-zinc-800 transition-colors flex items-center gap-2">
                                                <Upload size={16} /> Upload New Logo
                                            </button>
                                            <p className="text-xs text-gray-400 mt-2">Recommended: PNG with transparent background.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MANAGE COACHES (ADMIN ONLY) */}
                        {settingsTab === 'coaches' && currentUser.isAdmin && (
                            <div>
                                <h2 className="text-2xl font-black text-black mb-6 pb-4 border-b border-gray-100">Manage Coaching Staff</h2>
                                
                                <form onSubmit={handleAddCoach} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                    <h3 className="font-bold text-lg mb-4">Add New Coach</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input required placeholder="Coach Name" className="border rounded-lg p-3 text-sm" value={newCoach.name} onChange={e => setNewCoach({...newCoach, name: e.target.value})} />
                                        <input required placeholder="Email Address" className="border rounded-lg p-3 text-sm" value={newCoach.email} onChange={e => setNewCoach({...newCoach, email: e.target.value})} />
                                        <input required placeholder="Login Password" type="text" className="border rounded-lg p-3 text-sm" value={newCoach.password} onChange={e => setNewCoach({...newCoach, password: e.target.value})} />
                                        <input placeholder="Instagram Handle (Optional)" className="border rounded-lg p-3 text-sm" value={newCoach.instagram} onChange={e => setNewCoach({...newCoach, instagram: e.target.value})} />
                                    </div>
                                    <div className="mb-4">
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned Teams (Comma separated)</label>
                                      <input required placeholder="e.g. U-8 Teals, U-10 Reds" className="w-full border rounded-lg p-3 text-sm" value={newCoach.assignedTeams} onChange={e => setNewCoach({...newCoach, assignedTeams: e.target.value})} />
                                    </div>
                                    <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-teal-700">Add Coach</button>
                                </form>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-500 uppercase text-xs">Existing Staff</h3>
                                    {coaches.map(c => (
                                        <div key={c.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">{c.name[0]}</div>
                                                <div>
                                                    <p className="font-bold text-sm">{c.name} {c.isAdmin && <span className="text-xs bg-black text-white px-2 py-0.5 rounded ml-2">ADMIN</span>}</p>
                                                    <p className="text-xs text-gray-500">{c.assignedTeams.join(', ') || 'No specific teams'}</p>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">PW: {c.password}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* MANAGE PLAYERS */}
                        {settingsTab === 'players' && (
                            <div>
                                <h2 className="text-2xl font-black text-black mb-6 pb-4 border-b border-gray-100">Manage Players</h2>
                                
                                <form onSubmit={handleAddPlayerSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                    <h3 className="font-bold text-lg mb-4">Register New Player</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input required placeholder="Player Name" className="border rounded-lg p-3 text-sm" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} />
                                        <input required placeholder="Team / Age Group (e.g. U-8 Teals)" className="border rounded-lg p-3 text-sm" value={newPlayer.team} onChange={e => setNewPlayer({...newPlayer, team: e.target.value})} />
                                        <input required placeholder="Position" className="border rounded-lg p-3 text-sm" value={newPlayer.position} onChange={e => setNewPlayer({...newPlayer, position: e.target.value})} />
                                        <input required placeholder="Jersey Number" type="number" className="border rounded-lg p-3 text-sm" value={newPlayer.jersey} onChange={e => setNewPlayer({...newPlayer, jersey: e.target.value})} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Access Code</label>
                                        <input required placeholder="e.g. 1234" className="w-full border rounded-lg p-3 text-sm" value={newPlayer.accessCode} onChange={e => setNewPlayer({...newPlayer, accessCode: e.target.value})} />
                                    </div>
                                    <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-teal-700">Add Player</button>
                                </form>

                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                                    <p className="text-xs text-blue-800">
                                      <strong>Note:</strong> Players are assigned to coaches based on their Team/Age Group matching the coach's assigned teams.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- ROSTER/EDITOR VIEW --- */}
        {view === 'roster' && (
          <>
            {/* Sidebar */}
            <div className="w-1/4 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col hidden lg:flex">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="font-black text-black uppercase tracking-wide text-sm">Team Roster</h2>
                <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full font-bold">{myPlayers.length}</span>
              </div>
              <ul className="overflow-y-auto flex-1">
                {myPlayers.length === 0 && (
                   <div className="p-8 text-center text-gray-400 text-sm">
                      No players found. <br/> Check your assigned teams or add players in Settings.
                   </div>
                )}
                {myPlayers.map(p => {
                  const hasDraft = drafts[p.id] !== undefined;
                  return (
                    <li 
                      key={p.id} 
                      onClick={() => setSelectedPlayer(p)}
                      className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-teal-50 transition-colors border-b border-gray-50 group ${selectedPlayer?.id === p.id ? 'bg-black text-white' : ''}`}
                    >
                      <img src={p.imageUrl} alt={p.name} className={`w-10 h-10 rounded-full object-cover border-2 ${selectedPlayer?.id === p.id ? 'border-teal-500' : 'border-gray-200'}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <p className={`font-bold text-sm ${selectedPlayer?.id === p.id ? 'text-white' : 'text-gray-800'}`}>{p.name}</p>
                            {hasDraft && selectedPlayer?.id !== p.id && <div className="w-2 h-2 rounded-full bg-teal-500"></div>}
                        </div>
                        <p className={`text-xs ${selectedPlayer?.id === p.id ? 'text-gray-400' : 'text-gray-500'}`}>#{p.jerseyNumber} • {p.ageGroup}</p>
                      </div>
                      <ChevronRight className={`ml-auto w-4 h-4 ${selectedPlayer?.id === p.id ? 'text-teal-500' : 'text-gray-300 opacity-0 group-hover:opacity-100'}`} />
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Main Editor */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-y-auto p-4 md:p-8 relative">
              {!selectedPlayer ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="bg-gray-100 p-6 rounded-full">
                    <User size={64} className="opacity-20 text-black" />
                  </div>
                  <p className="font-medium">Select a player to create a report card</p>
                </div>
              ) : (
                <div className="space-y-8 max-w-3xl mx-auto pb-10">
                  {/* Header & Player Image Upload */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-gray-100 pb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <img src={selectedPlayer.imageUrl} className="w-16 h-16 rounded-full border-2 border-black object-cover" alt=""/>
                            <div 
                                onClick={() => playerPhotoInputRef.current?.click()}
                                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Camera className="text-white w-6 h-6" />
                            </div>
                            <input 
                                type="file" 
                                ref={playerPhotoInputRef}
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'player')} 
                            />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-black tracking-tight">{selectedPlayer.name}</h2>
                            <p className="text-teal-600 font-bold text-xs uppercase tracking-wider">New Report Card Entry</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                      <select value={season} onChange={e => setSeason(e.target.value)} className="border-2 border-gray-200 rounded-lg p-2 text-sm bg-white font-bold focus:border-teal-500 outline-none">
                        <option value="2025/26">Season 25/26</option>
                        <option value="2024/25">Season 24/25</option>
                      </select>
                      <select value={quarter} onChange={e => setQuarter(e.target.value)} className="border-2 border-gray-200 rounded-lg p-2 text-sm bg-white font-bold focus:border-teal-500 outline-none">
                        <option value="Term 1">Term 1</option>
                        <option value="Term 2">Term 2</option>
                        <option value="Term 3">Term 3</option>
                        <option value="Term 4">Term 4</option>
                      </select>
                    </div>
                  </div>

                  {/* 2. Attendance Section */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Calendar size={14} /> 2. Attendance & Commitment
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                              <label className="text-xs font-bold text-gray-600 block mb-1">Attendance Score (0-10)</label>
                              <input type="number" min="0" max="10" value={attendance.score} onChange={e => setAttendance({...attendance, score: parseInt(e.target.value)})} className="w-full border rounded p-2 text-sm" />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-600 block mb-1">Commitment (0-10)</label>
                              <input type="number" min="0" max="10" value={attendance.commitment} onChange={e => setAttendance({...attendance, commitment: parseInt(e.target.value)})} className="w-full border rounded p-2 text-sm" />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">Coach Note</label>
                          <input type="text" value={attendance.note} onChange={e => setAttendance({...attendance, note: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="e.g. Excellent attendance record." />
                      </div>
                  </div>

                  {/* 3-6. Stats Input */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">3-6. Skill Evaluation</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {(Object.entries(STAT_TEMPLATE) as [StatGroup, string[]][]).map(([group, metrics]) => (
                        <div key={group} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transition-colors">
                          <div 
                            className="flex items-center justify-between mb-4 cursor-pointer"
                            onClick={() => setOpenGroup(openGroup === group ? 'All' : group)}
                          >
                            <h4 className={`font-black uppercase tracking-wide text-sm flex items-center gap-2 ${
                              group === 'Technical' ? 'text-blue-900' :
                              group === 'Tactical' ? 'text-purple-900' :
                              group === 'Physical' ? 'text-amber-900' : 'text-teal-900'
                            }`}>
                                {getGroupIcon(group)} {group}
                            </h4>
                          </div>
                          
                          <div className="space-y-4">
                            {metrics.map(metric => (
                              <div key={metric}>
                                <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                                  <span>{metric}</span>
                                  <span className="font-mono bg-black text-white px-2 py-0.5 rounded text-[10px]">{statValues[metric] || 70}</span>
                                </div>
                                <input 
                                  type="range"
                                  min="0" max="100"
                                  value={statValues[metric] || 70}
                                  onChange={(e) => setStatValues({...statValues, [metric]: parseInt(e.target.value)})}
                                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-100 ${
                                    group === 'Technical' ? 'accent-blue-600' :
                                    group === 'Tactical' ? 'accent-purple-600' :
                                    group === 'Physical' ? 'accent-amber-600' : 'accent-teal-600'
                                  }`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 9. Ratings Summary Input */}
                  <div className="bg-zinc-900 text-white rounded-xl p-5 border border-zinc-800">
                      <h3 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-4">9. Ratings Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                              <label className="text-xs font-bold text-gray-400 block mb-1">Application & Understanding (0-10)</label>
                              <input type="number" min="0" max="10" value={ratings.app} onChange={e => setRatings({...ratings, app: parseInt(e.target.value)})} className="w-full bg-zinc-800 border-zinc-700 rounded p-2 text-sm text-white" />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-400 block mb-1">Behaviour & Attitude (0-10)</label>
                              <input type="number" min="0" max="10" value={ratings.behav} onChange={e => setRatings({...ratings, behav: parseInt(e.target.value)})} className="w-full bg-zinc-800 border-zinc-700 rounded p-2 text-sm text-white" />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">Coach Comment</label>
                          <input type="text" value={ratings.note} onChange={e => setRatings({...ratings, note: e.target.value})} className="w-full bg-zinc-800 border-zinc-700 rounded p-2 text-sm text-white" placeholder="Short comment on behaviour..." />
                      </div>
                  </div>

                  {/* Notes Input */}
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">10. AI Draft Notes</h3>
                    <p className="text-xs text-gray-500 mb-2">Jot down rough notes here. The AI will generate the "Strengths", "Improvements", and "Final Summary" based on the stats above and these notes.</p>
                    <textarea 
                      rows={4}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm focus:border-teal-500 focus:ring-0 outline-none font-medium text-gray-800 transition-all placeholder-gray-300"
                      placeholder="e.g. Needs to communicate more. Excellent finishing this quarter."
                      value={coachNotes}
                      onChange={(e) => setCoachNotes(e.target.value)}
                    />
                  </div>

                  {/* AI Generation Action */}
                  <div className="flex gap-4 items-center pt-2">
                    <button 
                      onClick={handleGenerateAI}
                      disabled={isGenerating || !coachNotes}
                      className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl shadow-lg hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm border border-transparent hover:border-teal-500"
                    >
                      {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Sparkles size={16} className="text-teal-400" />
                      )}
                      Generate Report Content
                    </button>
                  </div>

                  {/* Preview & Save */}
                  {generatedFeedback && (
                    <div className="bg-teal-50 rounded-2xl p-6 border-l-4 border-teal-500 animate-in fade-in slide-in-from-bottom-4 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-teal-800 uppercase tracking-widest">Preview</h3>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                        <p className="text-sm text-gray-800 leading-relaxed font-medium">"{generatedFeedback.summary}"</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-teal-600 mb-1 block">Key Improvement</span>
                            <p className="text-xs font-bold">{generatedFeedback.improvements.keyArea}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-600 mb-1 block">Build On</span>
                            <p className="text-xs font-bold">{generatedFeedback.improvements.buildOnArea}</p>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={handleSaveReport}
                        className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-teal-700 transition-all hover:scale-[1.01]"
                      >
                        <Save size={18} />
                        Publish Report
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CoachDashboard;