
import React, { useState } from 'react';
import { Player, ReportCard, Coach, StatGroup } from '../types';
import ReportCardView from './ReportCardView';
import { LogOut, ChevronRight, Calendar, TrendingUp, Users, Instagram, Mail, Trophy, Info, MessageSquare } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DEFINITIONS } from '../constants';

interface ParentDashboardProps {
  player: Player;
  coaches: Coach[];
  onLogout: () => void;
  teamLogo: string;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ player, coaches, onLogout, teamLogo }) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'contact' | 'feedback'>('dashboard');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'positive' | 'constructive'>('positive');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const sortedReports = [...player.reportCards].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const currentReport = sortedReports[0];
  const selectedReport = sortedReports.find(r => r.id === selectedReportId);

  // Group reports for history list
  const reportsBySeason = sortedReports.reduce((acc, report) => {
    if (!acc[report.season]) acc[report.season] = [];
    acc[report.season].push(report);
    return acc;
  }, {} as Record<string, ReportCard[]>);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSent(true);
    setTimeout(() => {
        setFeedbackText('');
        setFeedbackSent(false);
        setView('dashboard');
    }, 2000);
  }

  // Prepare Data for Line Chart
  const chartData = [...sortedReports].reverse().map(report => {
    const getAvg = (group: StatGroup) => {
        const stats = report.stats.filter(s => s.group === group);
        if (!stats.length) return 0;
        return parseFloat((stats.reduce((a, b) => a + b.value, 0) / stats.length).toFixed(1));
    };
    return {
        name: report.quarter,
        Technical: getAvg('Technical'),
        Tactical: getAvg('Tactical'),
        Physical: getAvg('Physical'),
        Psychological: getAvg('Psychological')
    };
  });

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ReportCardView 
          reportCard={selectedReport} 
          player={player} 
          onBack={() => setSelectedReportId(null)}
          teamLogo={teamLogo}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-10 font-sans">
      {/* Header */}
      <div className="relative bg-black text-white pb-16 pt-8 px-6 rounded-b-[2.5rem] shadow-2xl overflow-hidden border-b-4 border-teal-500">
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-black tracking-tighter italic font-montserrat uppercase">PLAYER PERFORMANCE PORTAL</h1>
            {currentReport ? (
                 <span className="text-[10px] text-teal-400 font-bold tracking-widest uppercase">{currentReport.quarter} REPORT</span>
            ) : (
                 <span className="text-[10px] text-teal-400 font-bold tracking-widest uppercase">JDA COACHING & ACADEMY</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('feedback')} className={`p-2 rounded-full transition-colors ${view === 'feedback' ? 'bg-teal-500 text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}>
                <MessageSquare size={18} />
            </button>
            <button onClick={() => setView(view === 'dashboard' ? 'contact' : 'dashboard')} className={`p-2 rounded-full transition-colors ${view === 'contact' ? 'bg-teal-500 text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}>
                <Users size={18} />
            </button>
            <button onClick={onLogout} className="text-gray-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
                <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-full border-4 border-black p-1 mb-4 shadow-xl bg-teal-500 relative">
            <img src={player.imageUrl} alt={player.name} className="w-full h-full rounded-full object-cover border-2 border-white/20" />
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full border-2 border-white shadow-md w-8 h-8 overflow-hidden">
                 <img src={teamLogo} className="w-full h-full object-cover" alt="Team Badge" />
            </div>
            {/* Average Rating Badge */}
            {currentReport && (
                 <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-black text-white border-2 border-teal-400 rounded-full w-10 h-10 flex items-center justify-center font-black text-sm shadow-lg z-20">
                     {currentReport.overallRating}
                 </div>
            )}
          </div>
          <h2 className="text-3xl font-black mb-1 tracking-tight font-montserrat">{player.name}</h2>
          <p className="text-teal-400 font-bold text-sm mb-6 uppercase tracking-wide">
            {player.branch === 'ACADEMY' ? `${player.teamId} • #${player.jerseyNumber}` : player.branch === 'TECH_CENTRE' ? `Tech Centre • ${player.teamId}` : 'Private Coaching'} • {player.position}
          </p>
          
          {view === 'dashboard' && currentReport && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full animate-in fade-in slide-in-from-bottom-4">
                {['Technical', 'Tactical', 'Physical', 'Psychological'].map(g => {
                    const stats = currentReport.stats.filter(s => s.group === g);
                    const avg = stats.length ? (stats.reduce((a,b)=>a+b.value,0)/stats.length).toFixed(1) : '-';
                    return (
                        <div key={g} className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex flex-col items-center justify-center group relative cursor-help">
                            <span className="block text-[8px] text-gray-400 uppercase font-bold tracking-wider mb-1 text-center flex items-center gap-1">
                                {g} <Info size={8} />
                            </span>
                            <span className={`text-lg font-black ${parseFloat(avg) >= 4.5 ? 'text-yellow-400 drop-shadow-sm' : 'text-white'}`}>{avg}</span>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 bg-black text-white text-[10px] p-2 rounded w-32 hidden group-hover:block z-50 text-center shadow-xl border border-teal-500/30">
                                {DEFINITIONS[g] || g}
                            </div>
                        </div>
                    )
                })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-10 relative z-20 space-y-6">
        {view === 'feedback' && (
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-8">
               <h3 className="text-black font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm">
                   <MessageSquare className="text-teal-500" size={18} /> Give Feedback
               </h3>
               <p className="text-xs text-gray-500 mb-6">Help us improve JDA Coaching. Your reviews help us grow!</p>
               
               {feedbackSent ? (
                   <div className="bg-teal-50 text-teal-800 p-4 rounded-xl text-center font-bold">
                       Thank you for your feedback!
                   </div>
               ) : (
                   <form onSubmit={handleSendFeedback} className="space-y-4">
                       <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                           <button type="button" onClick={() => setFeedbackType('positive')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${feedbackType === 'positive' ? 'bg-white shadow text-teal-600' : 'text-gray-400'}`}>Positive Review</button>
                           <button type="button" onClick={() => setFeedbackType('constructive')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${feedbackType === 'constructive' ? 'bg-white shadow text-orange-600' : 'text-gray-400'}`}>Constructive</button>
                       </div>
                       <textarea 
                         required
                         className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:border-teal-500 outline-none h-32"
                         placeholder={feedbackType === 'positive' ? "What do you love about the academy?" : "How can we improve?"}
                         value={feedbackText}
                         onChange={(e) => setFeedbackText(e.target.value)}
                       />
                       <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-800">Submit Feedback</button>
                   </form>
               )}
            </div>
        )}

        {view === 'contact' && (
           <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-8">
               <h3 className="text-black font-black mb-6 flex items-center gap-2 uppercase tracking-wide text-sm border-b border-gray-100 pb-4">
                   <Users className="text-teal-500" size={18} /> Meet The Coaches
               </h3>
               <div className="space-y-4">
                   {coaches.map(coach => (
                       <div key={coach.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                           <img src={coach.imageUrl} alt={coach.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                           <div className="flex-1">
                               <h4 className="font-bold text-sm text-black">{coach.name}</h4>
                               <p className="text-xs text-gray-500">{coach.assignedTeams.join(', ') || "Head Coach"}</p>
                           </div>
                           <div className="flex gap-2">
                               {coach.email && <a href={`mailto:${coach.email}`} className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-teal-600"><Mail size={16} /></a>}
                               {coach.instagramHandle && <a href={`https://instagram.com/${coach.instagramHandle}`} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-pink-600"><Instagram size={16} /></a>}
                           </div>
                       </div>
                   ))}
               </div>
           </div>
        )} 
        
        {view === 'dashboard' && (
          <>
            {/* Trends Chart */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-black font-bold mb-4 flex items-center gap-2 uppercase tracking-wide text-sm">
                  <TrendingUp className="text-teal-500" size={18} /> Performance Trends
                </h3>
                <div className="h-64 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 5]} stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            <Line type="monotone" dataKey="Technical" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                            <Line type="monotone" dataKey="Tactical" stroke="#a855f7" strokeWidth={3} dot={{r: 4}} />
                            {/* Metallic Gold for Physical */}
                            <Line type="monotone" dataKey="Physical" stroke="#EAB308" strokeWidth={3} dot={{r: 4}} /> 
                            <Line type="monotone" dataKey="Psychological" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Report History */}
            <div className="space-y-4">
              <h3 className="text-black font-black text-lg px-2 uppercase tracking-tight">Report History</h3>
              {(Object.entries(reportsBySeason) as [string, ReportCard[]][]).map(([seasonName, reports]) => (
                <div key={seasonName} className="space-y-3">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 border-l-4 border-teal-500 pl-2">{seasonName} Season</div>
                  {reports.map(report => (
                    <button key={report.id} onClick={() => setSelectedReportId(report.id)} className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-teal-400 transition-all active:scale-[0.98] group">
                      <div className="flex items-center gap-4">
                        <div className="bg-black w-12 h-12 rounded-xl flex items-center justify-center text-teal-400 shadow-lg group-hover:bg-teal-500 group-hover:text-white transition-colors">
                          <Calendar size={20} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-black text-lg group-hover:text-teal-600 transition-colors">{report.quarter}</div>
                          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{new Date(report.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs font-bold bg-gray-100 px-2 py-1 rounded">
                             <Trophy size={12} className="text-teal-500"/>
                             {report.targets?.filter(t => t.achieved).length || 0}
                          </div>
                          <ChevronRight size={20} className="text-gray-300 group-hover:text-teal-500" />
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
