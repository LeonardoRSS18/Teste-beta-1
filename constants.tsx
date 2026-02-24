
import React from 'react';
// Added ResourceAmount to imports
import { BuildingType, TerrainType, ResourceType, ResourceAmount } from './types';
import { 
  TreeDeciduous, Pickaxe, Mountain, Shovel, Flame, 
  Wheat, Candy, Wind, Factory, Egg, 
  Milk, Beef, Hammer, Cake, Landmark 
} from 'lucide-react';

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
    terrainBonus: ['FORESTS']
  },
  {
    id: 'iron_mine',
    name: 'Mina de Ferro',
    cost: 200,
    production: { iron: 20 },
    consumption: {},
    productionCycle: 1,
    icon: 'Pickaxe',
    description: 'Extrai minério de ferro das montanhas.',
    terrainBonus: ['MOUNTAINS']
  },
  {
    id: 'quarry',
    name: 'Pedreira',
    cost: 120,
    production: { stone: 20 },
    consumption: {},
    productionCycle: 1,
    icon: 'Mountain',
    description: 'Extrai pedra para construção.',
    terrainBonus: ['MOUNTAINS']
  },
  {
    id: 'salt_mine',
    name: 'Mina de Sal',
    cost: 180,
    production: { salt: 1 },
    consumption: {},
    productionCycle: 1,
    icon: 'Shovel',
    description: 'Extrai sal essencial para conservação.',
    terrainBonus: ['MOUNTAINS']
  },
  {
    id: 'charcoal_kiln',
    name: 'Forno de Carvão',
    cost: 220,
    production: { coal: 5 },
    consumption: { wood: 10 },
    productionCycle: 3,
    icon: 'Flame',
    description: 'Produz carvão a partir de madeira.',
    terrainBonus: ['MOUNTAINS']
  },
  {
    id: 'wheat_field',
    name: 'Campo de Trigo',
    cost: 100,
    production: { wheat: 50 },
    consumption: {},
    productionCycle: 1,
    icon: 'Wheat',
    description: 'Plantação de trigo básica.',
    terrainBonus: ['PLAINS']
  },
  {
    id: 'sugar_field',
    name: 'Campo de Cana',
    cost: 130,
    production: { sugar_cane: 50 },
    consumption: {},
    productionCycle: 1,
    icon: 'Candy',
    description: 'Plantação de cana-de-açúcar.',
    terrainBonus: ['PLAINS']
  },
  {
    id: 'mill',
    name: 'Moinho',
    cost: 300,
    production: { flour: 1 },
    consumption: { wheat: 100 },
    productionCycle: 5,
    icon: 'Wind',
    description: 'Transforma trigo em farinha.',
  },
  {
    id: 'sugar_refinery',
    name: 'Refinaria de Açúcar',
    cost: 350,
    production: { sugar: 1 },
    consumption: { sugar_cane: 100, coal: 10 },
    productionCycle: 1,
    icon: 'Factory',
    description: 'Refina cana em açúcar.',
  },
  {
    id: 'chicken_coop',
    name: 'Galinheiro',
    cost: 150,
    production: { eggs: 5 },
    consumption: {},
    productionCycle: 1,
    icon: 'Egg',
    description: 'Produz ovos frescos.',
    terrainBonus: ['PASTURES']
  },
  {
    id: 'stable',
    name: 'Estábulo',
    cost: 250,
    production: { milk: 2 },
    consumption: {},
    productionCycle: 1,
    icon: 'Milk',
    description: 'Produz leite de vaca.',
    terrainBonus: ['PASTURES']
  },
  {
    id: 'dairy_factory',
    name: 'Fábrica de Laticínios',
    cost: 400,
    production: {},
    consumption: {},
    productionCycle: 1,
    modes: [
      {
        id: 'cheese',
        name: 'Queijo',
        production: { cheese: 1 },
        consumption: { milk: 100, salt: 5 },
        productionCycle: 10
      },
      {
        id: 'butter',
        name: 'Manteiga',
        production: { butter: 1 },
        consumption: { milk: 50, salt: 2 },
        productionCycle: 9
      }
    ],
    icon: 'Beef',
    description: 'Processa leite em manteiga e queijo.',
  },
  {
    id: 'steel_mill',
    name: 'Usina Siderúrgica',
    cost: 500,
    production: {},
    consumption: {},
    productionCycle: 1,
    modes: [
      {
        id: 'beams',
        name: 'Vigas',
        production: { iron_beams: 1 },
        consumption: { iron: 200, coal: 50 },
        productionCycle: 10
      },
      {
        id: 'nails',
        name: 'Pregos',
        production: { nails: 10 },
        consumption: { iron: 50, coal: 50 },
        productionCycle: 6
      }
    ],
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

// Updated initial inventory as requested
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
