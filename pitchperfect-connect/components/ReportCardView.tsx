import React, { useState } from 'react';
import { ReportCard, Player, StatGroup } from '../types';
import { Trophy, TrendingUp, AlertCircle, MessageSquare, Send, Calendar, CheckCircle2, User, Footprints, Brain, Zap, Activity } from 'lucide-react';
import { askCoachAI } from '../services/geminiService';

interface ReportCardViewProps {
  reportCard: ReportCard;
  player: Player;
  previousReport?: ReportCard;
  onBack: () => void;
  teamLogo: string;
}

const ReportCardView: React.FC<ReportCardViewProps> = ({ reportCard, player, previousReport, onBack, teamLogo }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  const handleAskAI = async () => {
    if (!chatQuestion.trim()) return;
    setLoadingChat(true);
    setChatResponse('');
    
    try {
      const answer = await askCoachAI(chatQuestion, reportCard, player);
      setChatResponse(answer);
    } catch (error) {
      setChatResponse("Sorry, something went wrong.");
    } finally {
      setLoadingChat(false);
    }
  };

  const getGroupColor = (group: StatGroup) => {
    switch (group) {
      case 'Technical': return 'bg-blue-500';
      case 'Tactical': return 'bg-purple-500';
      case 'Physical': return 'bg-amber-500';
      case 'Psychological': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
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

  const renderStatGroup = (group: StatGroup) => {
    const groupStats = reportCard.stats.filter(s => s.group === group);
    if (groupStats.length === 0) return null;

    const borderColor = group === 'Technical' ? 'border-blue-100' :
                        group === 'Tactical' ? 'border-purple-100' :
                        group === 'Physical' ? 'border-amber-100' : 'border-teal-100';

    const headerColor = group === 'Technical' ? 'text-blue-900' :
                        group === 'Tactical' ? 'text-purple-900' :
                        group === 'Physical' ? 'text-amber-900' : 'text-teal-900';

    return (
      <div key={group} className={`bg-white rounded-xl shadow-sm border ${borderColor} overflow-hidden mb-6 break-inside-avoid`}>
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
          <span className={headerColor}>{getGroupIcon(group)}</span>
          <h3 className={`font-black uppercase tracking-wide text-sm ${headerColor}`}>{group} Evaluation</h3>
        </div>
        <div className="p-5 space-y-4">
          {groupStats.map(stat => (
            <div key={stat.name}>
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{stat.name}</span>
                <span className="text-xs font-black text-gray-900">{stat.value}/100</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${getGroupColor(group)}`} 
                  style={{ width: `${stat.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-20 font-sans bg-gray-100 min-h-screen">
      {/* 1. Header & Player Details */}
      <div className="bg-black text-white pb-12 pt-6 px-4 rounded-b-[3rem] shadow-2xl relative overflow-hidden border-b-4 border-teal-500">
         {/* Background pattern */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
         
         {/* Navigation */}
         <div className="relative z-10 flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-xs text-gray-400 hover:text-white font-bold flex items-center gap-1 transition-colors uppercase tracking-widest">
              &larr; Back to Dashboard
            </button>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-400 tracking-wider">OFFICIAL REPORT</span>
            </div>
         </div>

         {/* Player Details Card */}
         <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 max-w-4xl mx-auto">
             <div className="relative">
                 <img src={player.imageUrl} alt={player.name} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-teal-500 shadow-xl" />
                 <div className="absolute -bottom-2 -right-2 bg-white rounded-full border-2 border-white shadow-md w-8 h-8 overflow-hidden">
                     <img src={teamLogo} className="w-full h-full object-cover" alt="Team Badge" />
                 </div>
             </div>
             
             <div className="flex-1 text-center md:text-left">
                 <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{player.name}</h1>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-white/10 pt-4 mt-2">
                     <div>
                         <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Team</span>
                         <span className="font-bold text-white">{player.ageGroup}</span>
                     </div>
                     <div>
                         <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Term</span>
                         <span className="font-bold text-teal-400">{reportCard.quarter}</span>
                     </div>
                     <div>
                         <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Position</span>
                         <span className="font-bold text-white">{player.position}</span>
                     </div>
                     <div>
                         <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Coach</span>
                         <span className="font-bold text-white">Coach JDA</span>
                     </div>
                 </div>
             </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 space-y-6">
        
        {/* 2. Attendance & Commitment */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 w-full">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar size={14} className="text-teal-500"/> Attendance & Commitment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
                        <span className="block text-2xl font-black text-gray-900">{reportCard.attendance.attendanceScore}/10</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Attendance</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
                        <span className="block text-2xl font-black text-gray-900">{reportCard.attendance.commitmentScore}/10</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Commitment</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 w-full border-l border-gray-100 md:pl-6">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Coach's Note</span>
                <p className="text-sm text-gray-700 italic font-medium">"{reportCard.attendance.note}"</p>
            </div>
        </div>

        {/* 3, 4, 5, 6. Technical, Tactical, Physical, Psychological */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderStatGroup('Technical')}
            {renderStatGroup('Tactical')}
            {renderStatGroup('Physical')}
            {renderStatGroup('Psychological')}
        </div>

        {/* 7 & 8. Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
                <h3 className="text-sm font-black text-teal-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp size={16} /> 3 Key Strengths
                </h3>
                <ul className="space-y-3">
                    {reportCard.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <div className="bg-teal-100 text-teal-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{idx + 1}</div>
                            <span className="text-sm font-bold text-gray-700">{strength}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Improvements */}
            <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
                <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle size={16} /> Areas for Improvement
                </h3>
                <div className="space-y-4">
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <span className="text-[10px] text-amber-600 uppercase font-bold tracking-widest block mb-1">Key Improvement</span>
                        <p className="text-sm font-bold text-gray-800">{reportCard.improvements.keyArea}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Build-on Area</span>
                        <p className="text-sm font-bold text-gray-800">{reportCard.improvements.buildOnArea}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 9. Ratings Summary */}
        <div className="bg-zinc-900 text-white rounded-xl shadow-lg p-6">
             <h3 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <CheckCircle2 size={16} /> Ratings Summary
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 <div className="text-center bg-white/5 rounded-xl p-4 border border-white/10">
                     <span className="block text-3xl font-black text-white">{reportCard.ratingsSummary.applicationScore}/10</span>
                     <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-2 block">Application &<br/>Understanding</span>
                 </div>
                 <div className="text-center bg-white/5 rounded-xl p-4 border border-white/10">
                     <span className="block text-3xl font-black text-white">{reportCard.ratingsSummary.behaviourScore}/10</span>
                     <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-2 block">Behaviour &<br/>Attitude</span>
                 </div>
                 <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col justify-center">
                      <span className="text-[10px] text-teal-400 uppercase font-bold tracking-wider mb-2">Coach Comment</span>
                      <p className="text-sm font-medium italic text-gray-300">"{reportCard.ratingsSummary.coachComment}"</p>
                 </div>
             </div>
        </div>

        {/* 10. Final Paragraph */}
        <div className="bg-white border-l-4 border-black rounded-r-xl shadow-sm p-8">
            <h3 className="font-black text-black mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                <User size={16} /> Coach's Final Summary
            </h3>
            <p className="text-gray-800 leading-7 font-medium text-justify">
                {reportCard.finalSummary}
            </p>
            <div className="mt-6 flex justify-end">
                 <div className="text-right">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png" className="h-8 opacity-50 ml-auto mb-1" alt="Signature" />
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Head Coach, JDA Academy</p>
                 </div>
            </div>
        </div>
        
         {/* AI Assistant */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
           <div className="bg-teal-600 p-3 rounded-xl shadow-lg shadow-teal-900/20">
             <MessageSquare size={20} className="text-white" />
           </div>
           <div>
             <h3 className="font-bold text-lg text-gray-900">Coach AI Assistant</h3>
             <p className="text-xs text-gray-500">Ask about this specific report</p>
           </div>
        </div>
        
        {chatResponse && (
           <div className="bg-gray-50 p-4 rounded-xl text-sm leading-relaxed border border-gray-200 mb-4 animate-in fade-in">
             <p className="font-bold text-teal-600 mb-2 text-[10px] uppercase tracking-wider">Coach AI Says:</p>
             {chatResponse}
           </div>
         )}

         <div className="relative mt-2">
           <input 
             type="text" 
             value={chatQuestion}
             onChange={(e) => setChatQuestion(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
             placeholder="How can he improve his defensive positioning?"
             className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium shadow-sm"
           />
           <button 
             onClick={handleAskAI}
             disabled={loadingChat}
             className="absolute right-2 top-2 p-2 bg-black rounded-lg text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
           >
             {loadingChat ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : (
               <Send size={18} />
             )}
           </button>
         </div>
      </div>

      </div>
    </div>
  );
};

export default ReportCardView;