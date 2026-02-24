
import React, { useState } from 'react';
import { Loan } from '../types';
import { Landmark, ArrowUpRight, TrendingUp, Wallet, ShieldCheck, Info } from 'lucide-react';

interface BankViewProps {
  loans: Loan[];
  coins: number;
  onTakeLoan: (amount: number, type: 'SIMPLE' | 'COMPOUND') => void;
  onRepay: (id: string, amount: number) => void;
}

const BankView: React.FC<BankViewProps> = ({ loans, coins, onTakeLoan, onRepay }) => {
  const [loanAmount, setLoanAmount] = useState(500);

  const totalDebt = loans.reduce((acc, l) => acc + l.remainingAmount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="font-medieval text-3xl text-white">Banco Real</h2>
          <p className="text-slate-500 uppercase tracking-widest text-xs mt-1">Crédito, finanças e fomento econômico</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 px-6 py-4 rounded-3xl border border-slate-800 flex items-center gap-4">
             <div className="p-2 bg-emerald-500/10 rounded-xl"><Wallet className="w-5 h-5 text-emerald-500" /></div>
             <div>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Saldo Líquido</div>
               <div className="text-lg font-bold text-white">{(coins - totalDebt).toLocaleString()}</div>
             </div>
          </div>
          <div className="bg-slate-900 px-6 py-4 rounded-3xl border border-slate-800 flex items-center gap-4">
             <div className="p-2 bg-red-500/10 rounded-xl"><ArrowUpRight className="w-5 h-5 text-red-500" /></div>
             <div>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Dívida Total</div>
               <div className="text-lg font-bold text-white">{totalDebt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Loan Request Panel */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-fit">
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Landmark className="text-amber-500 w-6 h-6" />
              <h3 className="font-bold text-white uppercase tracking-widest text-sm">Solicitar Crédito</h3>
            </div>

            <div className="space-y-4">
               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase px-1">
                   <span>Valor Desejado</span>
                   <span>{loanAmount.toLocaleString()} moedas</span>
                 </div>
                 <input 
                  type="range" 
                  min="100" 
                  max="5000" 
                  step="100" 
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 h-2 rounded-full appearance-none cursor-pointer"
                 />
               </div>

               <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => onTakeLoan(loanAmount, 'SIMPLE')}
                    className="w-full bg-slate-800 hover:bg-slate-750 text-white p-4 rounded-2xl border border-slate-700 transition-all flex flex-col items-center group"
                  >
                    <span className="text-xs font-bold uppercase mb-1">Juros Simples</span>
                    <span className="text-amber-500 font-bold text-xl">5% p/ Turno</span>
                    <span className="text-[10px] text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Calculado sobre o valor base</span>
                  </button>

                  <button 
                    onClick={() => onTakeLoan(loanAmount, 'COMPOUND')}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white p-4 rounded-2xl shadow-xl shadow-amber-900/20 transition-all flex flex-col items-center group"
                  >
                    <span className="text-xs font-bold uppercase mb-1">Juros Compostos</span>
                    <span className="text-white font-bold text-xl">5% p/ Turno</span>
                    <span className="text-amber-100/70 text-[10px] mt-2 opacity-0 group-hover:opacity-100 transition-opacity italic">Calculado sobre o saldo devedor</span>
                  </button>
               </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex gap-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <p className="text-[10px] text-blue-400/80 leading-relaxed italic">
                O crédito rápido permite acelerar construções, mas dívidas acumuladas podem sufocar a economia da sua vila.
              </p>
            </div>
          </div>
        </div>

        {/* Existing Loans Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <TrendingUp className="text-slate-500 w-5 h-5" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Meus Empréstimos Ativos</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loans.map(loan => (
              <div key={loan.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 group hover:border-slate-700 transition-colors">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Contrato #{loan.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${loan.type === 'COMPOUND' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {loan.type === 'COMPOUND' ? 'Composto' : 'Simples'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {loan.remainingAmount.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xs text-slate-600 font-normal uppercase">Moedas devidas</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Tomado no Turno {loan.turnTaken} • Taxa de 5% por ciclo</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                   <button 
                    onClick={() => onRepay(loan.id, Math.min(coins, loan.remainingAmount))}
                    className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                   >
                     Quitar Total
                   </button>
                   <button 
                    onClick={() => onRepay(loan.id, Math.min(coins, loan.remainingAmount / 2))}
                    className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-750 text-slate-300 px-6 py-3 rounded-xl font-bold text-sm border border-slate-700 transition-all"
                   >
                     Parcial (50%)
                   </button>
                </div>
              </div>
            ))}
            {loans.length === 0 && (
              <div className="py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-600">
                <ShieldCheck className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medieval opacity-50">Sua vila não possui dívidas pendentes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankView;
