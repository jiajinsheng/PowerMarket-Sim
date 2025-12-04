import React, { useState } from 'react';
import { Participant, ParticipantType, FuelType } from '../types';
import { Plus, Zap, Factory } from 'lucide-react';

interface ParticipantFormProps {
  onAdd: (p: Participant) => void;
}

const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  [FuelType.SOLAR]: '光伏 (Solar)',
  [FuelType.WIND]: '风电 (Wind)',
  [FuelType.HYDRO]: '水电 (Hydro)',
  [FuelType.NUCLEAR]: '核电 (Nuclear)',
  [FuelType.COAL]: '燃煤 (Coal)',
  [FuelType.GAS]: '燃气 (Gas)',
  [FuelType.BATTERY]: '储能 (Battery)'
};

export const ParticipantForm: React.FC<ParticipantFormProps> = ({ onAdd }) => {
  const [type, setType] = useState<ParticipantType>(ParticipantType.GENERATOR);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [fuel, setFuel] = useState<FuelType>(FuelType.GAS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !capacity || !price) return;

    const newParticipant: Participant = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type,
      capacity: parseFloat(capacity),
      price: parseFloat(price),
      fuelType: type === ParticipantType.GENERATOR ? fuel : undefined,
      color: type === ParticipantType.GENERATOR ? '#10b981' : '#3b82f6'
    };

    onAdd(newParticipant);
    setName('');
    setCapacity('');
    setPrice('');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
        <div className="bg-slate-100 p-1.5 rounded-md text-slate-600">
             <Plus className="w-5 h-5" />
        </div>
        添加市场主体
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          <button
            type="button"
            onClick={() => setType(ParticipantType.GENERATOR)}
            className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              type === ParticipantType.GENERATOR 
                ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Zap className="w-4 h-4" /> 发电侧 (卖方)
          </button>
          <button
            type="button"
            onClick={() => setType(ParticipantType.LOAD)}
            className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              type === ParticipantType.LOAD 
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-100' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Factory className="w-4 h-4" /> 用电侧 (买方)
          </button>
        </div>

        <div className="space-y-4">
            <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">名称</label>
            <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-all placeholder:text-slate-400"
                placeholder={type === ParticipantType.GENERATOR ? "例如：二期光伏电站" : "例如：高新园区负荷"}
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            </div>

            {type === ParticipantType.GENERATOR && (
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">能源类型</label>
                <div className="relative">
                    <select
                        value={fuel}
                        onChange={(e) => setFuel(e.target.value as FuelType)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium appearance-none"
                    >
                        {Object.values(FuelType).map(f => (
                            <option key={f} value={f}>{FUEL_TYPE_LABELS[f]}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">容量 (MW)</label>
                    <input
                    type="number"
                    min="0"
                    step="1"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                    placeholder="100"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        {type === ParticipantType.GENERATOR ? '报价 (¥/MWh)' : '买价 (¥/MWh)'}
                    </label>
                    <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                    placeholder="350.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    />
                </div>
            </div>
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-lg text-sm font-bold shadow-sm transition-all transform active:scale-[0.98] ${
            type === ParticipantType.GENERATOR
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-200'
          }`}
        >
          {type === ParticipantType.GENERATOR ? '添加发电报价' : '添加用电需求'}
        </button>

      </form>
    </div>
  );
};