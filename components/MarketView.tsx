
import React, { useState } from 'react';
import { MarketListing, ResourceType, ResourceAmount, SystemMarketConfig } from '../types';
import { RESOURCE_LABELS } from '../constants';
import { ShoppingCart, Tag, User, ShoppingBag, Plus, X, Landmark, ArrowRightLeft } from 'lucide-react';

interface MarketViewProps {
  market: MarketListing[];
  onBuy: (id: string) => void;
  onCancel: (id: string) => void;
  onList: (resource: ResourceType, amount: number, price: number) => void;
  activeVillageId: string;
  inventory: ResourceAmount;
  systemMarketStock: ResourceAmount;
  systemMarketConfig: SystemMarketConfig;
  onSystemBuy: (resource: ResourceType, amount: number) => void;
  onSystemSell: (resource: ResourceType, amount: number) => void;
}

const MarketView: React.FC<MarketViewProps> = ({ 
  market, onBuy, onCancel, onList, activeVillageId, inventory,
  systemMarketStock, systemMarketConfig, onSystemBuy, onSystemSell
}) => {
  const [showListModal, setShowListModal] = useState(false);
  const [listResource, setListResource] = useState<ResourceType>('wood');
  const [listAmount, setListAmount] = useState(0);
  const [listPrice, setListPrice] = useState(0);

  const [activeTab, setActiveTab] = useState<'PLAYERS' | 'SYSTEM'>('PLAYERS');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="font-medieval text-3xl text-white">Mercado do Reino</h2>
          <p className="text-slate-500 uppercase tracking-widest text-xs mt-1">Comércio dinâmico e suprimentos da coroa</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 flex">
            <button 
              onClick={() => setActiveTab('PLAYERS')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'PLAYERS' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Jogadores
            </button>
            <button 
              onClick={() => setActiveTab('SYSTEM')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'SYSTEM' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Coroa (NPC)
            </button>
          </div>
          <button 
            onClick={() => setShowListModal(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Listar Recurso
          </button>
        </div>
      </div>

      {activeTab === 'PLAYERS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {market.map(listing => {
            const isOwnListing = listing.villageId === activeVillageId;
            return (
              <div key={listing.id} className={`bg-slate-900 border rounded-3xl overflow-hidden shadow-xl transition-all hover:-translate-y-1 ${isOwnListing ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-slate-800'}`}>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                        <Tag className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white capitalize">{RESOURCE_LABELS[listing.resource]}</h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {isOwnListing ? 'Sua Oferta' : listing.villageName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-amber-500">{listing.pricePerUnit}</div>
                      <div className="text-[10px] text-slate-600 uppercase font-bold tracking-tighter">moedas / un</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 uppercase font-bold">Quantidade</span>
                    <span className="text-lg font-bold text-white">{listing.amount}</span>
                  </div>

                  <div className="pt-2">
                    {isOwnListing ? (
                      <button 
                        onClick={() => onCancel(listing.id)}
                        className="w-full bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Remover Oferta
                      </button>
                    ) : (
                      <button 
                        onClick={() => onBuy(listing.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Comprar agora ({(listing.amount * listing.pricePerUnit).toLocaleString()})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {market.length === 0 && (
            <div className="col-span-full py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-600">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medieval opacity-50">O mercado está vazio hoje...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(RESOURCE_LABELS).filter(([res]) => res !== 'cake').map(([res, label]) => {
            const resource = res as ResourceType;
            const stock = systemMarketStock[resource] || 0;
            const buyPrice = systemMarketConfig.buyPrices[resource] || 0;
            const sellPrice = systemMarketConfig.sellPrices[resource] || 0;

            return (
              <div key={res} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <Landmark className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white capitalize">{label}</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Estoque da Coroa: {stock}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Preço de Venda</div>
                    <div className="text-xl font-bold text-red-400">{sellPrice} <span className="text-[10px] text-slate-600">un</span></div>
                    <button 
                      onClick={() => onSystemBuy(resource, 1)}
                      disabled={stock <= 0}
                      className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 py-2 rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-20"
                    >
                      Comprar 1
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Preço de Compra</div>
                    <div className="text-xl font-bold text-emerald-400">{buyPrice} <span className="text-[10px] text-slate-600">un</span></div>
                    <button 
                      onClick={() => onSystemSell(resource, 1)}
                      disabled={inventory[resource] <= 0}
                      className="w-full bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 py-2 rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-20"
                    >
                      Vender 1
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                   <button 
                      onClick={() => onSystemBuy(resource, 10)}
                      disabled={stock < 10}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-[9px] font-bold uppercase transition-all disabled:opacity-20"
                    >
                      Comprar 10
                    </button>
                    <button 
                      onClick={() => onSystemSell(resource, 10)}
                      disabled={inventory[resource] < 10}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-[9px] font-bold uppercase transition-all disabled:opacity-20"
                    >
                      Vender 10
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowListModal(false)} />
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medieval text-2xl text-white">Criar Oferta</h3>
                <button onClick={() => setShowListModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Recurso</label>
                  <select 
                    value={listResource}
                    onChange={(e) => setListResource(e.target.value as ResourceType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.keys(inventory).filter(res => res !== 'cake').map(res => (
                      <option key={res} value={res}>{RESOURCE_LABELS[res as ResourceType]} (Disponível: {inventory[res as ResourceType]})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Quantidade</label>
                    <input 
                      type="number"
                      value={listAmount}
                      onChange={(e) => setListAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Preço Un.</label>
                    <input 
                      type="number"
                      value={listPrice}
                      onChange={(e) => setListPrice(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      min="1"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-amber-500/70 font-bold uppercase">Total da Venda</span>
                    <span className="text-xl font-bold text-amber-500">{(listAmount * listPrice).toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    onList(listResource, listAmount, listPrice);
                    setShowListModal(false);
                  }}
                  disabled={listAmount <= 0 || listPrice <= 0 || inventory[listResource] < listAmount}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-amber-900/20"
                >
                  Confirmar Listagem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketView;
