
import React from 'react';
import { BuildingType, TerrainType, ResourceType, ResourceAmount } from './types';
import { 
  TreeDeciduous, Pickaxe, Mountain, Shovel, Flame, 
  Wheat, Candy, Wind, Factory, Egg, 
  Milk, Beef, Hammer, Cake, Landmark 
} from 'lucide-react';
import { 
  BUILDING_TYPES as BT, TERRAIN_CONFIG as TC, RESOURCE_LABELS as RL, 
  INITIAL_INVENTORY as II, DEFAULT_TERRAIN_MODIFIERS as DTM, 
  DEFAULT_SYSTEM_MARKET_CONFIG as DSMC 
} from './gameData';

export const BUILDING_TYPES = BT;
export const TERRAIN_CONFIG = TC;
export const RESOURCE_LABELS = RL;
export const INITIAL_INVENTORY = II;
export const DEFAULT_TERRAIN_MODIFIERS = DTM;
export const DEFAULT_SYSTEM_MARKET_CONFIG = DSMC;
