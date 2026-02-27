
import type { BuildingType, TerrainType, ResourceType, ResourceAmount } from './types.ts';

export const BUILDING_TYPES: BuildingType[] = [
  {
    id: 'woodcutter',
    name: 'Madeireira',
    cost: 150,
    production: { wood: 10 },
    consumption: {},
    productionCycle: 1,
    icon: 'TreeDeciduous',
    description: 'Extrai madeira das florestas.',
  },
  {
    id: 'mine',
    name: 'Mina',
    cost: 200,
    production: { iron: 5, stone: 10, coal: 5 },
    consumption: {},
    productionCycle: 2,
    icon: 'Pickaxe',
    description: 'Extrai ferro, pedra e carvão das montanhas.',
  },
  {
    id: 'farm',
    name: 'Fazenda',
    cost: 100,
    production: { wheat: 20, sugar_cane: 15 },
    consumption: {},
    productionCycle: 1,
    icon: 'Wheat',
    description: 'Cultiva trigo e cana-de-açúcar.',
  },
  {
    id: 'ranch',
    name: 'Rancho',
    cost: 120,
    production: { eggs: 10, milk: 5 },
    consumption: { wheat: 5 },
    productionCycle: 1,
    icon: 'Beef',
    description: 'Cria animais para ovos e leite.',
  },
  {
    id: 'mill',
    name: 'Moinho',
    cost: 250,
    production: { flour: 10 },
    consumption: { wheat: 20 },
    productionCycle: 1,
    icon: 'Wind',
    description: 'Transforma trigo em farinha.',
  },
  {
    id: 'sugar_mill',
    name: 'Engenho',
    cost: 250,
    production: { sugar: 10 },
    consumption: { sugar_cane: 20 },
    productionCycle: 1,
    icon: 'Candy',
    description: 'Transforma cana em açúcar.',
  },
  {
    id: 'dairy',
    name: 'Laticínio',
    cost: 300,
    production: { butter: 5, cheese: 5 },
    consumption: { milk: 15, salt: 2 },
    productionCycle: 2,
    icon: 'Milk',
    description: 'Produz manteiga e queijo.',
  },
  {
    id: 'blacksmith',
    name: 'Ferraria',
    cost: 400,
    production: { iron_beams: 5, nails: 10 },
    consumption: { iron: 15, coal: 10 },
    productionCycle: 3,
    icon: 'Hammer',
    description: 'Cria vigas de ferro ou pregos.',
  },
  {
    id: 'bakery',
    name: 'Padaria',
    cost: 600,
    production: { cake: 1 },
    consumption: { 
      butter: 20, 
      milk: 50, 
      sugar: 50, 
      eggs: 20, 
      flour: 100, 
      coal: 20 
    },
    productionCycle: 15,
    icon: 'Cake',
    description: 'Produz os valiosos bolos do reino.',
  },
  {
    id: 'bank',
    name: 'Banco',
    cost: 800,
    production: {},
    consumption: {},
    productionCycle: 1,
    icon: 'Landmark',
    description: 'Permite gerenciar empréstimos e finanças.',
  }
];

export const DEFAULT_TERRAIN_MODIFIERS: Record<TerrainType, Partial<Record<ResourceType, number>>> = {
  MOUNTAINS: { iron: 20, stone: 15, coal: 15, wheat: -15, sugar_cane: -15, milk: -10 },
  PLAINS: { wheat: 20, sugar_cane: 20, milk: 10, iron: -15, stone: -15, coal: -10 },
  FORESTS: { wood: 20, wheat: 10, eggs: 10, iron: -15, stone: -10, salt: -10 },
  PASTURES: { milk: 20, eggs: 20, wheat: 10, iron: -15, wood: -10, stone: -10 },
  WATER: {},
  DESERT: {},
};

export const TERRAIN_CONFIG: Record<TerrainType, { color: string; label: string }> = {
  MOUNTAINS: { color: 'bg-slate-600', label: 'Montanhas' },
  FORESTS: { color: 'bg-emerald-800', label: 'Florestas' },
  PLAINS: { color: 'bg-yellow-500', label: 'Planícies' },
  PASTURES: { color: 'bg-green-500', label: 'Pastagens' },
  WATER: { color: 'bg-blue-500', label: 'Água' },
  DESERT: { color: 'bg-orange-300', label: 'Deserto' },
};

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  wood: 'Madeira',
  iron: 'Ferro',
  stone: 'Pedra',
  salt: 'Sal',
  coal: 'Carvão',
  wheat: 'Trigo',
  sugar_cane: 'Cana',
  eggs: 'Ovos',
  milk: 'Leite',
  flour: 'Farinha',
  sugar: 'Açúcar',
  butter: 'Manteiga',
  cheese: 'Queijo',
  iron_beams: 'Vigas',
  cake: 'Bolo',
  nails: 'Pregos',
};

export const DEFAULT_SYSTEM_MARKET_CONFIG: any = {
  buyPrices: {
    wood: 2, iron: 4, stone: 2, salt: 10, coal: 5,
    wheat: 1, sugar_cane: 1, eggs: 5, milk: 8,
    flour: 15, sugar: 20, butter: 40, cheese: 50,
    iron_beams: 100, nails: 15
  },
  sellPrices: {
    wood: 10, iron: 20, stone: 10, salt: 50, coal: 25,
    wheat: 5, sugar_cane: 5, eggs: 25, milk: 40,
    flour: 75, sugar: 100, butter: 200, cheese: 250,
    iron_beams: 500, nails: 75
  },
  generationRates: {
    wood: 5, iron: 2, stone: 5, salt: 1, coal: 2,
    wheat: 10, sugar_cane: 10, eggs: 5, milk: 2,
    flour: 1, sugar: 1, butter: 1, cheese: 1,
    iron_beams: 1, nails: 5
  },
  maxStock: {
    wood: 100, iron: 50, stone: 100, salt: 20, coal: 50,
    wheat: 200, sugar_cane: 200, eggs: 50, milk: 20,
    flour: 10, sugar: 10, butter: 5, cheese: 5,
    iron_beams: 5, nails: 50
  }
};

export const INITIAL_INVENTORY: ResourceAmount = {
  wood: 500, iron: 0, stone: 500, salt: 0, coal: 0,
  wheat: 0, sugar_cane: 0, eggs: 0, milk: 0,
  flour: 0, sugar: 0, butter: 0, cheese: 0,
  iron_beams: 250, cake: 0, nails: 200
};
