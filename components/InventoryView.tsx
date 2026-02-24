
import React from 'react';
import { ResourceAmount, ResourceType } from '../types';
import { RESOURCE_LABELS } from '../constants';
import { Package, TrendingUp } from 'lucide-react';

interface InventoryViewProps {
  inventory: ResourceAmount;
  bonuses: Partial<Record<ResourceType, number>>;
}

const InventoryView: React.FC<InventoryViewProps> = ({ inventory, bonuses }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medieval text-3xl text-white">Armazém da Vila</h2>
          <p className="text-slate-500 uppercase tracking-widest text-xs mt-1">Estoque atual de recursos e suprimentos</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Package className="text-amber-500 w-6 h-6" />
          <div className="text-right">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Total Itens</div>
            <div className="text-xl font-bold text-white">
              {/* Fixed: Explicitly cast Object.values(inventory) to number[] to ensure reduce can perform addition */}
              {(Object.values(inventory) as number[]).reduce((a, b) => a + b, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(inventory).map(([res, amount]) => {
          const resourceKey = res as ResourceType;
          const bonus = bonuses[resourceKey];
          return (
            <div key={res} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{RESOURCE_LABELS[resourceKey]}</span>
                {bonus !== undefined && bonus !== 0 && (
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${bonus > 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
                    <TrendingUp className={`w-3 h-3 ${bonus < 0 ? 'rotate-180' : ''}`} />
                    {bonus > 0 ? '+' : ''}{bonus}%
                  </div>
                )}
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white group-hover:text-amber-500 transition-colors">{amount}</span>
                <span className="text-[10px] text-slate-600 font-bold uppercase">unidades</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryView;
