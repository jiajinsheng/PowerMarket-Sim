import { FuelType, Participant, ParticipantType } from './types';

export const DEFAULT_PARTICIPANTS: Participant[] = [
  // Generators
  { id: 'g1', name: '北部风电场', type: ParticipantType.GENERATOR, fuelType: FuelType.WIND, capacity: 150, price: 0, color: '#22c55e' },
  { id: 'g2', name: '湾区核电站', type: ParticipantType.GENERATOR, fuelType: FuelType.NUCLEAR, capacity: 300, price: 150, color: '#8b5cf6' }, // Adjusted price to be more realistic usually nuclear is cheap marginal cost but lets keep relative logic
  { id: 'g3', name: '第一燃煤电厂', type: ParticipantType.GENERATOR, fuelType: FuelType.COAL, capacity: 200, price: 350, color: '#475569' },
  { id: 'g4', name: '调峰燃气机组 A', type: ParticipantType.GENERATOR, fuelType: FuelType.GAS, capacity: 100, price: 650, color: '#f97316' },
  { id: 'g5', name: '调峰燃气机组 B', type: ParticipantType.GENERATOR, fuelType: FuelType.GAS, capacity: 50, price: 800, color: '#ea580c' },
  
  // Loads (Inelastic and Elastic)
  { id: 'l1', name: '城市基础负荷', type: ParticipantType.LOAD, capacity: 400, price: 2000, color: '#3b82f6' }, // High price = Inelastic
  { id: 'l2', name: '大型制造工厂', type: ParticipantType.LOAD, capacity: 150, price: 700, color: '#2563eb' },
  { id: 'l3', name: '数据中心', type: ParticipantType.LOAD, capacity: 100, price: 1000, color: '#1d4ed8' },
  { id: 'l4', name: '智能充电站', type: ParticipantType.LOAD, capacity: 80, price: 300, color: '#60a5fa' },
];