
import React from 'react';
import { GameState, GameConfig, ResourceType } from '../types';
import { RESOURCE_LABELS } from '../constants';
import { Settings2, Trophy, RefreshCw, AlertTriangle, Play, Database, Pause, FastForward } from 'lucide-react';

interface AdminPanelProps {
  gameState: GameState;
  onUpdateConfig: (config: GameConfig) => void;
  onReset: () => void;
  onTogglePause: () => void;
  onForceNextTurn: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  gameState, 
  onUpdateConfig, 
  onReset, 
  onTogglePause, 
  onForceNextTurn 
}) => {
  const sortedVillages = [...gameState.villages].sort((a, b) => b.inventory.cake - a.inventory.cake);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Settings2 className="text-amber-500 w-8 h-8" />
            Painel do Professor
          </h2>
          <p className="text-slate-500 uppercase tracking-widest text-xs mt-1">Gestão centralizada da simulação</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onTogglePause}
            className={`px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all shadow-xl ${
              gameState.isPaused 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200' 
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-200'
            }`}
          >
            {gameState.isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            {gameState.isPaused ? 'Retomar Jogo' : 'Pausar Turnos'}
          </button>
          
          <button 
            onClick={onReset}
            className="bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reiniciar Jogo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Trophy className="text-amber-500 w-5 h-5" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Ranking de Produção (Bolos)</h3>
          </div>
          
          <div className="bg-white border-2 border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-6 font-bold">Posição</th>
                  <th className="px-8 py-6 font-bold">Vila / Grupo</th>
                  <th className="px-8 py-6 font-bold">Moedas</th>
                  <th className="px-8 py-6 font-bold text-right">Bolos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedVillages.map((v, i) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-amber-800 text-white' : 'text-slate-400 border border-slate-200'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-900 text-lg">{v.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">{v.terrain} • Setor {v.coordinates.x},{v.coordinates.y}</div>
                    </td>
                    <td className="px-8 py-5 font-bold text-emerald-600">{v.coins.toLocaleString()} $</td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-2xl font-black text-slate-900">{v.inventory.cake}</span>
                    </td>
                  </tr>
                ))}
                {sortedVillages.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">
                      Nenhuma vila fundada no reino ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <FastForward className="text-slate-500 w-5 h-5" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Controle de Ciclo</h3>
          </div>

          <div className="bg-white border-2 border-slate-100 p-8 rounded-[3rem] space-y-8 shadow-sm">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                Duração do Turno <span>{Math.floor(gameState.config.turnDurationSeconds / 60)} min</span>
              </label>
              <input 
                type="range" min="60" max="600" step="60" 
                value={gameState.config.turnDurationSeconds}
                onChange={(e) => onUpdateConfig({ ...gameState.config, turnDurationSeconds: Number(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-100 h-2 rounded-full appearance-none"
              />
              <p className="text-[10px] text-slate-400 italic">O tempo mudará no próximo ciclo.</p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                Moedas Iniciais <span>{gameState.config.initialCoins}</span>
              </label>
              <input 
                type="range" min="100" max="2000" step="100" 
                value={gameState.config.initialCoins}
                onChange={(e) => onUpdateConfig({ ...gameState.config, initialCoins: Number(e.target.value) })}
                className="w-full accent-blue-500 bg-slate-100 h-2 rounded-full appearance-none"
              />
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Modificadores de Terreno</h4>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                {Object.entries(gameState.config.terrainModifiers).map(([terrain, mods]) => (
                  <div key={terrain} className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{terrain}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(mods).map(([res, val]) => (
                        <div key={res} className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-500 uppercase">{res}</label>
                          <input 
                            type="number"
                            value={val}
                            onChange={(e) => {
                              const newVal = Number(e.target.value);
                              const newMods = { ...(mods as object), [res]: newVal };
                              onUpdateConfig({
                                ...gameState.config,
                                terrainModifiers: {
                                  ...gameState.config.terrainModifiers,
                                  [terrain]: newMods
                                }
                              });
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mercado do Sistema (Coroa)</h4>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
                {Object.entries(RESOURCE_LABELS).filter(([res]) => res !== 'cake').map(([res, label]) => {
                  const resource = res as ResourceType;
                  return (
                    <div key={res} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{label}</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] text-slate-500 uppercase font-bold">Preço Compra (NPC paga)</label>
                          <input 
                            type="number"
                            value={gameState.config.systemMarket.buyPrices[resource] || 0}
                            onChange={(e) => {
                              const newVal = Number(e.target.value);
                              onUpdateConfig({
                                ...gameState.config,
                                systemMarket: {
                                  ...gameState.config.systemMarket,
                                  buyPrices: { ...gameState.config.systemMarket.buyPrices, [resource]: newVal }
                                }
                              });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-slate-500 uppercase font-bold">Preço Venda (NPC cobra)</label>
                          <input 
                            type="number"
                            value={gameState.config.systemMarket.sellPrices[resource] || 0}
                            onChange={(e) => {
                              const newVal = Number(e.target.value);
                              onUpdateConfig({
                                ...gameState.config,
                                systemMarket: {
                                  ...gameState.config.systemMarket,
                                  sellPrices: { ...gameState.config.systemMarket.sellPrices, [resource]: newVal }
                                }
                              });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-slate-500 uppercase font-bold">Geração / Turno</label>
                          <input 
                            type="number"
                            value={gameState.config.systemMarket.generationRates[resource] || 0}
                            onChange={(e) => {
                              const newVal = Number(e.target.value);
                              onUpdateConfig({
                                ...gameState.config,
                                systemMarket: {
                                  ...gameState.config.systemMarket,
                                  generationRates: { ...gameState.config.systemMarket.generationRates, [resource]: newVal }
                                }
                              });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-slate-500 uppercase font-bold">Estoque Máximo</label>
                          <input 
                            type="number"
                            value={gameState.config.systemMarket.maxStock[resource] || 0}
                            onChange={(e) => {
                              const newVal = Number(e.target.value);
                              onUpdateConfig({
                                ...gameState.config,
                                systemMarket: {
                                  ...gameState.config.systemMarket,
                                  maxStock: { ...gameState.config.systemMarket.maxStock, [resource]: newVal }
                                }
                              });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl flex flex-col items-center gap-4 text-center border-2 border-white shadow-inner">
              <Database className="w-10 h-10 text-slate-300" />
              <div>
                <div className="text-3xl font-black text-slate-900">{gameState.currentTurn}</div>
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Ciclos Concluídos</div>
              </div>
            </div>

            <button 
              onClick={onForceNextTurn}
              className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3"
            >
               <FastForward className="w-5 h-5" />
               Avançar Turno Agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
