export enum ParticipantType {
  GENERATOR = 'GENERATOR',
  LOAD = 'LOAD'
}

export enum FuelType {
  SOLAR = 'SOLAR',
  WIND = 'WIND',
  HYDRO = 'HYDRO',
  NUCLEAR = 'NUCLEAR',
  COAL = 'COAL',
  GAS = 'GAS',
  BATTERY = 'BATTERY'
}

export interface Participant {
  id: string;
  name: string;
  type: ParticipantType;
  fuelType?: FuelType; // Only for generators
  capacity: number; // MW
  price: number; // $/MWh
  color: string;
}

export interface ClearingResult {
  clearingPrice: number;
  clearedVolume: number;
  clearedOrders: ClearedOrder[];
  marketSurplus: number;
  isCongested?: boolean;
}

export interface ClearedOrder {
  participantId: string;
  clearedQuantity: number;
  revenue: number; // For generators
  cost: number; // For loads
  surplus: number;
  isMarginal?: boolean; // True if this unit set the clearing price
}

export interface ChartPoint {
  quantity: number;
  price: number;
  type: 'supply' | 'demand';
  name: string;
}