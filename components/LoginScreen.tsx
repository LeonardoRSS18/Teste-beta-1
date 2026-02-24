
import React, { useState } from 'react';
import { Landmark, Shield, User, ChevronRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string, pass: string) => void;
  onRegister: (name: string, pass: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'LOGIN') onLogin(name, pass);
    else onRegister(name, pass);
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Soft gradient blobs */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[40rem] h-[40rem] bg-emerald-100 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 -right-20 w-[40rem] h-[40rem] bg-amber-100 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-5 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 mb-6 border border-white">
             <Landmark className="w-14 h-14 text-amber-500" />
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-3 tracking-tight">Teste Beta 91</h1>
          <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px] font-black">Educação Financeira & Gestão</p>
        </div>

        <div className="bg-white border border-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <div className="flex gap-2 p-1.5 bg-slate-50 rounded-3xl mb-10">
            <button 
              onClick={() => setMode('LOGIN')}
              className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${mode === 'LOGIN' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setMode('REGISTER')}
              className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${mode === 'REGISTER' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Criar Vila
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Povoado</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-amber-200 transition-all placeholder:text-slate-300"
                  placeholder="Ex: Aldeia Verde"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative group">
                <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  type="password" 
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-amber-200 transition-all placeholder:text-slate-300"
                  placeholder="Sua chave secreta"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 rounded-[1.5rem] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98] group"
            >
              {mode === 'LOGIN' ? 'Assumir Liderança' : 'Fundar Minha Vila'}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {mode === 'REGISTER' && (
            <div className="mt-8 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[11px] text-emerald-600 font-medium text-center leading-relaxed">
                Fundar uma vila consome 700 moedas iniciais. Você será enviado para uma região estratégica do reino.
              </p>
            </div>
          )}
        </div>

        <p className="mt-12 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em]">
          EcoVila Educational Labs • v2.0
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
