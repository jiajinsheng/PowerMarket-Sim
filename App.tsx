import React, { useState, useEffect } from 'react';
import { Participant, ClearingResult } from './types';
import { DEFAULT_PARTICIPANTS } from './constants';
import { calculateClearing } from './utils/marketLogic';
import { MarketChart } from './components/MarketChart';
import { ParticipantForm } from './components/ParticipantForm';
import { ResultsTable } from './components/ResultsTable';
import { Activity, RefreshCw, Trash2, Info } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              PowerMarket Sim
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={resetMarket}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reset Scenario
            </button>
            <button 
              onClick={clearAll}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Clearing Price (MCP)</p>
            <div className="text-2xl font-bold text-slate-900">
              ${clearingResult?.clearingPrice.toFixed(2) || '0.00'}
              <span className="text-sm font-normal text-slate-400 ml-1">/MWh</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Volume (MCV)</p>
            <div className="text-2xl font-bold text-slate-900">
              {clearingResult?.clearedVolume.toFixed(1) || '0.0'}
              <span className="text-sm font-normal text-slate-400 ml-1">MW</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Market Welfare</p>
            <div className="text-2xl font-bold text-emerald-600">
              ${(clearingResult?.marketSurplus || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <p className="text-sm font-medium text-slate-500 mb-1">Participants</p>
            <div className="text-2xl font-bold text-slate-900">
              {participants.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs & Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="h-fit">
              <ParticipantForm onAdd={addParticipant} />
            </div>
            
            {/* Mini List to Delete Items */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">Active Orders</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {participants.length === 0 && <p className="text-sm text-slate-400 italic">No participants yet.</p>}
                {participants.map(p => (
                   <div key={p.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all group">
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{p.name}</span>
                        <span className="text-xs text-slate-500">
                          {p.type === 'GENERATOR' ? 'Offer' : 'Bid'}: {p.capacity}MW @ ${p.price}
                        </span>
                     </div>
                     <button 
                      onClick={() => removeParticipant(p.id)}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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

            {/* Note Area */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
              <Info className="w-5 h-5 shrink-0" />
              <p>
                <strong>Educational Tip:</strong> The intersection of Supply (Green) and Demand (Blue) determines the Market Clearing Price. 
                Generators offering <em>below</em> this price are dispatched. Loads bidding <em>above</em> this price are served.
              </p>
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