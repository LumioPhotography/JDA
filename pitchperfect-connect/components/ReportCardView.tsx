
import React, { useState } from 'react';
import { ReportCard, Player, StatGroup } from '../types';
import { Trophy, CheckCircle2, User, Footprints, Brain, Zap, Activity, MessageSquare, Send, Calendar, Target, AlertCircle, Star, PenTool, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { askCoachAI, getDrillSuggestion } from '../services/geminiService';
import { DEFINITIONS } from '../constants';

interface ReportCardViewProps {
  reportCard: ReportCard;
  player: Player;
  onBack: () => void;
  teamLogo: string;
}

const ReportCardView: React.FC<ReportCardViewProps> = ({ reportCard, player, onBack, teamLogo }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  
  // Drill Expansion State
  const [expandedDrill, setExpandedDrill] = useState<string | null>(null);
  const [drillContent, setDrillContent] = useState<string>("");
  const [loadingDrill, setLoadingDrill] = useState(false);

  const handleAskAI = async () => {
    if (!chatQuestion.trim()) return;
    setLoadingChat(true);
    try {
      const answer = await askCoachAI(chatQuestion, reportCard, player);
      setChatResponse(answer);
    } catch (error) { setChatResponse("Error connecting to AI."); } 
    finally { setLoadingChat(false); }
  };

  const handleDrillExpand = async (area: string, type: string) => {
    if (expandedDrill === type) {
        setExpandedDrill(null); // Collapse
        return;
    }
    setExpandedDrill(type);
    setLoadingDrill(true);
    const drill = await getDrillSuggestion(area);
    setDrillContent(drill);
    setLoadingDrill(false);
  };

  const getBarColor = (val: number) => {
    if (val <= 2) return 'bg-red-500';
    if (val === 3) return 'bg-orange-500';
    if (val === 4) return 'bg-teal-500';
    return 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-md'; // Shiny Gold
  };
  
  const getScoreColor = (val: number) => {
     if (val <= 2) return 'text-red-500';
    if (val === 3) return 'text-orange-500';
    if (val === 4) return 'text-teal-500';
    return 'text-yellow-500 drop-shadow-sm'; // Gold text
  }

  const getGroupIcon = (group: StatGroup) => {
     switch (group) {
      case 'Technical': return <Footprints size={16} />;
      case 'Tactical': return <Brain size={16} />;
      case 'Physical': return <Zap size={16} />;
      case 'Psychological': return <Activity size={16} />;
      default: return null;
    }
  };

  return (
    <div className="pb-20 font-sans bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-black text-white pb-12 pt-6 px-4 rounded-b-[3rem] shadow-2xl relative overflow-hidden border-b-4 border-teal-500">
         <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
         <div className="relative z-10 flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-xs text-gray-400 hover:text-white font-bold flex items-center gap-1 transition-colors uppercase tracking-widest">&larr; Back</button>
            <span className="text-xs font-bold text-teal-400 tracking-wider">OFFICIAL REPORT</span>
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 max-w-4xl mx-auto">
             <div className="relative">
                 <img src={player.imageUrl} alt={player.name} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-teal-500 shadow-xl" />
                 <div className="absolute -bottom-2 -right-2 bg-white rounded-full border-2 border-white shadow-md w-8 h-8 overflow-hidden">
                     <img src={teamLogo} className="w-full h-full object-cover" alt="Team Badge" />
                 </div>
             </div>
             <div className="flex-1 text-center md:text-left">
                 <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 font-montserrat">{player.name}</h1>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-white/10 pt-4 mt-2">
                     <div><span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Term</span><span className="font-bold text-teal-400">{reportCard.quarter}</span></div>
                     <div><span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Position</span><span className="font-bold text-white">{player.position}</span></div>
                     {reportCard.authorCoachName && (
                        <div><span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Coach</span><span className="font-bold text-white">{reportCard.authorCoachName}</span></div>
                     )}
                 </div>
             </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 space-y-6">
        
        {/* 1. Ratings Summary (Top) */}
        <div className="bg-zinc-900 text-white rounded-xl shadow-lg p-6">
             <h3 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <CheckCircle2 size={16} /> Ratings Summary
             </h3>
             <div className="grid grid-cols-2 gap-4 mb-4">
                 <div className="text-center bg-white/5 rounded-xl p-4 border border-white/10 group relative cursor-help">
                     <span className={`block text-3xl font-black ${getScoreColor(reportCard.ratingsSummary?.applicationScore)}`}>{reportCard.ratingsSummary?.applicationScore}/5</span>
                     <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-2 block">Application</span>
                     <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] p-2 rounded w-32 hidden group-hover:block z-50 text-center border border-teal-500/30">
                        {DEFINITIONS['Application']}
                     </div>
                 </div>
                 <div className="text-center bg-white/5 rounded-xl p-4 border border-white/10 group relative cursor-help">
                     <span className={`block text-3xl font-black ${getScoreColor(reportCard.ratingsSummary?.behaviourScore)}`}>{reportCard.ratingsSummary?.behaviourScore}/5</span>
                     <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-2 block">Behaviour</span>
                     <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] p-2 rounded w-32 hidden group-hover:block z-50 text-center border border-teal-500/30">
                        {DEFINITIONS['Behaviour']}
                     </div>
                 </div>
             </div>
             
             {/* Grading Key - MOVED HERE */}
             <div className="flex flex-wrap justify-center gap-4 py-3 border-t border-b border-white/10 mb-4 bg-white/5 rounded-lg">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-sm"></div><span className="text-[10px] uppercase font-bold text-gray-400">5 - Outstanding</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-teal-500 rounded-full"></div><span className="text-[10px] uppercase font-bold text-gray-400">4 - Very Strong</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span className="text-[10px] uppercase font-bold text-gray-400">3 - Meeting Exp.</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-[10px] uppercase font-bold text-gray-400">1-2 - Developing</span></div>
            </div>

             <p className="text-sm font-medium italic text-gray-300 text-center">"{reportCard.ratingsSummary?.coachComment}"</p>
        </div>

        {/* 2. Coach Final Summary */}
        <div className="bg-white border-l-4 border-black rounded-r-xl shadow-sm p-6">
            <h3 className="font-black text-black mb-3 text-sm uppercase tracking-widest flex items-center gap-2"><User size={16} /> Coach's Summary</h3>
            <p className="text-gray-800 leading-7 font-medium text-justify">{reportCard.finalSummary}</p>
        </div>
        
        {/* 3. Key Strengths (New) */}
        {reportCard.strengths && reportCard.strengths.length > 0 && (
             <div className="bg-teal-50 rounded-xl shadow-sm border border-teal-100 p-6">
                <h3 className="text-sm font-black text-teal-800 uppercase tracking-widest mb-4 flex items-center gap-2"><Star size={16} /> Key Strengths</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    {reportCard.strengths.slice(0, 3).map((strength, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-teal-100 flex items-center gap-3">
                            <div className="bg-teal-100 text-teal-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">{i+1}</div>
                            <span className="font-bold text-gray-800 text-sm">{strength}</span>
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* 4. Detailed Stats Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Technical', 'Tactical', 'Physical', 'Psychological'].map((g) => {
                const group = g as StatGroup;
                const stats = reportCard.stats.filter(s => s.group === group);
                if(!stats.length) return null;
                const headerColor = group === 'Technical' ? 'text-blue-900' : group === 'Tactical' ? 'text-purple-900' : group === 'Physical' ? 'text-amber-900' : 'text-teal-900';
                
                // Calculate Section Average
                const avg = (stats.reduce((acc, curr) => acc + curr.value, 0) / stats.length).toFixed(1);

                return (
                    // REMOVED OVERFLOW HIDDEN HERE to fix tooltip
                    <div key={group} className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center group relative cursor-help rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <span className={headerColor}>{getGroupIcon(group)}</span>
                                <h3 className={`font-black uppercase tracking-wide text-sm ${headerColor}`}>{group}</h3>
                                <Info size={12} className="text-gray-400" />
                            </div>
                            <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">{avg}</span>
                             <div className="absolute bottom-full left-0 mb-2 bg-black text-white text-[10px] p-2 rounded w-48 hidden group-hover:block z-50 shadow-xl border border-teal-500/30">
                                {DEFINITIONS[group]}
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {stats.map(stat => (
                                <div key={stat.name} className="group relative">
                                    <div className="flex justify-between items-end mb-1 cursor-help">
                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-tight border-b border-dashed border-gray-300">{stat.name}</span>
                                        <span className={`text-[10px] font-black text-white px-1.5 rounded ${getBarColor(stat.value)}`}>{stat.value}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${getBarColor(stat.value)}`} style={{ width: `${(stat.value/5)*100}%` }}></div>
                                    </div>
                                    {/* Tooltip for specific stat */}
                                    <div className="absolute bottom-full left-0 mb-1 bg-gray-800 text-white text-[9px] p-1.5 rounded w-40 hidden group-hover:block z-40">
                                        {DEFINITIONS[stat.name] || stat.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
        
        {/* 5. Improvements (Modern Expandable Drills) */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
            <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertCircle size={16} /> Improvements & Drills</h3>
            <div className="grid md:grid-cols-2 gap-4">
                {/* Key Area */}
                <div className="border border-amber-100 rounded-xl overflow-hidden transition-all duration-300">
                     <div 
                        onClick={() => handleDrillExpand(reportCard.improvements?.keyArea, 'key')}
                        className="bg-amber-50 p-4 cursor-pointer hover:bg-amber-100 flex justify-between items-center"
                     >
                        <div>
                            <span className="text-[10px] text-amber-600 uppercase font-bold tracking-widest block mb-1">Key Focus Area</span>
                            <p className="text-sm font-bold text-gray-800">{reportCard.improvements?.keyArea}</p>
                        </div>
                        {expandedDrill === 'key' ? <ChevronUp size={16} className="text-amber-600"/> : <ChevronDown size={16} className="text-amber-400"/>}
                     </div>
                     {expandedDrill === 'key' && (
                         <div className="bg-white p-4 text-sm text-gray-600 border-t border-amber-100 animate-in fade-in slide-in-from-top-2">
                             {loadingDrill ? (
                                 <span className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div> Fetching Drill...</span>
                             ) : (
                                 <>
                                     <strong className="block text-amber-800 mb-1 uppercase text-[10px] tracking-wider">Coach Recommended Drill:</strong>
                                     {drillContent}
                                 </>
                             )}
                         </div>
                     )}
                </div>

                {/* Build On Area */}
                <div className="border border-gray-100 rounded-xl overflow-hidden transition-all duration-300">
                     <div 
                        onClick={() => handleDrillExpand(reportCard.improvements?.buildOnArea, 'build')}
                        className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                     >
                        <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Secondary Focus</span>
                            <p className="text-sm font-bold text-gray-800">{reportCard.improvements?.buildOnArea}</p>
                        </div>
                        {expandedDrill === 'build' ? <ChevronUp size={16} className="text-gray-600"/> : <ChevronDown size={16} className="text-gray-400"/>}
                     </div>
                     {expandedDrill === 'build' && (
                         <div className="bg-white p-4 text-sm text-gray-600 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                             {loadingDrill ? (
                                 <span className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div> Fetching Drill...</span>
                             ) : (
                                 <>
                                     <strong className="block text-gray-800 mb-1 uppercase text-[10px] tracking-wider">Coach Recommended Drill:</strong>
                                     {drillContent}
                                 </>
                             )}
                         </div>
                     )}
                </div>
            </div>
        </div>

        {/* 6. Targets */}
        {reportCard.targets && reportCard.targets.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
                 <h3 className="text-sm font-black text-teal-800 uppercase tracking-widest mb-4 flex items-center gap-2"><Target size={16} /> Targets</h3>
                 <div className="space-y-2">
                     {reportCard.targets.map(t => (
                         <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border ${t.achieved ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-100'}`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.achieved ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                                 <Trophy size={14} />
                             </div>
                             <span className={`text-sm font-bold ${t.achieved ? 'text-teal-900' : 'text-gray-500'}`}>{t.description}</span>
                         </div>
                     ))}
                 </div>
            </div>
        )}
        
        {/* 7. Coach Footer Note (New) */}
        {reportCard.coachFooterNote && (
            <div className="bg-black text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl"></div>
                 <h3 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-2 flex items-center gap-2 relative z-10"><PenTool size={14} /> Coach Note</h3>
                 <p className="font-medium italic relative z-10 text-sm">"{reportCard.coachFooterNote}"</p>
            </div>
        )}

        {/* AI Chat */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
           <div className="flex items-center gap-4 mb-4">
              <div className="bg-teal-600 p-3 rounded-xl shadow-lg shadow-teal-900/20"><MessageSquare size={20} className="text-white" /></div>
              <div><h3 className="font-bold text-lg text-gray-900">Coach AI</h3><p className="text-xs text-gray-500">Ask a follow up question</p></div>
           </div>
           {chatResponse && (
              <div className="bg-gray-50 p-4 rounded-xl text-sm leading-relaxed border border-gray-200 mb-4 animate-in fade-in">
                <p className="font-bold text-teal-600 mb-2 text-[10px] uppercase tracking-wider">Coach AI Says:</p>{chatResponse}
              </div>
            )}
            <div className="relative mt-2">
              <input type="text" value={chatQuestion} onChange={(e) => setChatQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAI()} placeholder="Ask about this report..." className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-4 text-sm focus:border-teal-500 outline-none shadow-sm" />
              <button onClick={handleAskAI} disabled={loadingChat} className="absolute right-2 top-2 p-2 bg-black rounded-lg text-white hover:bg-gray-800 disabled:opacity-50">{loadingChat ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={18} />}</button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ReportCardView;
