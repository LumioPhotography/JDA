import React, { useState } from 'react';
import { Player, ReportCard, Coach } from '../types';
import ReportCardView from './ReportCardView';
import { LogOut, ChevronRight, Calendar, TrendingUp, Users, Instagram, Mail } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ParentDashboardProps {
  player: Player;
  coaches: Coach[];
  onLogout: () => void;
  teamLogo: string;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ player, coaches, onLogout, teamLogo }) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'contact'>('dashboard');

  // Sort report cards by date (newest first)
  const sortedReports = [...player.reportCards].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const currentReport = sortedReports[0];
  const selectedReport = sortedReports.find(r => r.id === selectedReportId);
  
  // Find the report logically "before" the selected one for comparison
  const selectedIndex = sortedReports.findIndex(r => r.id === selectedReportId);
  const previousReport = selectedIndex !== -1 && selectedIndex < sortedReports.length - 1 
    ? sortedReports[selectedIndex + 1] 
    : undefined;

  // Group reports by season
  const reportsBySeason = sortedReports.reduce((acc, report) => {
    if (!acc[report.season]) acc[report.season] = [];
    acc[report.season].push(report);
    return acc;
  }, {} as Record<string, ReportCard[]>);

  // Data for Radar Chart (Aggregated by Group for latest report)
  const getRadarData = () => {
    if (!currentReport) return [];
    // New Categories
    const groups = ['Technical', 'Tactical', 'Physical', 'Psychological'];
    return groups.map(group => {
       const stats = currentReport.stats.filter(s => s.group === group);
       const avg = stats.length ? Math.round(stats.reduce((a,b)=>a+b.value,0)/stats.length) : 0;
       return { subject: group, A: avg, fullMark: 100 };
    });
  };

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ReportCardView 
          reportCard={selectedReport} 
          player={player} 
          previousReport={previousReport}
          onBack={() => setSelectedReportId(null)}
          teamLogo={teamLogo}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-10 font-sans">
      {/* Mobile Header with JDA Branding */}
      <div className="relative bg-black text-white pb-16 pt-8 px-6 rounded-b-[2.5rem] shadow-2xl overflow-hidden border-b-4 border-teal-500">
        
        {/* Abstract Branding Elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-800/50 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

        <div className="relative z-10 flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter italic">JDA ACADEMY</h1>
            <span className="text-[10px] text-teal-400 font-bold tracking-widest uppercase">Elite Development</span>
          </div>
          <div className="flex gap-2">
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
          </div>
          <h2 className="text-3xl font-black mb-1 tracking-tight">{player.name}</h2>
          <p className="text-teal-400 font-bold text-sm mb-6 uppercase tracking-wide">{player.position} • {player.ageGroup} • #{player.jerseyNumber}</p>
          
          {view === 'dashboard' && currentReport && (
            <div className="flex gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-4">
               <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex-1 max-w-[120px]">
                 <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Overall</span>
                 <span className="text-3xl font-black text-white">{currentReport.overallRating}</span>
               </div>
               <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex-1 max-w-[120px]">
                 <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Latest</span>
                 <span className="text-xl font-bold text-teal-400">{currentReport.quarter}</span>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-xl mx-auto px-4 -mt-10 relative z-20 space-y-6">
        
        {view === 'contact' ? (
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
                               <p className="text-xs text-gray-500">{coach.assignedTeams.join(', ') || "Academy Coach"}</p>
                           </div>
                           <div className="flex gap-2">
                               {coach.email && (
                                   <a href={`mailto:${coach.email}`} className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-teal-600">
                                       <Mail size={16} />
                                   </a>
                               )}
                               {coach.instagramHandle && (
                                   <a href={`https://instagram.com/${coach.instagramHandle}`} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-pink-600">
                                       <Instagram size={16} />
                                   </a>
                               )}
                           </div>
                       </div>
                   ))}
               </div>
           </div>
        ) : (
          <>
            {/* Latest Snapshot Card */}
            {currentReport && (
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-black font-bold mb-4 flex items-center gap-2 uppercase tracking-wide text-sm">
                  <TrendingUp className="text-teal-500" size={18} />
                  Current Form
                </h3>
                <div className="h-56 w-full -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData()}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#1f2937', fontSize: 10, fontWeight: 800 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Stats"
                          dataKey="A"
                          stroke="#14b8a6"
                          strokeWidth={3}
                          fill="#14b8a6"
                          fillOpacity={0.2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-2 text-sm text-gray-600 italic border-t border-gray-100 pt-4 leading-relaxed line-clamp-3">
                  "{currentReport.finalSummary}"
                </div>
              </div>
            )}

            {/* Report History List */}
            <div className="space-y-4">
              <h3 className="text-black font-black text-lg px-2 uppercase tracking-tight">Report History</h3>
              
              {(Object.entries(reportsBySeason) as [string, ReportCard[]][]).map(([seasonName, reports]) => (
                <div key={seasonName} className="space-y-3">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 border-l-4 border-teal-500 pl-2">{seasonName} Season</div>
                  {reports.map(report => (
                    <button 
                      key={report.id}
                      onClick={() => setSelectedReportId(report.id)}
                      className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-teal-400 transition-all active:scale-[0.98] group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-black w-12 h-12 rounded-xl flex items-center justify-center text-teal-400 shadow-lg group-hover:bg-teal-500 group-hover:text-white transition-colors">
                          <Calendar size={20} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-black text-lg group-hover:text-teal-600 transition-colors">{report.quarter} Report</div>
                          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{new Date(report.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className={`text-sm font-black px-3 py-1.5 rounded-lg ${report.overallRating >= 90 ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-600'}`}>
                            {report.overallRating}
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