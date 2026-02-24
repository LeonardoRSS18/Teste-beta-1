
import React from 'react';
import { Village, ResourceType } from '../types';
import { TERRAIN_CONFIG, RESOURCE_LABELS } from '../constants';
import { MapPin, ArrowRight, TrendingUp } from 'lucide-react';

interface TerrainIntroProps {
  village: Village;
  onStart: () => void;
}

const TerrainIntro: React.FC<TerrainIntroProps> = ({ village, onStart }) => {
  const terrain = TERRAIN_CONFIG[village.terrain];

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className={`absolute inset-0 opacity-20 blur-[150px] ${terrain.color}`} />
      
      <div className="max-w-2xl w-full z-10 space-y-8">
        <div className="text-center">
          <h1 className="font-medieval text-4xl text-white mb-2">Seja bem-vindo, Governador!</h1>
          <p className="text-slate-400">Sua expedição encontrou um local estratégico para fundar a vila <strong>{village.name}</strong>.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Map Location Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4">
            <div className={`p-6 rounded-full border-4 border-slate-800 shadow-2xl ${terrain.color}`}>
              <MapPin className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Localização</p>
              <h2 className="text-2xl font-medieval text-white">{terrain.label}</h2>
              <p className="text-xs text-slate-500 mt-2">Coordenadas: {village.coordinates.x}, {village.coordinates.y}</p>
            </div>
          </div>

          {/* Modifiers Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-amber-500 w-5 h-5" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Modificadores de Terreno</h3>
            </div>
            
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
              {Object.entries(village.terrainBonuses).map(([res, val]) => {
                const numVal = val as number;
                const isBonus = (numVal || 0) > 0;
                return (
                  <div key={res} className="flex items-center justify-between">
                    <span className="text-slate-300 capitalize text-sm">{RESOURCE_LABELS[res as ResourceType]}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isBonus ? 'bg-emerald-500' : 'bg-red-500'}`} 
                          style={{ width: `${Math.abs(numVal || 0)}%` }} 
                        />
                      </div>
                      <span className={`font-bold text-sm ${isBonus ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isBonus ? '+' : ''}{numVal}%
                      </span>
                    </div>
                  </div>
                );
              })}
              {Object.keys(village.terrainBonuses).length === 0 && (
                <p className="text-slate-500 text-sm italic">Nenhum modificador específico detectado nesta zona neutra.</p>
              )}
            </div>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-[10px] text-slate-500 italic leading-relaxed">
                * Os bônus e penalidades afetam apenas a produção base por turno.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={onStart}
            className="group bg-white hover:bg-amber-500 hover:text-white text-slate-950 font-bold px-12 py-4 rounded-2xl shadow-2xl transition-all flex items-center gap-3 active:scale-95"
          >
            Começar Jornada
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em]">O Reino espera por sua liderança</p>
        </div>
      </div>
    </div>
  );
};

export default TerrainIntro;
