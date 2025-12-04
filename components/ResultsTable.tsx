import React from 'react';
import { Participant, ClearingResult, ParticipantType } from '../types';
import { CheckCircle2, XCircle, Zap, Factory, AlertCircle } from 'lucide-react';

interface ResultsTableProps {
  participants: Participant[];
  result: ClearingResult;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ participants, result }) => {
  // Sort participants by merit order for better display
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.type !== b.type) return a.type === ParticipantType.GENERATOR ? -1 : 1;
    if (a.type === ParticipantType.GENERATOR) return a.price - b.price;
    return b.price - a.price;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 bg-white flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Market Order Book</h3>
        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Sorted by Merit Order</div>
      </div>
      
      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-3">Participant</th>
              <th className="px-6 py-3 text-right">Price ($/MWh)</th>
              <th className="px-6 py-3 text-right">Capacity (MW)</th>
              <th className="px-6 py-3 text-right">Cleared (MW)</th>
              <th className="px-6 py-3 text-right">Surplus ($)</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedParticipants.map((p) => {
              const clearedData = result.clearedOrders.find(co => co.participantId === p.id);
              const isCleared = clearedData && clearedData.clearedQuantity > 0;
              const isPartial = isCleared && clearedData.clearedQuantity < p.capacity;
              const isMarginal = clearedData?.isMarginal;

              return (
                <tr key={p.id} className={`group hover:bg-slate-50 transition-colors ${isMarginal ? 'bg-amber-50/50' : ''}`}>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            p.type === ParticipantType.GENERATOR ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {p.type === ParticipantType.GENERATOR ? <Zap className="w-4 h-4" /> : <Factory className="w-4 h-4" />}
                        </div>
                        <div>
                            <div className="font-semibold text-slate-700 flex items-center gap-2">
                                {p.name}
                                {isMarginal && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">
                                        Marginal
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                                {p.type === ParticipantType.GENERATOR ? p.fuelType : 'Consumer'}
                            </div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-slate-600">
                    ${p.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-slate-600 opacity-80">
                    {p.capacity}
                  </td>
                  <td className={`px-6 py-3.5 text-right font-mono font-bold ${isCleared ? 'text-slate-800' : 'text-slate-300'}`}>
                    {clearedData?.clearedQuantity.toFixed(1) || '0.0'}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-slate-600">
                    {isCleared ? `$${clearedData?.surplus.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}` : '-'}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    {isCleared ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          isPartial 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isPartial ? 'Partial' : 'Cleared'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                        <XCircle className="w-3.5 h-3.5" />
                        Missed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};