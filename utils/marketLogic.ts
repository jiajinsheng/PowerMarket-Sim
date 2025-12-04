import { Participant, ParticipantType, ClearingResult, ClearedOrder } from '../types';

export const calculateClearing = (participants: Participant[]): ClearingResult => {
  const generators = participants
    .filter(p => p.type === ParticipantType.GENERATOR)
    .sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));

  const loads = participants
    .filter(p => p.type === ParticipantType.LOAD)
    .sort((a, b) => b.price - a.price || a.id.localeCompare(b.id));

  let clearedVolume = 0;
  let clearingPrice = 0;
  
  // Market Clearing Logic: Intersection of Supply and Demand
  let i = 0; // gen index
  let j = 0; // load index
  let genRem = generators.length > 0 ? generators[0].capacity : 0;
  let loadRem = loads.length > 0 ? loads[0].capacity : 0;
  let marginalGenId: string | null = null;
  
  while (i < generators.length && j < loads.length) {
    const g = generators[i];
    const l = loads[j];

    // Check if trade is economically feasible (Bid >= Offer)
    if (l.price >= g.price) {
      const tradeQ = Math.min(genRem, loadRem);
      clearedVolume += tradeQ;
      
      // In this simple model, the System Marginal Price (SMP) is set by the highest accepted offer (Supply side)
      clearingPrice = g.price; 
      marginalGenId = g.id;
      
      genRem -= tradeQ;
      loadRem -= tradeQ;

      // Move to next generator if this one is fully dispatched
      if (genRem <= 0.001) {
        i++;
        if (i < generators.length) genRem = generators[i].capacity;
      }
      // Move to next load if this one is fully served
      if (loadRem <= 0.001) {
        j++;
        if (j < loads.length) loadRem = loads[j].capacity;
      }
    } else {
      // Intersection reached: Next cheapest generator is more expensive than next highest willingness-to-pay
      break;
    }
  }

  // Handle case where we have 0 clearing
  if (clearedVolume === 0) {
      // If no intersection, price logic varies. Usually average of bid/ask spread or 0.
      // We will default to 0 for simplicity.
      clearingPrice = 0;
  }

  // Calculate detailed results for each participant
  const clearedOrders: ClearedOrder[] = [];

  // Allocate to Generators (Merit Order)
  let vAcc = 0;
  for (const gen of generators) {
    if (vAcc >= clearedVolume - 0.001) {
      clearedOrders.push({ participantId: gen.id, clearedQuantity: 0, revenue: 0, cost: 0, surplus: 0, isMarginal: false });
      continue;
    }
    const q = Math.min(gen.capacity, clearedVolume - vAcc);
    const revenue = q * clearingPrice;
    const surplus = revenue - (q * gen.price); // Producer surplus
    
    // Check if this is the marginal unit (simplified check)
    const isMarginal = gen.id === marginalGenId;

    clearedOrders.push({
      participantId: gen.id,
      clearedQuantity: q,
      revenue,
      cost: 0,
      surplus,
      isMarginal
    });
    vAcc += q;
  }

  // Allocate to Loads (High WTP first)
  vAcc = 0;
  for (const load of loads) {
    if (vAcc >= clearedVolume - 0.001) {
      clearedOrders.push({ participantId: load.id, clearedQuantity: 0, revenue: 0, cost: 0, surplus: 0 });
      continue;
    }
    const q = Math.min(load.capacity, clearedVolume - vAcc);
    const cost = q * clearingPrice;
    const surplus = (q * load.price) - cost; // Consumer surplus
    clearedOrders.push({
      participantId: load.id,
      clearedQuantity: q,
      revenue: 0,
      cost,
      surplus
    });
    vAcc += q;
  }

  return {
    clearingPrice,
    clearedVolume,
    clearedOrders,
    marketSurplus: clearedOrders.reduce((acc, curr) => acc + curr.surplus, 0)
  };
};

export const generateChartData = (participants: Participant[], clearingResult: ClearingResult) => {
    const generators = participants
    .filter(p => p.type === ParticipantType.GENERATOR)
    .sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));

  const loads = participants
    .filter(p => p.type === ParticipantType.LOAD)
    .sort((a, b) => b.price - a.price || a.id.localeCompare(b.id));

  // Construct Explicit Step Data for Linear Interpolation
  // Supply: (0, P1) -> (Q1, P1) -> (Q1, P2) -> (Q1+Q2, P2) ...
  const supplyData = [];
  let sAcc = 0;
  
  if(generators.length > 0) {
      supplyData.push({ x: 0, y: generators[0].price, name: generators[0].name }); // Start point
      for (const g of generators) {
        supplyData.push({ x: sAcc, y: g.price, name: g.name }); // Step Start (Vertical rise happens before this if not first)
        sAcc += g.capacity;
        supplyData.push({ x: sAcc, y: g.price, name: g.name }); // Step End (Horizontal line)
      }
      // Extend slightly to show the end of the last block
      supplyData.push({ x: sAcc, y: generators[generators.length-1].price * 1.5, name: 'End Supply' }); 
  }

  const demandData = [];
  let dAcc = 0;
  if(loads.length > 0) {
      demandData.push({ x: 0, y: loads[0].price, name: loads[0].name }); // Start
      for (const l of loads) {
        demandData.push({ x: dAcc, y: l.price, name: l.name });
        dAcc += l.capacity;
        demandData.push({ x: dAcc, y: l.price, name: l.name });
      }
      // Drop to zero at the end
      demandData.push({ x: dAcc, y: 0, name: 'End Demand' });
  }
  
  const maxQ = Math.max(sAcc, dAcc) * 1.1;
  
  return { supplyData, demandData, maxQ };
};