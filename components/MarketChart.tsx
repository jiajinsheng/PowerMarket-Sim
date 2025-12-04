import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  Area
} from 'recharts';
import { Participant, ClearingResult } from '../types';
import { generateChartData } from '../utils/marketLogic';

interface MarketChartProps {
  participants: Participant[];
  result: ClearingResult;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
        <p className="font-bold text-slate-700">Quantity: {label} MW</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: ${entry.value?.toFixed(2)}/MWh
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const MarketChart: React.FC<MarketChartProps> = ({ participants, result }) => {
  const { supplyData, demandData, maxQ } = useMemo(() => generateChartData(participants, result), [participants, result]);
  
  // We need to merge data for ComposedChart or plot two separate lines. 
  // ComposedChart with type="number" on XAxis allows arbitrary x-coordinates.

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Market Clearing Diagram</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="x" 
            type="number" 
            label={{ value: 'Quantity (MW)', position: 'insideBottom', offset: -10 }} 
            domain={[0, 'dataMax']}
            allowDataOverflow={false}
          />
          <YAxis 
            label={{ value: 'Price ($/MWh)', angle: -90, position: 'insideLeft' }} 
            domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36}/>
          
          {/* Supply Curve */}
          <Line 
            data={supplyData} 
            dataKey="y" 
            name="Supply Offer" 
            stroke="#10b981" 
            strokeWidth={3} 
            dot={false} 
            type="stepAfter"
            isAnimationActive={false}
          />

          {/* Demand Curve */}
          <Line 
            data={demandData} 
            dataKey="y" 
            name="Demand Bid" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={false} 
            type="stepAfter"
            isAnimationActive={false}
          />

          {/* Clearing Point */}
          {result.clearedVolume > 0 && (
            <ReferenceDot 
              x={result.clearedVolume} 
              y={result.clearingPrice} 
              r={6} 
              fill="#f59e0b" 
              stroke="none"
            />
          )}
           {result.clearedVolume > 0 && (
             <ReferenceLine x={result.clearedVolume} stroke="#94a3b8" strokeDasharray="3 3" label="MCV" />
           )}
           {result.clearedVolume > 0 && (
             <ReferenceLine y={result.clearingPrice} stroke="#94a3b8" strokeDasharray="3 3" label="MCP" />
           )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};