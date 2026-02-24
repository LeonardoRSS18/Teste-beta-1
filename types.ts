
export type TerrainType = 'MOUNTAINS' | 'FORESTS' | 'PLAINS' | 'PASTURES' | 'WATER' | 'DESERT';

export interface ResourceAmount {
  wood: number;
  iron: number;
  stone: number;
  salt: number;
  coal: number;
  wheat: number;
  sugar_cane: number;
  eggs: number;
  milk: number;
  flour: number;
  sugar: number;
  butter: number;
  cheese: number;
  iron_beams: number;
  cake: number;
  nails: number;
}

export type ResourceType = keyof ResourceAmount;

export interface BuildingMode {
  id: string;
  name: string;
  production: Partial<ResourceAmount>;
  consumption: Partial<ResourceAmount>;
  productionCycle: number;
}

export interface BuildingType {
  id: string;
  name: string;
  cost: number;
  resourcesNeeded?: Partial<ResourceAmount>;
  production: Partial<ResourceAmount>;
  consumption: Partial<ResourceAmount>;
  productionCycle: number;
  modes?: BuildingMode[];
  icon: string;
  description: string;
  terrainBonus?: TerrainType[];
}

export interface BuildingInstance {
  id: string;
  typeId: string;
  x: number;
  y: number;
  placedAtTurn: number;
  modeId?: string;
  turnsActive: number;
}

export interface Loan {
  id: string;
  amount: number;
  remainingAmount: number;
  interestRate: number;
  type: 'SIMPLE' | 'COMPOUND';
  turnTaken: number;
}

export interface MarketListing {
  id: string;
  villageId: string;
  villageName: string;
  resource: ResourceType;
  amount: number;
  pricePerUnit: number;
  type: 'SELL' | 'BUY';
}

export interface Village {
  id: string;
  name: string;
  passwordHash: string;
  coins: number;
  inventory: ResourceAmount;
  buildings: BuildingInstance[];
  loans: Loan[];
  terrain: TerrainType;
  coordinates: { x: number; y: number };
  terrainBonuses: Partial<Record<ResourceType, number>>;
  lastTurnProcessed: number;
}

export interface SystemMarketConfig {
  buyPrices: Partial<Record<ResourceType, number>>;
  sellPrices: Partial<Record<ResourceType, number>>;
  generationRates: Partial<Record<ResourceType, number>>;
  maxStock: Partial<Record<ResourceType, number>>;
}

export interface GameState {
  currentTurn: number;
  villages: Village[];
  market: MarketListing[];
  systemMarketStock: ResourceAmount;
  config: GameConfig;
  isPaused: boolean;
  turnTimeLeft: number;
  isLobby: boolean;
  lobbyCountdown: number | null;
}

export interface GameConfig {
  initialCoins: number;
  turnDurationSeconds: number;
  baseInterestRate: number;
  terrainBonusRange: [number, number];
  terrainModifiers: Record<TerrainType, Partial<Record<ResourceType, number>>>;
  systemMarket: SystemMarketConfig;
}
