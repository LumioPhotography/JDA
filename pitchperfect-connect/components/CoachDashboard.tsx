import React, { useState, useEffect } from 'react';
import { Player, ReportCard, Stat, StatGroup } from '../types';
import { generateCoachFeedback } from '../services/geminiService';
import { LogOut, Sparkles, User, Save, ChevronDown, ChevronRight, Shield } from 'lucide-react';

interface CoachDashboardProps {
  onLogout: () => void;
  players: Player[];
  onUpdatePlayer: (player: Player) => void;
}

const STAT_TEMPLATE = {
  Attacking: ['Shooting', 'Passing', 'Dribbling'],
  Defending: ['Tackling', 'Positioning', 'Interceptions'],
  Physical: ['Pace', 'Strength', 'Stamina'],
  Mental: ['Attitude', 'Work Rate', 'Teamwork']
};

const CoachDashboard: React.FC<CoachDashboardProps> = ({ onLogout, players, onUpdatePlayer }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [season, setSeason] = useState('2025/26');
  const [quarter, setQuarter] = useState('Q2');
  
  // Initialize stats state dynamically
  const [statValues, setStatValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    Object.values(STAT_TEMPLATE).flat().forEach(s => initial[s] = 70);
    return initial;
  });

  const [coachNotes, setCoachNotes] = useState('');
  const [generatedFeedback, setGeneratedFeedback] = useState<any>(null);

  // Accordion state for grouping inputs
  const [openGroup, setOpenGroup] = useState<StatGroup | 'All'>('All');

  // Bug Fix: Reset form when selected player changes
  useEffect(() => {
    if (selectedPlayer) {
        // Reset stats to default (70)
        const initial: Record<string, number> = {};
        Object.values(STAT_TEMPLATE).flat().forEach(s => initial[s] = 70);
        setStatValues(initial);
        
        // Reset notes and generated content
        setCoachNotes('');
        setGeneratedFeedback(null);
    }
  }, [selectedPlayer]);

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
        statsArray.push({
          name,
          group,
          value: statValues[name] || 0,
          fullMark: 100
        });
      });
    });

    const overallRating = Math.round(statsArray.reduce((acc, curr) => acc + curr.value, 0) / statsArray.length);

    const newReport: ReportCard = {
      id: `rc-${Date.now()}`,
      season,
      quarter,
      date: new Date().toISOString(),
      overallRating,
      stats: statsArray,
      summary: generatedFeedback.summary,
      strengths: generatedFeedback.strengths,
      improvements: generatedFeedback.improvements,
      coachNotes: coachNotes
    };

    // Update the player object
    const updatedPlayer = {
        ...selectedPlayer,
        reportCards: [newReport, ...selectedPlayer.reportCards]
    };

    // Send update back to App.tsx
    onUpdatePlayer(updatedPlayer);
    
    // Update local selection to reflect changes immediately
    setSelectedPlayer(updatedPlayer);

    setGeneratedFeedback(null);
    setCoachNotes('');
    alert("Report Card Published Successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <nav className="bg-black text-white sticky top-0 z-10 shadow-lg border-b-4 border-teal-500">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-black text-xl italic tracking-tighter flex items-center gap-2">
             <Shield className="text-teal-500" />
             JDA ACADEMY <span className="text-teal-500 font-normal not-italic text-sm tracking-widest ml-1 hidden sm:inline">COACH HUB</span>
          </div>
          <button onClick={onLogout} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full p-4 lg:p-6 gap-6">
        
        {/* Sidebar: Player List */}
        <div className="w-1/4 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col hidden lg:flex">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 className="font-black text-black uppercase tracking-wide text-sm">Team Roster</h2>
          </div>
          <ul className="overflow-y-auto flex-1">
            {players.map(p => (
              <li 
                key={p.id} 
                onClick={() => { setSelectedPlayer(p); }}
                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-teal-50 transition-colors border-b border-gray-50 group ${selectedPlayer?.id === p.id ? 'bg-black text-white' : ''}`}
              >
                <img src={p.imageUrl} alt={p.name} className={`w-10 h-10 rounded-full object-cover border-2 ${selectedPlayer?.id === p.id ? 'border-teal-500' : 'border-gray-200'}`} />
                <div>
                  <p className={`font-bold text-sm ${selectedPlayer?.id === p.id ? 'text-white' : 'text-gray-800'}`}>{p.name}</p>
                  <p className={`text-xs ${selectedPlayer?.id === p.id ? 'text-gray-400' : 'text-gray-500'}`}>#{p.jerseyNumber} • {p.position}</p>
                </div>
                <ChevronRight className={`ml-auto w-4 h-4 ${selectedPlayer?.id === p.id ? 'text-teal-500' : 'text-gray-300 opacity-0 group-hover:opacity-100'}`} />
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content: Editor */}
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
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-gray-100 pb-6 gap-4">
                 <div className="flex items-center gap-4">
                    <img src={selectedPlayer.imageUrl} className="w-16 h-16 rounded-full border-2 border-black" alt=""/>
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
                     <option value="Q1">Q1</option>
                     <option value="Q2">Q2</option>
                     <option value="Q3">Q3</option>
                     <option value="Q4">Q4</option>
                   </select>
                 </div>
              </div>

              {/* Stats Input */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">1. Performance Scoring</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(Object.entries(STAT_TEMPLATE) as [StatGroup, string[]][]).map(([group, metrics]) => (
                    <div key={group} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-teal-200 transition-colors">
                      <div 
                        className="flex items-center justify-between mb-4 cursor-pointer"
                        onClick={() => setOpenGroup(openGroup === group ? 'All' : group)}
                      >
                        <h4 className={`font-black uppercase tracking-wide text-sm ${
                          group === 'Attacking' ? 'text-blue-900' :
                          group === 'Defending' ? 'text-red-900' :
                          group === 'Physical' ? 'text-amber-900' : 'text-purple-900'
                        }`}>{group}</h4>
                      </div>
                      
                      <div className="space-y-4">
                        {metrics.map(metric => (
                          <div key={metric}>
                            <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                              <span>{metric}</span>
                              <span className="font-mono bg-black text-white px-2 py-0.5 rounded text-[10px]">{statValues[metric]}</span>
                            </div>
                            <input 
                              type="range"
                              min="0" max="100"
                              value={statValues[metric]}
                              onChange={(e) => setStatValues({...statValues, [metric]: parseInt(e.target.value)})}
                              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                                group === 'Attacking' ? 'accent-blue-600' :
                                group === 'Defending' ? 'accent-red-600' :
                                group === 'Physical' ? 'accent-amber-600' : 'accent-purple-600'
                              } bg-gray-100`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">2. Coach Notes</h3>
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
                  Generate Report
                </button>
              </div>

              {/* Preview & Save */}
              {generatedFeedback && (
                <div className="bg-teal-50 rounded-2xl p-6 border-l-4 border-teal-500 animate-in fade-in slide-in-from-bottom-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-teal-800 uppercase tracking-widest">3. Preview</h3>
                    <div className="bg-white px-4 py-2 rounded-lg text-teal-800 font-black text-lg shadow-sm">
                      <span className="text-[10px] text-gray-400 font-bold block leading-none">OVR</span>
                      {Math.round((Object.values(statValues) as number[]).reduce((a, b) => a + b, 0) / Object.values(statValues).length)}
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">"{generatedFeedback.summary}"</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <span className="text-[10px] uppercase font-bold text-teal-600 mb-1 block">Strengths</span>
                         <ul className="list-disc list-inside text-xs text-gray-600 font-medium space-y-1">
                           {generatedFeedback.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                         </ul>
                       </div>
                       <div>
                         <span className="text-[10px] uppercase font-bold text-amber-600 mb-1 block">Improvements</span>
                         <ul className="list-disc list-inside text-xs text-gray-600 font-medium space-y-1">
                           {generatedFeedback.improvements.map((s: string, i: number) => <li key={i}>{s}</li>)}
                         </ul>
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveReport}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-teal-700 transition-all hover:scale-[1.01]"
                  >
                    <Save size={18} />
                    Publish {season} - {quarter} Report
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;