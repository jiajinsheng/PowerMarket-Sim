import { FuelType, Participant, ParticipantType } from './types';

export const DEFAULT_PARTICIPANTS: Participant[] = [
  // Generators
  { id: 'g1', name: 'Wind Farm North', type: ParticipantType.GENERATOR, fuelType: FuelType.WIND, capacity: 150, price: 0, color: '#22c55e' },
  { id: 'g2', name: 'Nuclear Base', type: ParticipantType.GENERATOR, fuelType: FuelType.NUCLEAR, capacity: 300, price: 15, color: '#8b5cf6' },
  { id: 'g3', name: 'Coal Plant A', type: ParticipantType.GENERATOR, fuelType: FuelType.COAL, capacity: 200, price: 35, color: '#475569' },
  { id: 'g4', name: 'Gas Peaker 1', type: ParticipantType.GENERATOR, fuelType: FuelType.GAS, capacity: 100, price: 65, color: '#f97316' },
  { id: 'g5', name: 'Gas Peaker 2', type: ParticipantType.GENERATOR, fuelType: FuelType.GAS, capacity: 50, price: 80, color: '#ea580c' },
  
  // Loads (Inelastic and Elastic)
  { id: 'l1', name: 'City Base Load', type: ParticipantType.LOAD, capacity: 400, price: 2000, color: '#3b82f6' }, // High price = Inelastic
  { id: 'l2', name: 'Industrial Factory', type: ParticipantType.LOAD, capacity: 150, price: 70, color: '#2563eb' },
  { id: 'l3', name: 'Data Center', type: ParticipantType.LOAD, capacity: 100, price: 100, color: '#1d4ed8' },
  { id: 'l4', name: 'Smart Charging', type: ParticipantType.LOAD, capacity: 80, price: 30, color: '#60a5fa' },
];