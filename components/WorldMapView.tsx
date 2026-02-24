
import React, { useState } from 'react';
import { Village, TerrainType, ResourceType } from '../types';
import { TERRAIN_CONFIG, RESOURCE_LABELS } from '../constants';
import { getTerrainAt } from '../App';
import { 
  Users, Compass, ShieldCheck, Mountain, Trees, 
  Wheat, Pickaxe, Home, Star, MapPin, Search
} from 'lucide-react';

interface WorldMapViewProps {
  villages: Village[];
  activeVillageId: string;
}

const WORLD_GRID_SIZE = 10;

const TERRAIN_RESOURCE_ICON: Record<TerrainType, React.ElementType> = {
  MOUNTAINS: Pickaxe,
  FORESTS: Trees,
  PLAINS: Wheat,
  PASTURES: Users,
  WATER: MapPin,
  DESERT: MapPin
};

const WorldMapView: React.FC<WorldMapViewProps> = ({ villages, activeVillageId }) => {
  const [focusedCell, setFocusedCell] = useState<{x: number, y: number, terrain: TerrainType, village?: Village} | null>(null);

  const renderCell = (x: number, y: number) => {
    const villageInCell = villages.find(v => v.coordinates.x === x && v.coordinates.y === y);
    const isActive = villageInCell?.id === activeVillageId;
    const terrain = getTerrainAt(x, y);
    const ResourceIcon = TERRAIN_RESOURCE_ICON[terrain];

    return (
      <div 
        key={`${x}-${y}`}
        onMouseEnter={() => setFocusedCell({ x, y, terrain, village: villageInCell })}
        onMouseLeave={() => setFocusedCell(null)}
        className={`aspect-square relative group transition-all duration-300 flex items-center justify-center rounded-2xl border-2 overflow-hidden cursor-crosshair
          ${villageInCell ? 'z-10 shadow-sm' : 'z-0 bg-slate-50/40 border-slate-100'}
          ${isActive ? 'bg-amber-50 border-amber-400 shadow-xl shadow-amber-200/50 scale-105 ring-4 ring-amber-400/20 animate-pulse' : 'hover:border-amber-300 hover:bg-white hover:shadow-md'}
          ${!isActive && villageInCell ? 'bg-white border-slate-300' : ''}`}
      >
        <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-colors" />

        {!villageInCell ? (
          <ResourceIcon className="w-1/2 h-1/2 text-slate-200 opacity-40 group-hover:opacity-100 group-hover:text-amber-200 transition-all" />
        ) : (
          <div className="flex flex-col items-center animate-in zoom-in-50 duration-500 relative w-full h-full justify-center">
            <div className={`p-2 rounded-xl shadow-md border-2 mb-1 transition-transform group-hover:scale-110 relative
              ${isActive ? 'bg-amber-500 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-100'}`}>
              <Home className="w-5 h-5 md:w-6 md:h-6" />
              {isActive && (
                <div className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg border-2 border-amber-400 animate-bounce">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                </div>
              )}
            </div>
            <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full border shadow-sm truncate max-w-[90%]
              ${isActive ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-slate-100 border-slate-200 text-slate-900'}`}>
              {villageInCell.name}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 md:gap-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Geografia do Reino</h2>
          <p className="text-amber-600 font-black uppercase tracking-[0.4em] text-[10px] mt-2">Navegue pela grade para analisar os territórios</p>
        </div>
        <div className="hidden md:flex bg-white px-8 py-4 rounded-3xl border-2 border-slate-100 items-center gap-6 shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-amber-600" />
            <span className="text-lg font-black text-slate-900">Modo Inspeção</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 overflow-hidden">
        {/* World Grid Map - Com Scroll Interno se necessário */}
        <div className="flex-1 bg-white border-4 border-slate-200 rounded-[3rem] md:rounded-[4rem] p-4 md:p-8 shadow-[inset_0_4px_30px_rgba(0,0,0,0.05)] flex flex-col relative overflow-auto custom-scrollbar">
          <div className="min-w-[600px] md:min-w-0 flex-1 flex items-start justify-center">
            <div className="grid grid-cols-10 gap-2 md:gap-3 w-full max-w-4xl p-2">
              {Array.from({ length: WORLD_GRID_SIZE * WORLD_GRID_SIZE }).map((_, i) => {
                const x = i % WORLD_GRID_SIZE;
                const y = Math.floor(i / WORLD_GRID_SIZE);
                return renderCell(x, y);
              })}
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-8 shrink-0 lg:h-full overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden flex-1 h-fit">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <Compass className="w-5 h-5 text-amber-600" />
              Relatório de Campo
            </h3>

            {focusedCell ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className={`p-6 rounded-[2rem] border-2 shadow-inner text-center ${focusedCell.village ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="text-slate-950 text-2xl font-black mb-2 truncate px-2">
                    {focusedCell.village ? focusedCell.village.name : "Terra Incognita"}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest bg-white/80 px-3 py-1 rounded-full border border-slate-200">
                      Célula {focusedCell.x}, {focusedCell.y}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-5 bg-white border-2 border-slate-50 rounded-[2rem] shadow-sm">
                    <div className="w-12 h-12 rounded-[1.5rem] bg-slate-100 flex items-center justify-center border-2 border-white shadow-md shrink-0">
                      {focusedCell.terrain === 'MOUNTAINS' && <Mountain className="w-6 h-6 text-slate-700" />}
                      {focusedCell.terrain === 'FORESTS' && <Trees className="w-6 h-6 text-emerald-700" />}
                      {focusedCell.terrain === 'PLAINS' && <Wheat className="w-6 h-6 text-amber-700" />}
                      {focusedCell.terrain === 'PASTURES' && <Users className="w-6 h-6 text-blue-700" />}
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900">{TERRAIN_CONFIG[focusedCell.terrain].label}</div>
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Bioma Local</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-white shadow-inner">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Aptidão de Recursos</div>
                    <div className="flex flex-wrap gap-2">
                      {TERRAIN_CONFIG[focusedCell.terrain].bonuses.map(bonus => (
                        <div key={bonus} className="flex flex-col items-center bg-white border-2 border-slate-100 rounded-xl p-3 min-w-[70px] shadow-sm">
                          <span className="text-[11px] text-slate-900 capitalize font-black">{RESOURCE_LABELS[bonus as ResourceType]}</span>
                          <span className="text-emerald-600 font-black text-[9px]">Favorável</span>
                        </div>
                      ))}
                      {TERRAIN_CONFIG[focusedCell.terrain].bonuses.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">Sem bônus específicos</span>
                      )}
                    </div>
                  </div>
                </div>

                {focusedCell.village && (
                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-black uppercase mb-3">
                      <span>Riqueza da Vila</span>
                      <span className="text-emerald-700 font-black">{focusedCell.village.coins.toLocaleString()} $</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-white shadow-inner">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (focusedCell.village.coins / 5000) * 100)}%` }} />
                    </div>
                  </div>
                )}

                {!focusedCell.village && (
                  <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50 flex items-start gap-3">
                     <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                     <p className="text-[10px] text-amber-800/70 font-medium leading-relaxed">
                        Este território está livre. Governadores podem expandir suas rotas por aqui.
                     </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 lg:py-32 px-6">
                <div className="w-20 h-20 bg-slate-50 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <MapPin className="w-8 h-8 text-slate-300 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.4em] leading-relaxed">
                  Interaja com o mapa para obter dados estratégicos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMapView;
