
import React from 'react';
import { Village } from '../types';
import { Coins, LogOut, ChevronRight, Trophy, Timer, Pause } from 'lucide-react';

interface HeaderProps {
  village: Village;
  turn: number;
  timeLeft: number;
  isPaused: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ village, turn, timeLeft, isPaused, onLogout }) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isCritical = timeLeft < 30 && !isPaused;

  return (
    <header className="h-24 px-10 flex items-center justify-between z-30">
      <div className="flex items-center gap-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-4 leading-none tracking-tight">
            {village.name} 
            <span className="text-[11px] bg-slate-200 text-slate-700 font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-300">Nível 1</span>
          </h1>
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-600'}`} />
            Turno {turn} • Domínio do Teste Beta 91
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-3xl border-2 border-slate-100 shadow-sm">
            <Coins className="text-amber-500 w-6 h-6" />
            <span className="text-slate-900 font-black text-2xl tracking-tighter">{village.coins.toLocaleString()}</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-3 bg-white px-6 py-3 rounded-3xl border-2 border-slate-100 shadow-sm">
            <Trophy className="text-blue-600 w-6 h-6" />
            <span className="text-slate-900 font-black text-2xl tracking-tighter">{village.inventory.cake}</span>
            <span className="text-[11px] text-slate-500 font-black uppercase tracking-tighter ml-1">Bolos</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Cronômetro */}
        <div className={`flex items-center gap-4 px-8 py-4 rounded-3xl font-black text-sm border-2 transition-all shadow-xl ${
          isPaused 
            ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-amber-100' 
            : isCritical 
              ? 'bg-red-600 border-red-400 text-white shadow-red-200 animate-pulse' 
              : 'bg-white border-slate-100 text-slate-900 shadow-slate-200'
        }`}>
          {isPaused ? <Pause className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] uppercase tracking-widest mb-1 opacity-70">
              {isPaused ? 'Tempo Pausado' : 'Próximo Turno'}
            </span>
            <span className="text-2xl font-black tracking-tighter">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="p-4 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-3xl transition-all border-2 border-transparent hover:border-red-100"
          title="Encerrar Sessão"
        >
          <LogOut className="w-7 h-7" />
        </button>
      </div>
    </header>
  );
};

export default Header;
