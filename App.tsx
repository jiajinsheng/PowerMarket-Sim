import React, { useState, useEffect } from 'react';
import { Participant, ClearingResult } from './types';
import { DEFAULT_PARTICIPANTS } from './constants';
import { calculateClearing } from './utils/marketLogic';
import { MarketChart } from './components/MarketChart';
import { ParticipantForm } from './components/ParticipantForm';
import { ResultsTable } from './components/ResultsTable';
import { Activity, RefreshCw, Trash2, Info, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>(DEFAULT_PARTICIPANTS);
  const [clearingResult, setClearingResult] = useState<ClearingResult | null>(null);

  // Auto-calculate on participant change
  useEffect(() => {
    const result = calculateClearing(participants);
    setClearingResult(result);
  }, [participants]);

  const addParticipant = (p: Participant) => {
    setParticipants(prev => [...prev, p]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const resetMarket = () => {
    setParticipants(DEFAULT_PARTICIPANTS);
  };

  const clearAll = () => {
    setParticipants([]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
        <div className="max-w-[1400px] mx-auto px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Activity className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-800 leading-tight">
                PowerMarket <span className="text-indigo-600">Sim</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">Educational Spot Market Clearing Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={resetMarket}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <button 
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clearing Price (MCP)</p>
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">
              ${clearingResult?.clearingPrice.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Per Megawatt-hour</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cleared Volume (MCV)</p>
                <div className="p-1.5 bg-emerald-50 rounded-lg">
                    <Activity className="w-4 h-4 text-emerald-500" />
                </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">
              {clearingResult?.clearedVolume.toFixed(1) || '0.0'} <span className="text-lg text-slate-400 font-bold">MW</span>
            </div>
             <p className="text-xs text-slate-400 mt-1 font-medium">Total Power Traded</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Social Welfare</p>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">
              ${(clearingResult?.marketSurplus || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
             <p className="text-xs text-slate-400 mt-1 font-medium">Consumer + Producer Surplus</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Participants</p>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">
              {participants.length}
            </div>
             <p className="text-xs text-slate-400 mt-1 font-medium">Active Orders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs & Controls */}
          <div className="lg:col-span-4 space-y-6">
            <ParticipantForm onAdd={addParticipant} />
            
            {/* List to Delete Items */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700 text-sm">Active Orders</h3>
                 <span className="text-xs font-medium text-slate-400">{participants.length} items</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                {participants.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No orders in the book yet.
                    </div>
                )}
                {participants.map(p => (
                   <div key={p.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors group">
                     <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${p.type === 'GENERATOR' ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{p.name}</span>
                            <span className="text-xs text-slate-500 font-mono">
                            {p.capacity}MW @ ${p.price}
                            </span>
                        </div>
                     </div>
                     <button 
                      onClick={() => removeParticipant(p.id)}
                      className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visualization & Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Chart Area */}
            {clearingResult && <MarketChart participants={participants} result={clearingResult} />}

            {/* Educational Note */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex gap-4">
              <div className="bg-white p-2 rounded-full h-fit shadow-sm text-indigo-600">
                  <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-900 text-sm mb-1">How Pricing Works (Merit Order Effect)</h4>
                <p className="text-sm text-indigo-800/80 leading-relaxed">
                  The Market Clearing Price (MCP) is set by the intersection of supply and demand. 
                  Generators are stacked from cheapest to most expensive. The last generator needed to meet demand is the <span className="font-bold">Marginal Unit</span>, setting the price for everyone.
                </p>
              </div>
            </div>

            {/* Results Table */}
            <div className="h-[500px]">
              {clearingResult && <ResultsTable participants={participants} result={clearingResult} />}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default App;