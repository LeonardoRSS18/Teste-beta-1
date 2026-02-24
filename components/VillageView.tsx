
import React, { useState } from 'react';
import { Village, BuildingType, ResourceType } from '../types';
import { BUILDING_TYPES, TERRAIN_CONFIG, RESOURCE_LABELS } from '../constants';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VillageViewProps {
  village: Village;
  onBuild: (typeId: string, x: number, y: number) => void;
  onChangeMode: (buildingId: string, modeId: string) => void;
  currentTurn: number;
}

const GRID_SIZE = 8;

const VillageView: React.FC<VillageViewProps> = ({ village, onBuild, onChangeMode, currentTurn }) => {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingType | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const terrain = TERRAIN_CONFIG[village.terrain];

  const selectedInstance = village.buildings.find(b => b.id === selectedInstanceId);
  const selectedInstanceType = selectedInstance ? BUILDING_TYPES.find(t => t.id === selectedInstance.typeId) : null;

  // Map terrain types to distinct, accessible colors with visible borders
  const terrainThemes: Record<string, { bg: string; border: string }> = {
    'bg-slate-600': { bg: 'bg-slate-200', border: 'border-slate-300' },
    'bg-emerald-800': { bg: 'bg-emerald-100', border: 'border-emerald-200' },
    'bg-yellow-500': { bg: 'bg-amber-100', border: 'border-amber-200' },
    'bg-green-500': { bg: 'bg-green-100', border: 'border-green-200' },
    'bg-blue-500': { bg: 'bg-blue-100', border: 'border-blue-200' },
    'bg-orange-300': { bg: 'bg-orange-100', border: 'border-orange-200' },
  };

  const theme = terrainThemes[terrain.color] || { bg: 'bg-slate-100', border: 'border-slate-200' };

  const renderCell = (x: number, y: number) => {
    const building = village.buildings.find(b => b.x === x && b.y === y);
    const buildingType = building ? BUILDING_TYPES.find(t => t.id === building.typeId) : null;
    const IconComponent = buildingType ? (Icons as any)[buildingType.icon] : null;
    const hasBonusForSelected = selectedBuilding?.terrainBonus?.includes(village.terrain);
    const isSelectedInstance = building?.id === selectedInstanceId;

    return (
      <div 
        key={`${x}-${y}`}
        onClick={() => {
          if (building) {
            setSelectedInstanceId(building.id);
            setSelectedBuilding(null);
          } else if (selectedBuilding) {
            onBuild(selectedBuilding.id, x, y);
          }
        }}
        className={`aspect-square relative group cursor-pointer border-2 transition-all duration-300 hover:z-10 flex items-center justify-center rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1
          ${theme.bg} ${isSelectedInstance ? 'border-amber-500 ring-4 ring-amber-200' : theme.border} active:scale-95`}
      >
        {buildingType && IconComponent && (
          <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 mb-1.5 group-hover:scale-110 transition-transform">
              <IconComponent className="w-7 h-7 text-amber-600" />
            </div>
            <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight px-2.5 py-1 bg-white/90 rounded-full border border-slate-200 shadow-sm">
              {buildingType.name}
            </span>
          </div>
        )}
        
        {!building && selectedBuilding && (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <div className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center ${hasBonusForSelected ? 'border-emerald-600 bg-emerald-500/10 animate-pulse' : 'border-slate-400'}`}>
                {(Icons as any)[selectedBuilding.icon] && React.createElement((Icons as any)[selectedBuilding.icon], { className: `w-6 h-6 ${hasBonusForSelected ? 'text-emerald-700' : 'text-slate-400'}` })}
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row gap-12 h-full items-start">
      {/* Grid Container */}
      <div className="flex-1 w-full bg-slate-50/50 rounded-[5rem] p-8 md:p-14 border-4 border-slate-200 shadow-[inset_0_4px_30px_rgba(0,0,0,0.05)] flex items-center justify-center relative">
        <div className="grid grid-cols-8 gap-4 w-full max-w-4xl perspective-1000 transform-gpu">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            return renderCell(x, y);
          })}
        </div>
      </div>

      {/* Construction Menu - Higher Contrast */}
      <div className="w-full xl:w-96 flex flex-col gap-8 h-full">
        <div className="bg-slate-100 p-8 rounded-[3.5rem] border-2 border-slate-200 shadow-lg shadow-slate-200/50">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
            <Icons.Hammer className="w-4 h-4 text-amber-600" />
            Construção
          </h3>
          
          <div className="grid grid-cols-4 gap-4 relative">
            {BUILDING_TYPES.map((type, index) => {
              const Icon = (Icons as any)[type.icon];
              const isSelected = selectedBuilding?.id === type.id;
              const hasBonus = type.terrainBonus?.includes(village.terrain);
              
              const isFirstRow = index < 4;
              const isFirstCol = index % 4 === 0;
              const isLastCol = index % 4 === 3;

              return (
                <div key={type.id} className="relative">
                  <button
                    onClick={() => setSelectedBuilding(type)}
                    onMouseEnter={() => setHoveredBuilding(type)}
                    onMouseLeave={() => setHoveredBuilding(null)}
                    className={`aspect-square w-full flex items-center justify-center rounded-[1.8rem] transition-all relative border-4 ${
                      isSelected 
                      ? 'bg-amber-500 border-white text-white scale-110 shadow-2xl shadow-amber-300/40' 
                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:border-amber-400'
                    }`}
                  >
                    <Icon className="w-8 h-8" />
                    {hasBonus && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-600 border-2 border-white"></span>
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {hoveredBuilding?.id === type.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: isFirstRow ? -5 : 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: isFirstRow ? -5 : 5 }}
                        className={`absolute z-50 pointer-events-none w-48 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-800 
                          ${isFirstRow ? 'top-full mt-3' : 'bottom-full mb-3'}
                          ${isFirstCol ? 'left-0' : isLastCol ? 'right-0' : 'left-1/2 -translate-x-1/2'}
                        `}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-slate-800 rounded-lg">
                            <Icon className="w-4 h-4 text-amber-500" />
                          </div>
                          <h4 className="font-bold text-xs">{type.name}</h4>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-amber-500">
                            <span>Custo</span>
                            <span>{type.cost} moedas</span>
                          </div>

                          <div className="space-y-0.5">
                            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Produz</div>
                            {Object.entries(type.production).map(([res, amount]) => (
                              <div key={res} className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400">{RESOURCE_LABELS[res as ResourceType]}</span>
                                <span className="text-emerald-400">+{amount}</span>
                              </div>
                            ))}
                          </div>

                          {Object.keys(type.consumption).length > 0 && (
                            <div className="space-y-0.5">
                              <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Demanda</div>
                              {Object.entries(type.consumption).map(([res, amount]) => (
                                <div key={res} className="flex justify-between text-[10px] font-bold">
                                  <span className="text-slate-400">{RESOURCE_LABELS[res as ResourceType]}</span>
                                  <span className="text-red-400">-{amount}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800 text-[8px] text-slate-500 italic">
                          Ciclo: {type.productionCycle} turnos
                        </div>
                        
                        {/* Tooltip Arrow */}
                        <div className={`absolute border-4 border-transparent 
                          ${isFirstRow ? 'bottom-full border-b-slate-900' : 'top-full border-t-slate-900'}
                          ${isFirstCol ? 'left-4' : isLastCol ? 'right-4' : 'left-1/2 -translate-x-1/2'}
                        `} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {selectedBuilding ? (
          <div className="flex-1 bg-white border-2 border-slate-100 rounded-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="text-3xl font-bold text-slate-900 leading-tight">{selectedBuilding.name}</h4>
                <div className="flex items-center gap-2 text-amber-600 font-black text-[13px] mt-2 uppercase tracking-widest">
                  <Icons.Coins className="w-4 h-4" />
                  {selectedBuilding.cost} moedas
                </div>
              </div>
              <div className="p-5 bg-slate-100 rounded-[2rem] border-2 border-white shadow-sm">
                {React.createElement((Icons as any)[selectedBuilding.icon], { className: "w-10 h-10 text-amber-600" })}
              </div>
            </div>

            <p className="text-[13px] text-slate-600 leading-relaxed mb-10 font-medium">
              {selectedBuilding.description}
            </p>
            
            <div className="grid grid-cols-2 gap-6">
               <div className="bg-emerald-50 p-6 rounded-[2.5rem] border-2 border-emerald-100">
                 <div className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-4">Produção</div>
                 {Object.entries(selectedBuilding.production).length > 0 ? Object.entries(selectedBuilding.production).map(([res, amount]) => (
                   <div key={res} className="flex justify-between text-[13px] text-slate-800 font-black">
                     <span className="capitalize opacity-50">{res}</span>
                     <span className="text-emerald-700">+{amount}</span>
                   </div>
                 )) : <span className="text-xs text-slate-400 italic">Nenhuma</span>}
                 <div className="mt-4 pt-4 border-t border-emerald-200 text-[10px] font-bold text-emerald-600 uppercase">
                    Ciclo: {selectedBuilding.productionCycle} turnos
                 </div>
               </div>

               <div className="bg-red-50 p-6 rounded-[2.5rem] border-2 border-red-100">
                 <div className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em] mb-4">Consumo</div>
                 {Object.entries(selectedBuilding.consumption).length > 0 ? Object.entries(selectedBuilding.consumption).map(([res, amount]) => (
                   <div key={res} className="flex justify-between text-[13px] text-slate-800 font-black">
                     <span className="capitalize opacity-50">{res}</span>
                     <span className="text-red-700">-{amount}</span>
                   </div>
                 )) : <span className="text-xs text-slate-400 italic">Nenhum</span>}
               </div>
            </div>
          </div>
        ) : selectedInstance && selectedInstanceType ? (
          <div className="flex-1 bg-white border-2 border-slate-100 rounded-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="text-3xl font-bold text-slate-900 leading-tight">{selectedInstanceType.name}</h4>
                <div className="flex items-center gap-2 text-slate-500 font-black text-[11px] mt-2 uppercase tracking-widest">
                  Construído no turno {selectedInstance.placedAtTurn}
                </div>
              </div>
              <button 
                onClick={() => setSelectedInstanceId(null)}
                className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
              >
                <Icons.X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                <span>Progresso do Ciclo</span>
                <span>{selectedInstance.turnsActive} / {
                  (selectedInstanceType.modes && selectedInstance.modeId 
                    ? selectedInstanceType.modes.find(m => m.id === selectedInstance.modeId)?.productionCycle 
                    : selectedInstanceType.productionCycle) || 1
                }</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-amber-500 transition-all duration-1000"
                  style={{ width: `${(selectedInstance.turnsActive / ((selectedInstanceType.modes && selectedInstance.modeId ? selectedInstanceType.modes.find(m => m.id === selectedInstance.modeId)?.productionCycle : selectedInstanceType.productionCycle) || 1)) * 100}%` }}
                />
              </div>
            </div>

            {selectedInstanceType.modes && (
              <div className="mb-8">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Modo de Operação</div>
                <div className="flex gap-2">
                  {selectedInstanceType.modes.map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => onChangeMode(selectedInstance.id, mode.id)}
                      className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all border-2 ${
                        selectedInstance.modeId === mode.id
                        ? 'bg-amber-500 border-amber-400 text-white shadow-md shadow-amber-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'
                      }`}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
               <div className="bg-emerald-50 p-6 rounded-[2.5rem] border-2 border-emerald-100">
                 <div className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-4">Produção</div>
                 {Object.entries(
                   (selectedInstanceType.modes && selectedInstance.modeId 
                     ? selectedInstanceType.modes.find(m => m.id === selectedInstance.modeId)?.production 
                     : selectedInstanceType.production) || {}
                 ).map(([res, amount]) => (
                   <div key={res} className="flex justify-between text-[13px] text-slate-800 font-black">
                     <span className="capitalize opacity-50">{res}</span>
                     <span className="text-emerald-700">+{amount}</span>
                   </div>
                 ))}
               </div>

               <div className="bg-red-50 p-6 rounded-[2.5rem] border-2 border-red-100">
                 <div className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em] mb-4">Consumo</div>
                 {Object.entries(
                   (selectedInstanceType.modes && selectedInstance.modeId 
                     ? selectedInstanceType.modes.find(m => m.id === selectedInstance.modeId)?.consumption 
                     : selectedInstanceType.consumption) || {}
                 ).map(([res, amount]) => (
                   <div key={res} className="flex justify-between text-[13px] text-slate-800 font-black">
                     <span className="capitalize opacity-50">{res}</span>
                     <span className="text-red-700">-{amount}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-slate-100/50 border-4 border-dashed border-slate-200 rounded-[3.5rem] p-12 text-center flex flex-col items-center justify-center gap-8 shadow-inner">
            <Icons.MousePointer2 className="w-16 h-16 text-slate-300 animate-bounce" />
            <p className="text-[12px] text-slate-400 font-black uppercase tracking-[0.4em] leading-relaxed max-w-[200px]">
              Escolha um projeto ou uma construção para ver detalhes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VillageView;
