import React, { useState } from 'react';
import { Participant, ParticipantType, FuelType } from '../types';
import { Plus, Zap, Factory } from 'lucide-react';

interface ParticipantFormProps {
  onAdd: (p: Participant) => void;
}

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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-indigo-600" />
        Add Market Order
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Type Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setType(ParticipantType.GENERATOR)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
              type === ParticipantType.GENERATOR 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" /> Generator
          </button>
          <button
            type="button"
            onClick={() => setType(ParticipantType.LOAD)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
              type === ParticipantType.LOAD 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Factory className="w-4 h-4" /> Load
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            placeholder={type === ParticipantType.GENERATOR ? "e.g. Solar Farm A" : "e.g. City Grid"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {type === ParticipantType.GENERATOR && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
            <select
              value={fuel}
              onChange={(e) => setFuel(e.target.value as FuelType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {Object.values(FuelType).map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity (MW)</label>
            <input
              type="number"
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="100"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {type === ParticipantType.GENERATOR ? 'Offer Price ($)' : 'Bid Price ($)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="50.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Add {type === ParticipantType.GENERATOR ? 'Offer' : 'Bid'}
        </button>

      </form>
    </div>
  );
};