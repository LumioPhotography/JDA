
import React, { useState, useEffect, useRef } from 'react';
import { Player, ReportCard, Stat, StatGroup, Coach, UserRole, Team, Branch, Target } from '../types';
import { generateCoachFeedback } from '../services/geminiService';
import { LogOut, Sparkles, User, Save, ChevronRight, Shield, Calendar, Brain, Activity, Zap, Footprints, Settings, Camera, Upload, Users, UserPlus, Lock, Cloud, Trash2, Edit2, Plus, Target as TargetIcon, Menu, X, Check, Copy } from 'lucide-react';

interface CoachDashboardProps {
  currentUser: Coach;
  onLogout: () => void;
  players: Player[];
  coaches: Coach[];
  teams: Team[];
  onUpdatePlayer: (player: Player) => void;
  onAddPlayer: (player: Player) => void;
  onDeletePlayer: (id: string) => void;
  onUpdateCoaches: (coaches: Coach[]) => void;
  onAddTeam: (team: Team) => void;
  onAddTeams: (teams: Team[]) => void;
  onDeleteTeam: (teamId: string) => void;
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
  targets: Target[];
  coachFooterNote: string;
  manualStrengths: string[];
  authorCoachId?: string;
}

// --- TACTICAL POSITIONS CONFIGURATION ---
const TACTICAL_POSITIONS = [
  { value: 'GK', label: 'Goalkeeper (GK)', coords: { top: '88%', left: '48%' } },
  { value: 'LB', label: 'Left Back (LB)', coords: { top: '75%', left: '15%' } },
  { value: 'CB-L', label: 'Centre Back L (CB)', coords: { top: '78%', left: '35%' } },
  { value: 'CB-R', label: 'Centre Back R (CB)', coords: { top: '78%', left: '61%' } },
  { value: 'RB', label: 'Right Back (RB)', coords: { top: '75%', left: '81%' } },
  { value: 'LWB', label: 'Left Wing Back (LWB)', coords: { top: '60%', left: '10%' } },
  { value: 'RWB', label: 'Right Wing Back (RWB)', coords: { top: '60%', left: '86%' } },
  { value: 'CDM', label: 'Defensive Mid (CDM)', coords: { top: '60%', left: '48%' } },
  { value: 'CM-L', label: 'Centre Mid L (CM)', coords: { top: '45%', left: '35%' } },
  { value: 'CM-R', label: 'Centre Mid R (CM)', coords: { top: '45%', left: '61%' } },
  { value: 'CAM', label: 'Attacking Mid (CAM)', coords: { top: '30%', left: '48%' } },
  { value: 'LM', label: 'Left Mid (LM)', coords: { top: '45%', left: '15%' } },
  { value: 'RM', label: 'Right Mid (RM)', coords: { top: '45%', left: '81%' } },
  { value: 'LW', label: 'Left Wing (LW)', coords: { top: '20%', left: '15%' } },
  { value: 'RW', label: 'Right Wing (RW)', coords: { top: '20%', left: '81%' } },
  { value: 'ST', label: 'Striker (ST)', coords: { top: '12%', left: '48%' } },
  { value: 'SUB', label: 'Substitute / Bench', coords: { top: '0', left: '0' } }, // Special handling
];

const getPositionCoords = (posValue?: string) => {
    if (!posValue) return null;
    
    // 1. Try Exact Match (Case Insensitive)
    const exactMatch = TACTICAL_POSITIONS.find(p => p.value.toLowerCase() === posValue.toLowerCase());
    if (exactMatch) return exactMatch.coords;
    
    // 2. Fuzzy Match for legacy text positions
    const p = posValue.toLowerCase().trim();
    
    // Goalkeepers
    if (p.includes('goal') || p.includes('gk') || p.includes('keeper')) return TACTICAL_POSITIONS.find(t => t.value === 'GK')?.coords;
    
    // Defenders
    if (p.includes('left back') || p.includes('lb')) return TACTICAL_POSITIONS.find(t => t.value === 'LB')?.coords;
    if (p.includes('right back') || p.includes('rb')) return TACTICAL_POSITIONS.find(t => t.value === 'RB')?.coords;
    if (p.includes('centre') || p.includes('center') || p.includes('cb') || p.includes('def')) return TACTICAL_POSITIONS.find(t => t.value === 'CB-L')?.coords;
    if (p.includes('wing back') || p.includes('wb')) return TACTICAL_POSITIONS.find(t => t.value === 'LWB')?.coords; 
    
    // Midfielders
    if (p.includes('defensive') || p.includes('cdm') || p.includes('dm')) return TACTICAL_POSITIONS.find(t => t.value === 'CDM')?.coords;
    if (p.includes('attacking') || p.includes('cam') || p.includes('am')) return TACTICAL_POSITIONS.find(t => t.value === 'CAM')?.coords;
    if (p.includes('mid') || p.includes('cm')) return TACTICAL_POSITIONS.find(t => t.value === 'CM-L')?.coords;
    
    // Attackers
    if (p.includes('left wing') || p.includes('lw')) return TACTICAL_POSITIONS.find(t => t.value === 'LW')?.coords;
    if (p.includes('right wing') || p.includes('rw')) return TACTICAL_POSITIONS.find(t => t.value === 'RW')?.coords;
    if (p.includes('wing')) return TACTICAL_POSITIONS.find(t => t.value === 'LW')?.coords; // Default to Left Wing if just 'wing'
    if (p.includes('striker') || p.includes('for') || p.includes('st') || p.includes('att')) return TACTICAL_POSITIONS.find(t => t.value === 'ST')?.coords;
    
    return null; // Is Bench
};

const CoachDashboard: React.FC<CoachDashboardProps> = ({ 
  currentUser, 
  onLogout, 
  players, 
  coaches,
  teams,
  onUpdatePlayer, 
  onAddPlayer,
  onDeletePlayer,
  onUpdateCoaches,
  onAddTeam,
  onAddTeams,
  onDeleteTeam,
  teamLogo, 
  onUpdateTeamLogo 
}) => {
  const [view, setView] = useState<'roster' | 'settings' | 'home' | 'team_view'>('home');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<'branding' | 'coaches' | 'teams' | 'players'>('branding');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DraftData>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false); // Mobile roster toggle
  
  // -- Form State --
  const [season, setSeason] = useState('2025/26');
  const [quarter, setQuarter] = useState('Winter Term');
  const [authorCoachId, setAuthorCoachId] = useState(currentUser.id);
  
  const [statValues, setStatValues] = useState<Record<string, number>>({});
  const [attendance, setAttendance] = useState({ score: 4, commitment: 4, note: '' });
  const [ratings, setRatings] = useState({ app: 4, behav: 4, note: '' });
  const [coachNotes, setCoachNotes] = useState('');
  const [targets, setTargets] = useState<Target[]>([]);
  const [newTargetText, setNewTargetText] = useState('');
  const [coachFooterNote, setCoachFooterNote] = useState('');
  
  // Strengths
  const [manualStrengths, setManualStrengths] = useState<string[]>([]);
  const [newStrength, setNewStrength] = useState('');
  
  const [generatedFeedback, setGeneratedFeedback] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openGroup, setOpenGroup] = useState<StatGroup | 'All'>('All');

  // -- New Entity Forms --
  const [newCoach, setNewCoach] = useState({ name: '', email: '', instagram: '', password: '', assignedTeams: '', isAdmin: false });
  const [newPlayer, setNewPlayer] = useState({ name: '', branch: 'ACADEMY' as Branch, teamId: '', position: 'SUB', jersey: '', accessCode: '' });
  const [newTeamName, setNewTeamName] = useState('');
  
  // -- Bulk Team Creator --
  const [bulkAges, setBulkAges] = useState('');
  const [bulkSuffixes, setBulkSuffixes] = useState('');
  const [bulkPreview, setBulkPreview] = useState<string[]>([]);
  
  // -- Secondary Logos --
  const [secondaryLogos, setSecondaryLogos] = useState<string[]>([]); // In a real app this would load from settings
  const secondaryLogoRef = useRef<HTMLInputElement>(null);

  // -- Edit State --
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [isEditingPlayerDetails, setIsEditingPlayerDetails] = useState(false);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerTeam, setEditPlayerTeam] = useState('');
  const [editPlayerPosition, setEditPlayerPosition] = useState('');

  // Refs
  const teamLogoInputRef = useRef<HTMLInputElement>(null);
  const playerPhotoInputRef = useRef<HTMLInputElement>(null);

  // Filter logic
  const myPlayers = currentUser.isAdmin 
    ? players 
    : players.filter(p => p.branch === 'ACADEMY' && currentUser.assignedTeams.includes(p.teamId || ''));

  // --- AUTO SAVE / DRAFT LOGIC ---
  useEffect(() => {
    if (!selectedPlayer) return;
    setDrafts(prev => ({
      ...prev,
      [selectedPlayer.id]: {
        statValues, attendance, ratings, coachNotes, season, quarter, generatedFeedback, targets, coachFooterNote, manualStrengths, authorCoachId
      }
    }));
  }, [statValues, attendance, ratings, coachNotes, season, quarter, generatedFeedback, targets, coachFooterNote, manualStrengths, authorCoachId, selectedPlayer]);

  useEffect(() => {
    if (selectedPlayer) {
      // setView('roster'); // Don't force view switch if already there
      const draft = drafts[selectedPlayer.id];
      if (draft) {
        setStatValues(draft.statValues);
        setAttendance(draft.attendance);
        setRatings(draft.ratings);
        setCoachNotes(draft.coachNotes);
        setSeason(draft.season);
        setQuarter(draft.quarter);
        setGeneratedFeedback(draft.generatedFeedback);
        setTargets(draft.targets);
        setCoachFooterNote(draft.coachFooterNote || '');
        setManualStrengths(draft.manualStrengths || []);
        setAuthorCoachId(draft.authorCoachId || currentUser.id);
      } else {
        const initialStats: Record<string, number> = {};
        Object.values(STAT_TEMPLATE).flat().forEach(s => initialStats[s] = 3); // Default 3 (average)
        setStatValues(initialStats);
        setAttendance({ score: 4, commitment: 4, note: '' });
        setRatings({ app: 4, behav: 4, note: '' });
        setCoachNotes('');
        setGeneratedFeedback(null);
        setTargets([]);
        setCoachFooterNote('');
        setManualStrengths([]);
        setAuthorCoachId(currentUser.id);
      }
      // Reset edit state
      setIsEditingPlayerDetails(false);
      setEditPlayerName(selectedPlayer.name);
      setEditPlayerTeam(selectedPlayer.teamId || '');
      setEditPlayerPosition(selectedPlayer.position);
    }
  }, [selectedPlayer?.id]);

  // Bulk Creator Effect
  useEffect(() => {
    if (!bulkAges && !bulkSuffixes) {
        setBulkPreview([]);
        return;
    }
    const ages = bulkAges.split(',').map(s => s.trim()).filter(Boolean);
    const suffixes = bulkSuffixes.split(',').map(s => s.trim()).filter(Boolean);
    
    const generated: string[] = [];
    if (ages.length > 0 && suffixes.length > 0) {
        ages.forEach(age => {
            suffixes.forEach(suffix => {
                generated.push(`${age} ${suffix}`);
            });
        });
    } else if (ages.length > 0) {
        generated.push(...ages);
    } else if (suffixes.length > 0) {
        generated.push(...suffixes);
    }
    setBulkPreview(generated);
  }, [bulkAges, bulkSuffixes]);

  // --- HANDLERS ---
  const handleGenerateAI = async () => {
    if (!selectedPlayer) return;
    setIsGenerating(true);
    try {
      const statsStr = JSON.stringify(statValues);
      const resultJson = await generateCoachFeedback(selectedPlayer, statsStr, coachNotes);
      const parsed = JSON.parse(resultJson);
      setGeneratedFeedback(parsed);
      // Auto-populate strengths if empty
      if (manualStrengths.length === 0 && parsed.strengths) {
          setManualStrengths(parsed.strengths);
      }
    } catch (e) {
      alert("Error generating feedback. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTarget = () => {
    if(!newTargetText) return;
    setTargets([...targets, { id: Date.now().toString(), description: newTargetText, achieved: false }]);
    setNewTargetText('');
  };

  const removeTarget = (id: string) => {
    setTargets(targets.filter(t => t.id !== id));
  };
  
  const handleAddStrength = () => {
    if(!newStrength) return;
    setManualStrengths([...manualStrengths, newStrength]);
    setNewStrength('');
  };

  const removeStrength = (index: number) => {
    setManualStrengths(manualStrengths.filter((_, i) => i !== index));
  };

  const handleSaveReport = () => {
    if (!selectedPlayer || !generatedFeedback) return;
    
    const statsArray: Stat[] = [];
    (Object.keys(STAT_TEMPLATE) as StatGroup[]).forEach(group => {
      STAT_TEMPLATE[group].forEach(name => {
        statsArray.push({ name, group, value: statValues[name] || 0, fullMark: 5 });
      });
    });

    const overallRating = parseFloat((statsArray.reduce((acc, curr) => acc + curr.value, 0) / statsArray.length).toFixed(1));
    const author = coaches.find(c => c.id === authorCoachId) || currentUser;

    const newReport: ReportCard = {
      id: `rc-${Date.now()}`,
      season, quarter, date: new Date().toISOString(), overallRating,
      authorCoachId: author.id,
      authorCoachName: author.name,
      stats: statsArray,
      attendance: { attendanceScore: attendance.score, commitmentScore: attendance.commitment, note: attendance.note },
      ratingsSummary: { applicationScore: ratings.app, behaviourScore: ratings.behav, coachComment: ratings.note },
      finalSummary: generatedFeedback.summary,
      strengths: manualStrengths.length > 0 ? manualStrengths : generatedFeedback.strengths,
      improvements: { keyArea: generatedFeedback.improvements.keyArea, buildOnArea: generatedFeedback.improvements.buildOnArea },
      targets,
      coachFooterNote: coachFooterNote
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
    const assigned = newCoach.assignedTeams.split(',').map(t => t.trim()).filter(t => t !== '');
    const coach: Coach = {
      id: `coach_${Date.now()}`,
      name: newCoach.name,
      email: newCoach.email,
      instagramHandle: newCoach.instagram,
      password: newCoach.password || 'password123',
      assignedTeams: assigned,
      isAdmin: newCoach.isAdmin,
      role: UserRole.COACH,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newCoach.name}`
    };
    onUpdateCoaches([...coaches, coach]);
    setNewCoach({ name: '', email: '', instagram: '', password: '', assignedTeams: '', isAdmin: false });
    alert('Coach Added Successfully');
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;
    onAddTeam({ id: newTeamName, name: newTeamName });
    setNewTeamName('');
    alert('Team Created');
  };
  
  const handleBulkCreateTeams = () => {
      if (bulkPreview.length === 0) return;
      if (!confirm(`Create ${bulkPreview.length} new teams?`)) return;
      
      const newTeams: Team[] = [];
      bulkPreview.forEach(name => {
          if (!teams.find(t => t.id === name)) {
            newTeams.push({ id: name, name });
          }
      });
      
      if (newTeams.length > 0) {
        onAddTeams(newTeams);
        alert(`${newTeams.length} Teams Created Successfully!`);
      } else {
        alert("All selected teams already exist.");
      }

      setBulkAges('');
      setBulkSuffixes('');
  }
  
  const handleSavePlayerDetails = () => {
    if (!selectedPlayer) return;
    const updated = { ...selectedPlayer, name: editPlayerName, teamId: editPlayerTeam, position: editPlayerPosition };
    onUpdatePlayer(updated);
    setSelectedPlayer(updated);
    setIsEditingPlayerDetails(false);
  }

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const player: Player = {
      id: `p_${Date.now()}`,
      name: newPlayer.name,
      branch: newPlayer.branch,
      teamId: newPlayer.branch === 'ACADEMY' ? newPlayer.teamId : undefined,
      position: newPlayer.position,
      jerseyNumber: newPlayer.branch === 'ACADEMY' ? (parseInt(newPlayer.jersey) || 0) : undefined,
      accessCode: newPlayer.accessCode,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newPlayer.name}`,
      reportCards: []
    };
    onAddPlayer(player);
    setNewPlayer({ name: '', branch: 'ACADEMY', teamId: '', position: 'SUB', jersey: '', accessCode: '' });
    alert('Player Added Successfully');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'team' | 'player' | 'secondary') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'team') {
        onUpdateTeamLogo(result);
      } else if (type === 'player' && selectedPlayer) {
        onUpdatePlayer({ ...selectedPlayer, imageUrl: result });
        setSelectedPlayer({ ...selectedPlayer, imageUrl: result });
      } else if (type === 'secondary') {
          setSecondaryLogos([...secondaryLogos, result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const getGroupIcon = (group: StatGroup) => {
     switch (group) {
      case 'Technical': return <Footprints size={16} />;
      case 'Tactical': return <Brain size={16} />;
      case 'Physical': return <Zap size={16} />;
      case 'Psychological': return <Activity size={16} />;
      default: return null;
    }
  };

  // Calculate Team Averages for Dashboard
  const getTeamRating = (teamName: string) => {
    const teamPlayers = players.filter(p => p.teamId === teamName);
    if (teamPlayers.length === 0) return 0;
    const sum = teamPlayers.reduce((acc, p) => {
      const lastReport = p.reportCards[0];
      return acc + (lastReport ? lastReport.overallRating : 3); // Default to 3 if no report
    }, 0);
    return (sum / teamPlayers.length).toFixed(1);
  };

  // Renderers
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <nav className="bg-black text-white sticky top-0 z-20 shadow-lg border-b-4 border-teal-500">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 lg:gap-6">
            <button className="lg:hidden text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu />
            </button>
            <div className="font-black text-lg lg:text-xl flex items-center gap-2 brand-font" onClick={() => { setView('home'); setSelectedPlayer(null); }}>
               <Shield className="text-teal-500" />
               <span className="hidden md:inline">COACHING PORTAL</span>
               <span className="md:hidden">PORTAL</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full">
                 <Cloud size={12} className="text-teal-400" />
                 <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide">Cloud Sync</span>
             </div>
             <button onClick={() => setView('settings')} className="hidden md:flex text-gray-400 hover:text-white items-center gap-2 text-sm font-bold uppercase transition-colors">
               <Settings size={18} /> <span>Settings</span>
             </button>
             <button onClick={onLogout} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase transition-colors">
               <LogOut size={18} /> <span className="hidden md:inline">Sign Out</span>
             </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
          <div className="lg:hidden bg-zinc-900 text-white p-4 space-y-2 border-b border-zinc-800">
              <button onClick={() => { setView('home'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 font-bold">Home</button>
              <button onClick={() => { setView('roster'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 font-bold">Team / Player Editor</button>
              <button onClick={() => { setView('settings'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 font-bold">Settings</button>
          </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6">
        
        {/* --- HOME DASHBOARD (ADMIN VIEW) --- */}
        {view === 'home' && (
            <div className="space-y-8 animate-in fade-in">
                {/* Header Stats */}
                <div className="bg-gradient-to-r from-zinc-900 to-black rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h1 className="text-3xl font-black brand-font mb-2">WELCOME BACK, COACH</h1>
                    <p className="text-gray-400">Manage your academy teams and coaching clients.</p>
                </div>

                {/* Academy Teams Grid */}
                <div>
                    <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2"><Shield size={20}/> ACADEMY TEAMS</h2>
                    {teams.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                             <Shield className="mx-auto text-gray-300 mb-2" size={48} />
                             <p className="text-gray-500 font-bold mb-4">No teams created yet.</p>
                             <button onClick={() => { setView('settings'); setSettingsTab('teams'); }} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold">Create Teams in Settings</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teams.map(team => (
                                <div key={team.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer" onClick={() => {
                                    setSelectedTeamId(team.id);
                                    setView('team_view');
                                }}>
                                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                        <span className="font-black text-lg text-gray-800 uppercase">{team.name}</span>
                                        <span className="bg-black text-teal-400 text-xs font-bold px-2 py-1 rounded">RATING: {getTeamRating(team.id)}</span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex -space-x-2 overflow-hidden mb-3">
                                            {players.filter(p => p.teamId === team.id).slice(0,5).map(p => (
                                                <img key={p.id} src={p.imageUrl} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" alt=""/>
                                            ))}
                                        </div>
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                            {players.filter(p => p.teamId === team.id).length} Players Registered
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- TEAM PERFORMANCE VIEW (PITCH) --- */}
        {view === 'team_view' && selectedTeamId && (
            <div className="animate-in fade-in">
                 <button onClick={() => setView('home')} className="mb-4 text-xs font-bold text-gray-400 hover:text-black flex items-center gap-1">&larr; Back to Dashboard</button>
                 <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-200">
                    <div className="bg-black text-white p-6 flex justify-between items-center border-b-4 border-teal-500">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">{teams.find(t => t.id === selectedTeamId)?.name}</h2>
                            <span className="text-teal-400 text-xs font-bold tracking-widest uppercase">Performance Overview</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-3xl font-black text-white">{getTeamRating(selectedTeamId)}</span>
                            <span className="text-gray-400 text-[10px] font-bold uppercase">Team Average</span>
                        </div>
                    </div>
                    
                    {/* The Pitch */}
                    <div className="relative w-full aspect-[4/3] md:aspect-[16/9] min-h-[400px] bg-green-700 border-b border-gray-200 overflow-hidden shadow-inner">
                        {/* Grass Pattern */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '100% 40px' }}></div>
                        
                        {/* Pitch Markings */}
                        <div className="absolute inset-4 border-2 border-white/50 rounded-lg"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/50 transform -translate-x-1/2"></div>
                        <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                        
                        {/* Penalty Areas */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-24 border-2 border-t-0 border-white/50 bg-white/5"></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-24 border-2 border-b-0 border-white/50 bg-white/5"></div>

                        {/* Players on Pitch */}
                        {players.filter(p => p.teamId === selectedTeamId).map(p => {
                             const rating = p.reportCards[0]?.overallRating || 3;
                             const coords = getPositionCoords(p.position);
                             if (!coords || p.position === 'SUB' || !p.position) return null; // Don't render bench here
                             
                             return (
                                 <div 
                                    key={p.id} 
                                    onClick={() => { setSelectedPlayer(p); setView('roster'); }}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group transition-all hover:scale-110 z-10"
                                    style={{ top: coords.top, left: coords.left }}
                                 >
                                    <div className="relative">
                                        <img src={p.imageUrl} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-lg object-cover bg-white" />
                                        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border border-white shadow ${rating >= 4 ? 'bg-teal-500 text-white' : rating >= 3 ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {rating}
                                        </div>
                                    </div>
                                    <div className="mt-1 bg-black/60 backdrop-blur-sm text-white text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase truncate max-w-[80px] shadow-sm">
                                        {p.name}
                                    </div>
                                    <div className="mt-0.5 text-[7px] text-white/80 font-bold bg-black/30 px-1 rounded uppercase">
                                        {p.position}
                                    </div>
                                 </div>
                             )
                        })}
                    </div>
                    
                    {/* The Bench / Substitutes */}
                    <div className="bg-zinc-100 p-6 border-t border-gray-200">
                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Bench / Substitutes / Unassigned</h4>
                        <div className="flex flex-wrap gap-4">
                            {players.filter(p => p.teamId === selectedTeamId && (p.position === 'SUB' || !getPositionCoords(p.position))).map(p => {
                                 const rating = p.reportCards[0]?.overallRating || 3;
                                 return (
                                     <div key={p.id} onClick={() => { setSelectedPlayer(p); setView('roster'); }} className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-teal-500">
                                         <img src={p.imageUrl} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                                         <div>
                                             <div className="text-xs font-bold text-gray-800">{p.name}</div>
                                             <div className="flex items-center gap-1">
                                                 <span className={`w-2 h-2 rounded-full ${rating >= 4 ? 'bg-teal-500' : rating >= 3 ? 'bg-orange-500' : 'bg-red-500'}`}></span>
                                                 <span className="text-[10px] text-gray-400 font-medium">Rating: {rating}</span>
                                             </div>
                                         </div>
                                     </div>
                                 )
                            })}
                            {players.filter(p => p.teamId === selectedTeamId && (p.position === 'SUB' || !getPositionCoords(p.position))).length === 0 && (
                                <span className="text-xs text-gray-400 italic">All players assigned to pitch.</span>
                            )}
                        </div>
                    </div>
                 </div>
                 
                 <div className="text-center">
                    <button onClick={() => { setSelectedPlayer(null); setView('roster'); }} className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-800">
                        Manage Team & Positions
                    </button>
                 </div>
            </div>
        )}

        {/* --- SETTINGS VIEW --- */}
        {view === 'settings' && (
            <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4">
                    <button onClick={() => setView('home')} className="mb-6 text-xs font-bold text-gray-400 hover:text-black flex items-center gap-1">&larr; Back Home</button>
                    <div className="space-y-2">
                        <button onClick={() => setSettingsTab('branding')} className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-3 ${settingsTab === 'branding' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                            <Camera size={18} /> Branding
                        </button>
                        <button onClick={() => setSettingsTab('teams')} className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-3 ${settingsTab === 'teams' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                            <Shield size={18} /> Manage Teams
                        </button>
                        {currentUser.isAdmin && (
                          <button onClick={() => setSettingsTab('coaches')} className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-3 ${settingsTab === 'coaches' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                              <Users size={18} /> Manage Staff
                          </button>
                        )}
                         <button onClick={() => setSettingsTab('players')} className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-3 ${settingsTab === 'players' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                            <UserPlus size={18} /> Add Player
                        </button>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    
                    {/* BRANDING */}
                    {settingsTab === 'branding' && (
                        <div>
                            <h2 className="text-2xl font-black text-black mb-6">Branding Settings</h2>
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">Main Team Badge / Logo</label>
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
                                    </div>
                                </div>
                            </div>
                            
                            {/* Secondary Logos (Multiple Badges) */}
                            <div className="mb-8 pt-6 border-t border-gray-100">
                                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">Secondary Badges (Home Page)</label>
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {secondaryLogos.map((logo, idx) => (
                                        <div key={idx} className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 p-1 relative group">
                                            <img src={logo} className="w-full h-full object-contain" />
                                            <button onClick={() => setSecondaryLogos(secondaryLogos.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                                        </div>
                                    ))}
                                    <button onClick={() => secondaryLogoRef.current?.click()} className="w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:text-teal-500 hover:border-teal-500">
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <input type="file" ref={secondaryLogoRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'secondary')} />
                                <p className="text-xs text-gray-400">These logos will appear on the portal home screen.</p>
                            </div>
                        </div>
                    )}

                    {/* TEAMS */}
                    {settingsTab === 'teams' && (
                        <div>
                            <h2 className="text-2xl font-black text-black mb-6">Manage Teams</h2>
                            
                            {/* Bulk Generator */}
                            <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 mb-8">
                                <h3 className="text-sm font-black text-teal-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Copy size={16} /> Bulk Team Generator
                                </h3>
                                <p className="text-xs text-gray-600 mb-4">
                                    Quickly create multiple teams by combining Age Groups and Team Names.
                                    <br/>Example: Ages "U7, U8" and Names "Teals, Blacks" creates 4 teams.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Age Groups (comma separated)</label>
                                        <input className="w-full border rounded-lg p-3 text-sm" placeholder="e.g. U7, U8, U9" value={bulkAges} onChange={e => setBulkAges(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Team Names (comma separated)</label>
                                        <input className="w-full border rounded-lg p-3 text-sm" placeholder="e.g. Teals, Blacks" value={bulkSuffixes} onChange={e => setBulkSuffixes(e.target.value)} />
                                    </div>
                                </div>
                                {bulkPreview.length > 0 && (
                                    <div className="mb-4">
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Preview ({bulkPreview.length} Teams)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {bulkPreview.map(name => (
                                                <span key={name} className="bg-white border border-teal-200 text-teal-700 px-2 py-1 rounded text-xs font-bold">{name}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <button type="button" onClick={handleBulkCreateTeams} disabled={bulkPreview.length === 0} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2">
                                    Generate & Save Teams
                                </button>
                            </div>

                            <form onSubmit={handleAddTeam} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 flex gap-4">
                                <input required placeholder="Manual: Single Team Name" className="flex-1 border rounded-lg p-3 text-sm" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} />
                                <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-zinc-800">Add Single Team</button>
                            </form>

                            <div className="space-y-2">
                                {teams.map(t => (
                                    <div key={t.id} className="p-3 bg-white border border-gray-100 rounded-lg flex justify-between items-center shadow-sm group">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800">{t.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{players.filter(p => p.teamId === t.id).length} Players</span>
                                            <button onClick={() => onDeleteTeam(t.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* MANAGE COACHES (Added Section) */}
                    {settingsTab === 'coaches' && (
                        <div>
                            <h2 className="text-2xl font-black text-black mb-6">Manage Staff</h2>
                            
                            <form onSubmit={handleAddCoach} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-wide mb-4">Add New Coach</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input required placeholder="Full Name" className="border rounded-lg p-3 text-sm" value={newCoach.name} onChange={e => setNewCoach({...newCoach, name: e.target.value})} />
                                    <input required type="email" placeholder="Email Address" className="border rounded-lg p-3 text-sm" value={newCoach.email} onChange={e => setNewCoach({...newCoach, email: e.target.value})} />
                                    <input placeholder="Instagram (Optional)" className="border rounded-lg p-3 text-sm" value={newCoach.instagram} onChange={e => setNewCoach({...newCoach, instagram: e.target.value})} />
                                    <input required type="password" placeholder="Set Password" className="border rounded-lg p-3 text-sm" value={newCoach.password} onChange={e => setNewCoach({...newCoach, password: e.target.value})} />
                                    <div className="md:col-span-2">
                                         <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Assigned Teams (comma separated IDs)</label>
                                         <input placeholder="e.g. U10 Reds, U12 Blues" className="w-full border rounded-lg p-3 text-sm" value={newCoach.assignedTeams} onChange={e => setNewCoach({...newCoach, assignedTeams: e.target.value})} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="isAdmin" checked={newCoach.isAdmin} onChange={e => setNewCoach({...newCoach, isAdmin: e.target.checked})} className="w-4 h-4 accent-teal-600" />
                                        <label htmlFor="isAdmin" className="text-sm font-bold text-gray-700">Grant Admin Privileges</label>
                                    </div>
                                </div>
                                <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-teal-700">Add Coach</button>
                            </form>

                            <div className="grid gap-4">
                                {coaches.map(c => (
                                    <div key={c.id} className="p-4 bg-white border border-gray-100 rounded-xl flex justify-between items-center shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <img src={c.imageUrl} className="w-10 h-10 rounded-full border border-gray-200" />
                                            <div>
                                                <div className="font-bold text-gray-900">{c.name} {c.isAdmin && <span className="bg-black text-white text-[10px] px-1 rounded ml-1">ADMIN</span>}</div>
                                                <div className="text-xs text-gray-400">{c.email}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-teal-600">{c.assignedTeams.length > 0 ? c.assignedTeams.join(', ') : 'All Teams'}</div>
                                            <div className="text-[10px] text-gray-400">Password: {c.password}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MANAGE PLAYERS */}
                    {settingsTab === 'players' && (
                        <div>
                            <h2 className="text-2xl font-black text-black mb-6">Register New Player</h2>
                            
                            <form onSubmit={handleAddPlayerSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Branch Selection */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Branch</label>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setNewPlayer({...newPlayer, branch: 'ACADEMY'})} className={`flex-1 py-3 rounded-lg font-bold text-xs border ${newPlayer.branch === 'ACADEMY' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-300'}`}>ACADEMY</button>
                                            <button type="button" onClick={() => setNewPlayer({...newPlayer, branch: 'TECH_CENTRE'})} className={`flex-1 py-3 rounded-lg font-bold text-xs border ${newPlayer.branch === 'TECH_CENTRE' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-300'}`}>TECH CENTRE</button>
                                            <button type="button" onClick={() => setNewPlayer({...newPlayer, branch: 'COACHING'})} className={`flex-1 py-3 rounded-lg font-bold text-xs border ${newPlayer.branch === 'COACHING' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-300'}`}>PRIVATE COACHING</button>
                                        </div>
                                    </div>

                                    <input required placeholder="Player Name" className="border rounded-lg p-3 text-sm" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} />
                                    
                                    {(newPlayer.branch === 'ACADEMY' || newPlayer.branch === 'TECH_CENTRE') && (
                                        <>
                                            <div className="flex gap-2 items-center">
                                                <select required className="flex-1 border rounded-lg p-3 text-sm" value={newPlayer.teamId} onChange={e => setNewPlayer({...newPlayer, teamId: e.target.value})}>
                                                    <option value="">Select Team</option>
                                                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <button type="button" onClick={() => { setView('settings'); setSettingsTab('teams'); }} className="bg-black text-white p-3 rounded-lg hover:bg-zinc-800 transition-colors" title="Create New Team">
                                                    <Plus size={16}/>
                                                </button>
                                            </div>
                                            <input placeholder="Jersey Number (Optional)" type="number" className="border rounded-lg p-3 text-sm" value={newPlayer.jersey} onChange={e => setNewPlayer({...newPlayer, jersey: e.target.value})} />
                                        </>
                                    )}
                                    
                                    {/* REPLACED: Tactical Position Select in Registration */}
                                     <div>
                                        <select required className="w-full border rounded-lg p-3 text-sm" value={newPlayer.position} onChange={e => setNewPlayer({...newPlayer, position: e.target.value})}>
                                            <option value="">Select Tactical Position</option>
                                            {TACTICAL_POSITIONS.map(p => (
                                                <option key={p.value} value={p.value}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <input required placeholder="Parent Access Code (e.g. 1234)" className="border rounded-lg p-3 text-sm" value={newPlayer.accessCode} onChange={e => setNewPlayer({...newPlayer, accessCode: e.target.value})} />
                                </div>
                                <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-teal-700">Add Player</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- ROSTER/EDITOR VIEW --- */}
        {view === 'roster' && (
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Sidebar with Toggle for Mobile */}
            <div className={`
                fixed inset-0 z-30 bg-white lg:static lg:bg-transparent lg:z-auto lg:w-1/4 lg:flex flex-col 
                ${rosterOpen ? 'flex' : 'hidden'}
            `}>
              {rosterOpen && (
                  <button onClick={() => setRosterOpen(false)} className="lg:hidden absolute top-4 right-4 p-2 bg-gray-100 rounded-full"><X size={20}/></button>
              )}

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col h-full">
                  <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <button onClick={() => setView('home')} className="text-xs font-bold text-gray-400 hover:text-black">&larr; BACK</button>
                    <h2 className="font-black text-black uppercase tracking-wide text-sm">Squad List</h2>
                  </div>
                  <ul className="overflow-y-auto flex-1 p-2">
                    {myPlayers.length === 0 && <li className="p-4 text-center text-sm text-gray-400">No players found.</li>}
                    {myPlayers.map(p => {
                      const hasDraft = drafts[p.id] !== undefined;
                      return (
                        <li 
                          key={p.id} 
                          className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-teal-50 mb-1 transition-colors border border-transparent ${selectedPlayer?.id === p.id ? 'bg-black text-white border-black shadow-lg' : 'bg-white border-gray-100'}`}
                          onClick={() => { setSelectedPlayer(p); setRosterOpen(false); }}
                        >
                          <img src={p.imageUrl} alt={p.name} className={`w-10 h-10 rounded-full object-cover border-2 ${selectedPlayer?.id === p.id ? 'border-teal-500' : 'border-gray-200'}`} />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-sm">{p.name}</p>
                                {hasDraft && selectedPlayer?.id !== p.id && <div className="w-2 h-2 rounded-full bg-teal-500"></div>}
                            </div>
                            <p className={`text-[10px] font-bold uppercase ${selectedPlayer?.id === p.id ? 'text-gray-400' : 'text-gray-500'}`}>
                                {p.branch === 'ACADEMY' ? `${p.teamId}` : p.branch === 'TECH_CENTRE' ? `TC: ${p.teamId}` : 'Coaching'}
                            </p>
                          </div>
                          {currentUser.isAdmin && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); if(confirm('Delete player?')) onDeletePlayer(p.id); }}
                                className="p-1 hover:bg-red-500 hover:text-white rounded"
                              >
                                  <Trash2 size={14}/>
                              </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
              </div>
            </div>

            {/* Mobile "Show Roster" Button */}
            {!rosterOpen && (
                <button 
                    onClick={() => setRosterOpen(true)} 
                    className="lg:hidden w-full bg-black text-white py-3 rounded-xl font-bold mb-4 shadow-lg flex items-center justify-center gap-2"
                >
                    <Users size={18}/> Select Player
                </button>
            )}

            {/* Main Editor */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-y-auto p-4 md:p-8 relative">
              {!selectedPlayer ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="bg-gray-100 p-6 rounded-full">
                    <User size={64} className="opacity-20 text-black" />
                  </div>
                  <p className="font-medium">Select a player from the list</p>
                </div>
              ) : (
                <div className="space-y-8 max-w-3xl mx-auto pb-10">
                  {/* Header / Edit Details */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-gray-100 pb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <img src={selectedPlayer.imageUrl} className="w-16 h-16 rounded-full border-2 border-black object-cover" alt=""/>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => playerPhotoInputRef.current?.click()}>
                                <Camera className="text-white w-6 h-6" />
                            </div>
                            <input type="file" ref={playerPhotoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'player')} />
                        </div>
                        
                        {isEditingPlayerDetails ? (
                           <div className="space-y-2">
                              <input className="border p-1 rounded text-sm font-bold" value={editPlayerName} onChange={e => setEditPlayerName(e.target.value)} />
                              <div className="flex gap-2">
                                <div className="flex items-center gap-1">
                                    <select className="border p-1 rounded text-xs" value={editPlayerTeam} onChange={e => setEditPlayerTeam(e.target.value)}>
                                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <button onClick={() => { setView('settings'); setSettingsTab('teams'); }} className="bg-black text-white p-1 rounded" title="Create New Team"><Plus size={14}/></button>
                                </div>
                                {/* REPLACED: Tactical Position Select */}
                                <select className="border p-1 rounded text-xs w-32" value={editPlayerPosition} onChange={e => setEditPlayerPosition(e.target.value)}>
                                    {TACTICAL_POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={handleSavePlayerDetails} className="bg-teal-500 text-white p-1 rounded"><Check size={14}/></button>
                                <button onClick={() => setIsEditingPlayerDetails(false)} className="bg-gray-300 p-1 rounded"><X size={14}/></button>
                              </div>
                           </div>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-2">
                                    {selectedPlayer.name}
                                    <button onClick={() => setIsEditingPlayerDetails(true)} className="text-gray-300 hover:text-black"><Edit2 size={14}/></button>
                                </h2>
                                <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded flex items-center gap-2 w-fit">
                                    {selectedPlayer.teamId || selectedPlayer.branch} 
                                    <span className="w-1 h-1 bg-teal-800 rounded-full"></span>
                                    {TACTICAL_POSITIONS.find(p => p.value === selectedPlayer.position)?.label || selectedPlayer.position}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                          <select value={season} onChange={e => setSeason(e.target.value)} className="border-2 border-gray-200 rounded-lg p-2 text-sm bg-white font-bold focus:border-teal-500 outline-none">
                            <option value="2025/26">Season 25/26</option>
                            <option value="2026/27">Season 26/27</option>
                          </select>
                          <select value={quarter} onChange={e => setQuarter(e.target.value)} className="border-2 border-gray-200 rounded-lg p-2 text-sm bg-white font-bold focus:border-teal-500 outline-none">
                            <option value="Autumn Term">Autumn Term</option>
                            <option value="Winter Term">Winter Term</option>
                            <option value="Spring Term">Spring Term</option>
                            <option value="Summer Term">Summer Term</option>
                          </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-gray-400">Report Author:</span>
                        <select value={authorCoachId} onChange={e => setAuthorCoachId(e.target.value)} className="border rounded text-xs p-1">
                            {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 1. Ratings Summary (MOVED UP) */}
                  <div className="bg-zinc-900 text-white rounded-xl p-5 border border-zinc-800">
                      <h3 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-4">1. Ratings Summary (1-5)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                              <label className="text-xs font-bold text-gray-400 block mb-1">Application & Understanding</label>
                              <div className="flex gap-2">
                                  {[1,2,3,4,5].map(v => (
                                      <button key={v} onClick={() => setRatings({...ratings, app: v})} className={`flex-1 py-2 rounded font-bold text-sm ${ratings.app === v ? 'bg-teal-500 text-white' : 'bg-zinc-800 text-gray-500'}`}>{v}</button>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-400 block mb-1">Behaviour & Attitude</label>
                              <div className="flex gap-2">
                                  {[1,2,3,4,5].map(v => (
                                      <button key={v} onClick={() => setRatings({...ratings, behav: v})} className={`flex-1 py-2 rounded font-bold text-sm ${ratings.behav === v ? 'bg-teal-500 text-white' : 'bg-zinc-800 text-gray-500'}`}>{v}</button>
                                  ))}
                              </div>
                          </div>
                      </div>
                      <input type="text" value={ratings.note} onChange={e => setRatings({...ratings, note: e.target.value})} className="w-full bg-zinc-800 border-zinc-700 rounded p-3 text-sm text-white" placeholder="Short summary comment..." />
                  </div>

                  {/* 2. Coach Notes for AI */}
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                    <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-2">2. Coach Notes (For AI Generation)</h3>
                    <textarea 
                      rows={3}
                      className="w-full bg-white border border-amber-200 rounded-lg p-3 text-sm focus:border-amber-500 outline-none"
                      placeholder="Jot down key points: 'Great finishing, needs to track back more...'"
                      value={coachNotes}
                      onChange={(e) => setCoachNotes(e.target.value)}
                    />
                  </div>
                  
                  {/* 3. Skill Evaluation (1-5 Scale) */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">3. Skill Evaluation (1-5)</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {(Object.entries(STAT_TEMPLATE) as [StatGroup, string[]][]).map(([group, metrics]) => (
                        <div key={group} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                           <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setOpenGroup(openGroup === group ? 'All' : group)}>
                            <h4 className={`font-black uppercase tracking-wide text-sm flex items-center gap-2 ${group === 'Technical' ? 'text-blue-900' : group === 'Tactical' ? 'text-purple-900' : group === 'Physical' ? 'text-amber-900' : 'text-teal-900'}`}>
                                {getGroupIcon(group)} {group}
                            </h4>
                          </div>
                          {/* Render sliders */}
                          <div className={`space-y-4 ${openGroup !== 'All' && openGroup !== group ? 'hidden' : ''}`}>
                            {metrics.map(metric => {
                                const val = statValues[metric] || 3;
                                return (
                                  <div key={metric}>
                                    <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                      <span>{metric}</span>
                                      <span className={`px-2 py-0.5 rounded text-white text-[10px] ${val<=2?'bg-red-500':val===3?'bg-orange-500':val===4?'bg-teal-500':'bg-yellow-500'}`}>{val}</span>
                                    </div>
                                    <input 
                                      type="range" min="1" max="5" step="1"
                                      value={val}
                                      onChange={(e) => setStatValues({...statValues, [metric]: parseInt(e.target.value)})}
                                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-100 accent-black"
                                    />
                                    <div className="flex justify-between px-1 mt-1">
                                        {[1,2,3,4,5].map(n => <span key={n} className="text-[10px] text-gray-300 font-bold">{n}</span>)}
                                    </div>
                                  </div>
                                );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Targets & Strengths */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <TargetIcon size={14} /> 4. Targets
                          </h3>
                          <div className="flex gap-2 mb-4">
                              <input className="flex-1 border rounded-lg p-2 text-sm" placeholder="Add target..." value={newTargetText} onChange={e => setNewTargetText(e.target.value)} />
                              <button onClick={handleAddTarget} className="bg-black text-white px-4 rounded-lg font-bold text-xs">Add</button>
                          </div>
                          <ul className="space-y-2">
                              {targets.map(t => (
                                  <li key={t.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                                      <span className="text-sm font-medium">{t.description}</span>
                                      <button onClick={() => removeTarget(t.id)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                                  </li>
                              ))}
                          </ul>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Sparkles size={14} /> 5. Key Strengths (3)
                          </h3>
                          <div className="flex gap-2 mb-4">
                              <input className="flex-1 border rounded-lg p-2 text-sm" placeholder="Add key strength..." value={newStrength} onChange={e => setNewStrength(e.target.value)} />
                              <button onClick={handleAddStrength} className="bg-black text-white px-4 rounded-lg font-bold text-xs">Add</button>
                          </div>
                          <ul className="space-y-2">
                              {manualStrengths.map((s, i) => (
                                  <li key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                                      <span className="text-sm font-medium">{s}</span>
                                      <button onClick={() => removeStrength(i)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>

                  {/* 6. Attendance */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">6. Attendance (1-5)</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                              <label className="text-xs font-bold text-gray-600 block mb-1">Attendance</label>
                              <input type="number" min="1" max="5" value={attendance.score} onChange={e => setAttendance({...attendance, score: parseInt(e.target.value)})} className="w-full border rounded p-2 text-sm" />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-600 block mb-1">Commitment</label>
                              <input type="number" min="1" max="5" value={attendance.commitment} onChange={e => setAttendance({...attendance, commitment: parseInt(e.target.value)})} className="w-full border rounded p-2 text-sm" />
                          </div>
                      </div>
                      <input type="text" value={attendance.note} onChange={e => setAttendance({...attendance, note: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="Attendance Note" />
                  </div>

                  {/* 7. Footer Note */}
                  <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
                       <h3 className="text-xs font-black text-teal-800 uppercase tracking-widest mb-4">7. Final Coach Note (Footer)</h3>
                       <textarea 
                          rows={2}
                          className="w-full bg-white border border-teal-200 rounded-lg p-3 text-sm focus:border-teal-500 outline-none"
                          placeholder="A short encouraging message for the player..."
                          value={coachFooterNote}
                          onChange={(e) => setCoachFooterNote(e.target.value)}
                        />
                  </div>

                  {/* Generate & Preview */}
                  <div className="pt-4 border-t border-gray-100">
                    <button 
                      onClick={handleGenerateAI}
                      disabled={isGenerating || !coachNotes}
                      className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-xl shadow-lg hover:bg-zinc-800 transition-all disabled:opacity-50 mb-6 font-bold"
                    >
                      {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Sparkles size={16} className="text-teal-400" />}
                      Generate Summary & Strengths
                    </button>

                    {generatedFeedback && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl animate-in fade-in">
                            <h3 className="font-black text-black uppercase tracking-widest text-xs mb-4">Preview</h3>
                            <p className="text-sm text-gray-800 mb-4 italic">"{generatedFeedback.summary}"</p>
                            
                            <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">Generated Strengths:</h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {(manualStrengths.length > 0 ? manualStrengths : generatedFeedback.strengths).map((s: string, i: number) => (
                                    <span key={i} className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs font-bold">{s}</span>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-3 rounded shadow-sm border border-gray-100"><span className="text-[10px] uppercase font-bold text-teal-600 block">Key Improvement</span>{generatedFeedback.improvements.keyArea}</div>
                                <div className="bg-gray-50 p-3 rounded shadow-sm border border-gray-100"><span className="text-[10px] uppercase font-bold text-amber-600 block">Build On</span>{generatedFeedback.improvements.buildOnArea}</div>
                            </div>
                            <button onClick={handleSaveReport} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 flex justify-center gap-2 shadow-lg hover:shadow-xl transition-all"><Save size={18}/> Publish Report</button>
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachDashboard;
