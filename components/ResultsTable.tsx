import React from 'react';
import { Participant, ClearingResult, ParticipantType } from '../types';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, Zap, Factory } from 'lucide-react';

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
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Order Book & Settlement</h3>
        <div className="text-xs text-slate-500">Sorted by Merit Order</div>
      </div>
      
      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 text-right">Bid/Offer ($)</th>
              <th className="px-4 py-3 text-right">Capacity (MW)</th>
              <th className="px-4 py-3 text-right">Cleared (MW)</th>
              <th className="px-4 py-3 text-right">Cashflow ($)</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedParticipants.map((p) => {
              const clearedData = result.clearedOrders.find(co => co.participantId === p.id);
              const isCleared = clearedData && clearedData.clearedQuantity > 0;
              const isPartial = isCleared && clearedData.clearedQuantity < p.capacity;
              
              // Cashflow: For Gen = Revenue, For Load = Cost
              const cashflow = p.type === ParticipantType.GENERATOR 
                ? (clearedData?.revenue || 0)
                : -(clearedData?.cost || 0);

              return (
                <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${isCleared ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                      p.type === ParticipantType.GENERATOR 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {p.type === ParticipantType.GENERATOR ? <Zap className="w-3 h-3" /> : <Factory className="w-3 h-3" />}
                      {p.type === ParticipantType.GENERATOR ? 'GEN' : 'LOAD'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {p.name}
                    {p.fuelType && <span className="ml-2 text-xs text-slate-400 font-normal">({p.fuelType})</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">{p.capacity}</td>
                  <td className={`px-4 py-3 text-right font-mono font-bold ${isCleared ? 'text-slate-800' : 'text-slate-300'}`}>
                    {clearedData?.clearedQuantity.toFixed(1) || '0.0'}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${cashflow > 0 ? 'text-emerald-600' : cashflow < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                   {cashflow !== 0 ? (cashflow > 0 ? '+' : '-') : ''}${Math.abs(cashflow).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isCleared ? (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${isPartial ? 'text-amber-600' : 'text-emerald-600'}`}>
                        <CheckCircle2 className="w-4 h-4" />
                        {isPartial ? 'Partial' : 'Cleared'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                        <XCircle className="w-4 h-4" />
                        Rejected
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