import React, { useState } from 'react';
import { ReportCard, Player, StatGroup } from '../types';
import { Trophy, TrendingUp, AlertCircle, MessageSquare, Send, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { askCoachAI } from '../services/geminiService';

interface ReportCardViewProps {
  reportCard: ReportCard;
  player: Player;
  previousReport?: ReportCard;
  onBack: () => void;
}

const ReportCardView: React.FC<ReportCardViewProps> = ({ reportCard, player, previousReport, onBack }) => {
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
    // Keeping category colors but muting them slightly to fit the sleeker theme
    switch (group) {
      case 'Attacking': return 'bg-blue-500';
      case 'Defending': return 'bg-red-500';
      case 'Physical': return 'bg-amber-500';
      case 'Mental': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const renderStatGroup = (group: StatGroup) => {
    const groupStats = reportCard.stats.filter(s => s.group === group);
    if (groupStats.length === 0) return null;

    // Calculate group average
    const currentAvg = Math.round(groupStats.reduce((acc, s) => acc + s.value, 0) / groupStats.length);
    let prevAvg = 0;
    
    if (previousReport) {
       const prevGroupStats = previousReport.stats.filter(s => s.group === group);
       if (prevGroupStats.length > 0) {
         prevAvg = Math.round(prevGroupStats.reduce((acc, s) => acc + s.value, 0) / prevGroupStats.length);
       }
    }

    const diff = previousReport ? currentAvg - prevAvg : 0;

    const borderColor = group === 'Attacking' ? 'border-blue-100' :
                        group === 'Defending' ? 'border-red-100' :
                        group === 'Physical' ? 'border-amber-100' : 'border-purple-100';

    const headerColor = group === 'Attacking' ? 'text-blue-900' :
                        group === 'Defending' ? 'text-red-900' :
                        group === 'Physical' ? 'text-amber-900' : 'text-purple-900';

    return (
      <div key={group} className={`bg-white rounded-2xl shadow-sm border ${borderColor} overflow-hidden mb-6`}>
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className={`font-black uppercase tracking-wide text-sm ${headerColor}`}>{group}</h3>
          <div className="flex items-center gap-3">
             {previousReport && (
                <div className={`flex items-center text-xs font-bold ${diff > 0 ? 'text-teal-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {diff > 0 ? <ArrowUp size={12} strokeWidth={3} /> : diff < 0 ? <ArrowDown size={12} strokeWidth={3} /> : <Minus size={12} />}
                  {Math.abs(diff) > 0 && <span>{Math.abs(diff)}</span>}
                </div>
             )}
             <div className="bg-black text-white px-2.5 py-1 rounded-md text-sm font-bold shadow-sm">
               {currentAvg}
             </div>
          </div>
        </div>
        <div className="p-5 space-y-5">
          {groupStats.map(stat => {
            const prevStat = previousReport?.stats.find(s => s.name === stat.name && s.group === group);
            const statDiff = prevStat ? stat.value - prevStat.value : 0;

            return (
              <div key={stat.name}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.name}</span>
                  <div className="flex items-center gap-2">
                     {previousReport && statDiff !== 0 && (
                       <span className={`text-[10px] flex items-center ${statDiff > 0 ? 'text-teal-500' : 'text-red-500'}`}>
                         {statDiff > 0 ? <ArrowUp size={10} strokeWidth={3} /> : <ArrowDown size={10} strokeWidth={3} />}
                       </span>
                     )}
                     <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getGroupColor(group)}`} 
                    style={{ width: `${stat.value}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-20 font-sans">
      {/* Header / Nav */}
      <div className="flex items-center gap-2 mb-6 pt-4 pl-4">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-black font-bold flex items-center gap-1 transition-colors">
          &larr; BACK
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 px-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tighter uppercase">{reportCard.season} <span className="text-teal-500">{reportCard.quarter}</span></h1>
          <p className="text-gray-400 font-medium text-sm">Issued: {new Date(reportCard.date).toLocaleDateString()}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <div className="text-right">
            <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-widest">Overall Rating</span>
            <span className="text-4xl font-black text-teal-600">{reportCard.overallRating}</span>
          </div>
          <div className="h-14 w-14 rounded-full border-4 border-black flex items-center justify-center bg-black text-teal-400 shadow-xl">
            <Trophy size={24} />
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white border-l-4 border-teal-500 rounded-r-xl shadow-sm p-6 mb-8 mx-4">
        <h3 className="font-black text-black mb-3 text-xs uppercase tracking-widest">Coach's Summary</h3>
        <p className="text-gray-700 leading-relaxed font-medium">"{reportCard.summary}"</p>
      </div>

      {/* Stats Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 px-4">
        {renderStatGroup('Attacking')}
        {renderStatGroup('Defending')}
        {renderStatGroup('Physical')}
        {renderStatGroup('Mental')}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 px-4">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h4 className="text-sm font-black text-teal-700 mb-4 flex items-center gap-2 uppercase tracking-wide">
             <TrendingUp size={18} /> Key Strengths
           </h4>
           <ul className="space-y-3">
             {reportCard.strengths.map((s, i) => (
               <li key={i} className="text-sm text-gray-700 flex items-start gap-3 font-medium">
                 <div className="min-w-[6px] h-[6px] mt-1.5 rounded-full bg-teal-400"></div>
                 {s}
               </li>
             ))}
           </ul>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h4 className="text-sm font-black text-amber-700 mb-4 flex items-center gap-2 uppercase tracking-wide">
             <AlertCircle size={18} /> Improvements
           </h4>
           <ul className="space-y-3">
             {reportCard.improvements.map((s, i) => (
               <li key={i} className="text-sm text-gray-700 flex items-start gap-3 font-medium">
                 <div className="min-w-[6px] h-[6px] mt-1.5 rounded-full bg-amber-400"></div>
                 {s}
               </li>
             ))}
           </ul>
         </div>
      </div>

      {/* AI Assistant - Floating or Section */}
      <div className="bg-black rounded-2xl p-6 text-white shadow-2xl mx-4 border border-zinc-800">
        <div className="flex items-center gap-4 mb-4">
           <div className="bg-teal-600 p-3 rounded-xl shadow-lg shadow-teal-900/20">
             <MessageSquare size={20} className="text-white" />
           </div>
           <div>
             <h3 className="font-bold text-lg">Coach AI Assistant</h3>
             <p className="text-xs text-gray-400">Ask about this specific report</p>
           </div>
        </div>
        
        {chatResponse && (
           <div className="bg-zinc-900 p-4 rounded-xl text-sm leading-relaxed border border-zinc-800 mb-4 animate-in fade-in">
             <p className="font-bold text-teal-400 mb-2 text-[10px] uppercase tracking-wider">Coach AI Says:</p>
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
             className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-4 pr-12 py-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium"
           />
           <button 
             onClick={handleAskAI}
             disabled={loadingChat}
             className="absolute right-2 top-2 p-2 bg-teal-600 rounded-lg text-white hover:bg-teal-500 disabled:opacity-50 transition-colors"
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
  );
};

export default ReportCardView;