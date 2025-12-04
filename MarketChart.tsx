import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { Participant, ClearingResult } from './types';
import { generateChartData } from './marketLogic';

interface MarketChartProps {
  participants: Participant[];
  result: ClearingResult;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-sm z-50">
        <p className="font-bold text-slate-700 mb-1">电量: {label.toFixed(1)} MW</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-slate-600 font-medium">{entry.name}:</span>
            <span className="text-slate-900 font-mono">¥{entry.value?.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const MarketChart: React.FC<MarketChartProps> = ({ participants, result }) => {
  const { supplyData, demandData } = useMemo(() => generateChartData(participants, result), [participants, result]);
  
  return (
    <div className="w-full h-[400px] bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">供给与需求曲线 (Supply & Demand)</h3>
        <div className="flex gap-4 text-xs font-medium">
           <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> 供给曲线 (卖方报价)
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 bg-blue-500 rounded-sm"></div> 需求曲线 (买方意愿)
           </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="x" 
            type="number" 
            label={{ value: '容量 / 电量 (MW)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }} 
            domain={[0, 'dataMax']}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis 
            label={{ value: '价格 (¥/MWh)', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b', fontSize: 12 }} 
            domain={[0, 'auto']}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
          
          {/* Supply Curve - Linear used because data contains explicit step corners */}
          <Line 
            data={supplyData} 
            dataKey="y" 
            name="供给" 
            stroke="#10b981" 
            strokeWidth={2.5} 
            dot={false} 
            type="linear" 
            isAnimationActive={false}
            fillOpacity={1}
            fill="url(#colorSupply)"
          />

          {/* Demand Curve */}
          <Line 
            data={demandData} 
            dataKey="y" 
            name="需求" 
            stroke="#3b82f6" 
            strokeWidth={2.5} 
            dot={false} 
            type="linear" 
            isAnimationActive={false}
          />

          {/* Clearing Point Visualization */}
          {result.clearedVolume > 0 && (
            <>
              <ReferenceLine x={result.clearedVolume} stroke="#f59e0b" strokeDasharray="3 3" />
              <ReferenceLine y={result.clearingPrice} stroke="#f59e0b" strokeDasharray="3 3" />
              <ReferenceDot 
                x={result.clearedVolume} 
                y={result.clearingPrice} 
                r={6} 
                fill="#fff" 
                stroke="#f59e0b"
                strokeWidth={3}
              />
            </>
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};