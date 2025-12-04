import { Participant, ParticipantType, ClearingResult, ClearedOrder } from '../types';

export const calculateClearing = (participants: Participant[]): ClearingResult => {
  const generators = participants
    .filter(p => p.type === ParticipantType.GENERATOR)
    .sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));

  const loads = participants
    .filter(p => p.type === ParticipantType.LOAD)
    .sort((a, b) => b.price - a.price || a.id.localeCompare(b.id));

  // Construct Cumulative Supply Curve
  let cumulativeSupply: { mw: number; price: number; generator: Participant }[] = [];
  let currentSupplyMW = 0;
  generators.forEach(gen => {
    currentSupplyMW += gen.capacity;
    cumulativeSupply.push({ mw: currentSupplyMW, price: gen.price, generator: gen });
  });

  // Construct Cumulative Demand Curve
  let cumulativeDemand: { mw: number; price: number; load: Participant }[] = [];
  let currentDemandMW = 0;
  loads.forEach(load => {
    currentDemandMW += load.capacity;
    cumulativeDemand.push({ mw: currentDemandMW, price: load.price, load: load });
  });

  // Find Intersection
  let mcp = 0;
  let mcv = 0;
  let intersectionFound = false;

  // We walk through the demand curve and find where it intersects the supply curve
  // This is a simplified discrete intersection logic suitable for step functions
  
  // Total potential demand
  const maxDemand = currentDemandMW;
  const maxSupply = currentSupplyMW;
  
  // If no supply or no demand
  if (generators.length === 0 || loads.length === 0) {
    return {
      clearingPrice: 0,
      clearedVolume: 0,
      clearedOrders: [],
      marketSurplus: 0
    };
  }

  // Iterate to find intersection
  // We check overlaps of supply and demand blocks
  let sIndex = 0;
  let dIndex = 0;
  let sCum = 0;
  let dCum = 0;

  while (sIndex < generators.length && dIndex < loads.length) {
    const supply = generators[sIndex];
    const demand = loads[dIndex];

    // If lowest willingness to pay is less than lowest offer, market closes immediately or doesn't clear further
    if (demand.price < supply.price) {
      break;
    }

    // Determine the overlapping quantity in this step
    const sRem = supply.capacity - (sCum - (sIndex > 0 ? getPrevSum(generators, sIndex) : 0)); // This logic is complex, let's simplify.
    // Simpler approach: compare cumulative curves.
    
    // Let's use a fine-grained step simulation or simply geometric intersection of steps.
    // Supply curve is defined by (TotalQ, Price). 
    // Demand curve is defined by (TotalQ, Price).
    
    // Let's trace the curves.
    // Intersection happens when Supply Price > Demand Price.
    // The MCP is usually set by the marginal unit (Supply Price).
  }

  // Robust algorithm:
  // 1. Combine all limit points.
  // 2. Or easier for this specific problem: 
  //    Sort all Generators Ascending.
  //    Sort all Loads Descending.
  //    Match them one by one MW.
  
  let clearedVolume = 0;
  let clearingPrice = 0;
  
  // Create granular steps (or just process block by block)
  let i = 0; // gen index
  let j = 0; // load index
  let genRem = generators.length > 0 ? generators[0].capacity : 0;
  let loadRem = loads.length > 0 ? loads[0].capacity : 0;
  
  while (i < generators.length && j < loads.length) {
    const g = generators[i];
    const l = loads[j];

    if (l.price >= g.price) {
      // Trade is feasible
      const tradeQ = Math.min(genRem, loadRem);
      clearedVolume += tradeQ;
      
      // Update marginal price to the generator's offer price (System Marginal Price logic)
      // Note: In some markets it's the intersection mid-point, but usually SMP is the highest accepted offer.
      clearingPrice = g.price; 
      
      genRem -= tradeQ;
      loadRem -= tradeQ;

      if (genRem <= 0.001) {
        i++;
        if (i < generators.length) genRem = generators[i].capacity;
      }
      if (loadRem <= 0.001) {
        j++;
        if (j < loads.length) loadRem = loads[j].capacity;
      }
    } else {
      // Demand price is lower than Supply price, no more trades
      break;
    }
  }

  // If we ran out of demand but there is still supply, price is set by the last cleared generator (already set).
  // If we ran out of supply but there is still demand willing to pay, price could spike (scarcity), 
  // but for this simple model, we stick to the last accepted offer.

  // Determine individual cleared quantities
  const clearedOrders: ClearedOrder[] = [];
  let allocatedV = 0;
  let marketSurplus = 0;

  // Allocate to Generators (Merit Order)
  let vAcc = 0;
  for (const gen of generators) {
    if (vAcc >= clearedVolume) {
      clearedOrders.push({ participantId: gen.id, clearedQuantity: 0, revenue: 0, cost: 0, surplus: 0 });
      continue;
    }
    const q = Math.min(gen.capacity, clearedVolume - vAcc);
    const revenue = q * clearingPrice;
    const surplus = revenue - (q * gen.price); // Producer surplus
    clearedOrders.push({
      participantId: gen.id,
      clearedQuantity: q,
      revenue,
      cost: 0,
      surplus
    });
    vAcc += q;
  }

  // Allocate to Loads (High WTP first)
  vAcc = 0;
  for (const load of loads) {
    if (vAcc >= clearedVolume) {
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

function getPrevSum(list: Participant[], idx: number) {
  return list.slice(0, idx).reduce((sum, p) => sum + p.capacity, 0);
}

// Generate data for Recharts Stepped Area
export const generateChartData = (participants: Participant[], clearingResult: ClearingResult) => {
    const generators = participants
    .filter(p => p.type === ParticipantType.GENERATOR)
    .sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));

  const loads = participants
    .filter(p => p.type === ParticipantType.LOAD)
    .sort((a, b) => b.price - a.price || a.id.localeCompare(b.id));

  const dataPoints: any[] = [];

  // We need to create a unified x-axis (Quantity) that includes all step changes for both supply and demand
  let supplyCum = 0;
  const supplySteps = generators.map(g => {
    const start = supplyCum;
    supplyCum += g.capacity;
    return { start, end: supplyCum, price: g.price, name: g.name };
  });

  let demandCum = 0;
  const demandSteps = loads.map(l => {
    const start = demandCum;
    demandCum += l.capacity;
    return { start, end: demandCum, price: l.price, name: l.name };
  });

  // Max width
  const maxQ = Math.max(supplyCum, demandCum) * 1.1;

  // Create sample points. 
  // For a stepped chart, we can just push points at every transition.
  const criticalPoints = new Set<number>();
  criticalPoints.add(0);
  supplySteps.forEach(s => { criticalPoints.add(s.start); criticalPoints.add(s.end); });
  demandSteps.forEach(d => { criticalPoints.add(d.start); criticalPoints.add(d.end); });
  
  const sortedPoints = Array.from(criticalPoints).sort((a, b) => a - b).filter(p => p <= maxQ);
  
  // Fill data
  // Logic: For Supply, at quantity Q, the price is the price of the generator covering that Q.
  // If Q > total supply, no data (or infinity).
  
  sortedPoints.forEach(q => {
    // Find Supply Price at Q
    let sPrice: number | null = null;
    const sMatch = supplySteps.find(s => q >= s.start && q < s.end);
    if (sMatch) sPrice = sMatch.price;
    else if (q >= supplyCum && supplySteps.length > 0) sPrice = null; // End of curve
    // Edge case for exactly on the line: look at previous block if strictly equal? 
    // Recharts handles 'step' interpolation, we just need coordinates.
    // Better approach for step charts in Recharts: 
    // Explicitly define the corners. (x, y)
  });

  // Alternative: Return distinct datasets for Supply and Demand Line Charts
  // Supply: (0, p1), (q1, p1), (q1, p2), (q1+q2, p2)...
  const supplyData = [];
  let sAcc = 0;
  if(generators.length > 0) {
      supplyData.push({ x: 0, y: generators[0].price, name: 'Start' });
      for (const g of generators) {
        supplyData.push({ x: sAcc, y: g.price, name: g.name }); // Step start
        sAcc += g.capacity;
        supplyData.push({ x: sAcc, y: g.price, name: g.name }); // Step end
      }
      // Extend slightly
      supplyData.push({ x: sAcc, y: generators[generators.length-1].price * 1.5, name: 'End' }); 
  }

  const demandData = [];
  let dAcc = 0;
  if(loads.length > 0) {
      demandData.push({ x: 0, y: loads[0].price, name: 'Start' });
      for (const l of loads) {
        demandData.push({ x: dAcc, y: l.price, name: l.name });
        dAcc += l.capacity;
        demandData.push({ x: dAcc, y: l.price, name: l.name });
      }
      demandData.push({ x: dAcc, y: 0, name: 'End' });
  }
  
  return { supplyData, demandData, maxQ };
};
