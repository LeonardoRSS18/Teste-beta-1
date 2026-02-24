
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  BuildingType, TerrainType, ResourceType, Village, GameState, 
  BuildingInstance, Loan, MarketListing 
} from './types';
import { 
  BUILDING_TYPES, TERRAIN_CONFIG, RESOURCE_LABELS, 
  INITIAL_INVENTORY, DEFAULT_TERRAIN_MODIFIERS, DEFAULT_SYSTEM_MARKET_CONFIG 
} from './constants';
import { 
  Coins, Map as MapIcon, Package, ShoppingCart, 
  Landmark, Trophy, Settings2, LogOut, ChevronRight, Globe, User
} from 'lucide-react';

// Components
import LoginScreen from './components/LoginScreen';
import TerrainIntro from './components/TerrainIntro';
import VillageView from './components/VillageView';
import InventoryView from './components/InventoryView';
import MarketView from './components/MarketView';
import BankView from './components/BankView';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';
import WorldMapView from './components/WorldMapView';
import CakeCelebration from './components/CakeCelebration';

export const getTerrainAt = (x: number, y: number): TerrainType => {
  const terrains: TerrainType[] = ['MOUNTAINS', 'FORESTS', 'PLAINS', 'PASTURES'];
  const index = Math.abs((x * 31 + y * 17) % terrains.length);
  return terrains[index];
};

const processNextTurn = (state: GameState): GameState => {
  const nextTurnNum = state.currentTurn + 1;
  
  // Replenish System Market Stock
  const newSystemStock = { ...state.systemMarketStock };
  if (state.config.systemMarket?.generationRates) {
    Object.entries(state.config.systemMarket.generationRates).forEach(([res, rate]) => {
      const resource = res as ResourceType;
      const max = state.config.systemMarket.maxStock[resource] || 0;
      newSystemStock[resource] = Math.min(max, newSystemStock[resource] + (rate as number));
    });
  }

  const updatedVillages = state.villages.map(village => {
    const newInventory = { ...village.inventory };
    const updatedBuildings = village.buildings.map(inst => {
      const type = BUILDING_TYPES.find(t => t.id === inst.typeId);
      if (!type) return inst;

      // Determine current production/consumption and cycle
      let production = type.production;
      let consumption = type.consumption;
      let cycle = type.productionCycle;

      if (type.modes && inst.modeId) {
        const mode = type.modes.find(m => m.id === inst.modeId);
        if (mode) {
          production = mode.production;
          consumption = mode.consumption;
          cycle = mode.productionCycle;
        }
      }

      const newTurnsActive = (inst.turnsActive || 0) + 1;
      
      if (newTurnsActive >= cycle) {
        // Check if can produce
        let canProduce = true;
        Object.entries(consumption).forEach(([res, amount]) => {
          if (newInventory[res as ResourceType] < amount) canProduce = false;
        });

        if (canProduce) {
          // Consume
          Object.entries(consumption).forEach(([res, amount]) => {
            newInventory[res as ResourceType] -= amount;
          });
          // Produce
          Object.entries(production).forEach(([res, amount]) => {
            const bonusPercent = village.terrainBonuses[res as ResourceType] || 0;
            const actualProd = Math.floor(amount * (1 + bonusPercent / 100));
            newInventory[res as ResourceType] += actualProd;
          });
          // Reset cycle
          return { ...inst, turnsActive: 0 };
        }
      }

      return { ...inst, turnsActive: newTurnsActive };
    });

    const updatedLoans = village.loans.map(loan => {
      let updatedRemaining = loan.remainingAmount;
      if (loan.type === 'COMPOUND') {
        updatedRemaining *= (1 + loan.interestRate);
      } else {
        updatedRemaining += (loan.amount * loan.interestRate);
      }
      return { ...loan, remainingAmount: updatedRemaining };
    });

    return {
      ...village,
      inventory: newInventory,
      buildings: updatedBuildings,
      loans: updatedLoans,
      lastTurnProcessed: nextTurnNum
    };
  });

  return {
    ...state,
    currentTurn: nextTurnNum,
    villages: updatedVillages,
    systemMarketStock: newSystemStock
  };
};

const App: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const isRemoteUpdate = useRef(false);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeVillageId, setActiveVillageId] = useState<string | null>(null);
  const [view, setView] = useState<'VILLAGE' | 'INVENTORY' | 'MARKET' | 'BANK' | 'ADMIN' | 'INTRO' | 'WORLD_MAP'>('VILLAGE');
  const [isLogged, setIsLogged] = useState(false);

  // Socket Connection
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('state_update', (newState: GameState) => {
      isRemoteUpdate.current = true;
      setGameState(newState);
      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 0);
    });

    socket.on('tick', (timeLeft: number) => {
      setGameState(prev => prev ? ({ ...prev, turnTimeLeft: timeLeft, isLobby: false }) : null);
    });

    socket.on('lobby_tick', ({ count, countdown, villages }: { count: number, countdown: number | null, villages: Village[] }) => {
      setGameState(prev => prev ? ({ ...prev, villages, isLobby: true, lobbyCountdown: countdown }) : null);
    });

    socket.on('game_started', () => {
      setGameState(prev => prev ? ({ ...prev, isLobby: false }) : null);
    });

    socket.on('turn_ended', () => {
      setGameState(prev => {
        if (!prev) return null;
        const nextState = processNextTurn(prev);
        return {
          ...nextState,
          turnTimeLeft: prev.config.turnDurationSeconds
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync state to server
  useEffect(() => {
    if (!isRemoteUpdate.current && socketRef.current && gameState) {
      socketRef.current.emit('update_state', gameState);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState) {
      localStorage.setItem('ecoVilaState', JSON.stringify(gameState));
    }
  }, [gameState]);

  const activeVillage = useMemo(() => 
    gameState?.villages.find(v => v.id === activeVillageId) || null, 
    [gameState?.villages, activeVillageId]
  );

  const [showCakeAnimation, setShowCakeAnimation] = useState(false);
  const prevCakeCount = useRef(activeVillage?.inventory.cake || 0);

  useEffect(() => {
    if (activeVillage) {
      if (activeVillage.inventory.cake > prevCakeCount.current) {
        setShowCakeAnimation(true);
      }
      prevCakeCount.current = activeVillage.inventory.cake;
    }
  }, [activeVillage?.inventory.cake]);

  if (!gameState) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <Globe className="w-16 h-16 text-amber-500 animate-spin" />
        <div className="text-center">
          <h2 className="text-2xl font-medieval text-white mb-2">Conectando ao Reino...</h2>
          <p className="text-slate-500 text-xs uppercase tracking-[0.3em]">Sincronizando com os outros líderes</p>
        </div>
      </div>
    );
  }

  if (gameState.isLobby && isLogged) {
    const playerCount = gameState.villages.length;
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[40rem] h-[40rem] bg-amber-500/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-20 -right-20 w-[40rem] h-[40rem] bg-emerald-500/20 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-2xl w-full z-10 text-center">
          <div className="inline-flex items-center justify-center p-6 bg-slate-800 rounded-[3rem] shadow-2xl mb-8 border border-slate-700">
             <Globe className="w-16 h-16 text-amber-500 animate-pulse" />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Teste Beta 91</h1>
          <p className="text-slate-400 uppercase tracking-[0.4em] text-xs font-black mb-12">Aguardando Líderes para Iniciar a Colonização</p>

          <div className="grid grid-cols-5 gap-4 mb-12">
            {Array.from({ length: 10 }).map((_, i) => {
              const village = gameState.villages[i];
              return (
                <div key={i} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  village ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-600'
                }`}>
                  <User className={`w-6 h-6 ${village ? 'animate-bounce' : ''}`} />
                  <span className="text-[8px] font-black uppercase truncate w-full px-1">
                    {village ? village.name : 'Vazio'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-[2.5rem] backdrop-blur-xl">
            {gameState.lobbyCountdown !== null ? (
              <div className="space-y-4">
                <div className="text-6xl font-black text-amber-500 animate-pulse">
                  {gameState.lobbyCountdown}s
                </div>
                <p className="text-slate-300 font-bold uppercase tracking-widest text-sm">O Reino será aberto em breve!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-3xl font-bold text-white">
                  {playerCount} / 10 Líderes
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-500" 
                    style={{ width: `${(playerCount / 10) * 100}%` }}
                  />
                </div>
                <p className="text-slate-400 text-xs font-medium">A partida inicia automaticamente quando o 10º líder fundar sua vila.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const forceNextTurn = () => {
    setGameState(prev => ({
      ...processNextTurn(prev),
      turnTimeLeft: prev.config.turnDurationSeconds
    }));
  };

  const togglePause = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleRegister = (name: string, passwordHash: string) => {
    let x, y, isOccupied;
    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      isOccupied = gameState.villages.some(v => v.coordinates.x === x && v.coordinates.y === y);
    } while (isOccupied);

    const terrain = getTerrainAt(x, y);
    const bonuses = gameState.config.terrainModifiers[terrain];

    const newVillage: Village = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      passwordHash,
      coins: gameState.config.initialCoins,
      inventory: { ...INITIAL_INVENTORY },
      buildings: [],
      loans: [],
      terrain,
      coordinates: { x, y },
      terrainBonuses: bonuses,
      lastTurnProcessed: gameState.currentTurn
    };

    setGameState(prev => ({
      ...prev,
      villages: [...prev.villages, newVillage]
    }));
    setActiveVillageId(newVillage.id);
    setView('INTRO');
    setIsLogged(true);
  };

  const handleLogin = (name: string, passwordHash: string) => {
    const v = gameState.villages.find(v => v.name === name && v.passwordHash === passwordHash);
    if (v) {
      setActiveVillageId(v.id);
      setIsLogged(true);
      setView('VILLAGE');
    } else {
      alert('Credenciais inválidas!');
    }
  };

  const build = (typeId: string, x: number, y: number) => {
    if (!activeVillage) return;
    const type = BUILDING_TYPES.find(t => t.id === typeId);
    if (!type) return;
    if (activeVillage.coins < type.cost) { alert('Saldo insuficiente!'); return; }
    const newBuilding: BuildingInstance = {
      id: Math.random().toString(36).substr(2, 5),
      typeId, x, y, placedAtTurn: gameState.currentTurn,
      turnsActive: 0,
      modeId: type.modes ? type.modes[0].id : undefined
    };
    setGameState(prev => ({
      ...prev,
      villages: prev.villages.map(v => 
        v.id === activeVillage.id 
        ? { ...v, coins: v.coins - type.cost, buildings: [...v.buildings, newBuilding] }
        : v
      )
    }));
  };

  const changeBuildingMode = (buildingId: string, modeId: string) => {
    if (!activeVillage) return;
    setGameState(prev => ({
      ...prev,
      villages: prev.villages.map(v => {
        if (v.id !== activeVillage.id) return v;
        return {
          ...v,
          buildings: v.buildings.map(b => 
            b.id === buildingId ? { ...b, modeId, turnsActive: 0 } : b
          )
        };
      })
    }));
  };

  const handleTakeLoan = (amount: number, type: 'SIMPLE' | 'COMPOUND') => {
    if (!activeVillage) return;
    const newLoan: Loan = {
      id: Math.random().toString(36).substr(2, 5),
      amount, remainingAmount: amount,
      interestRate: gameState.config.baseInterestRate,
      type, turnTaken: gameState.currentTurn
    };
    setGameState(prev => ({
      ...prev,
      villages: prev.villages.map(v => 
        v.id === activeVillage.id 
        ? { ...v, coins: v.coins + amount, loans: [...v.loans, newLoan] }
        : v
      )
    }));
  };

  const handleRepayLoan = (loanId: string, amount: number) => {
    if (!activeVillage || activeVillage.coins < amount) return;
    setGameState(prev => ({
      ...prev,
      villages: prev.villages.map(v => {
        if (v.id !== activeVillage.id) return v;
        const updatedLoans = v.loans.map(l => {
          if (l.id !== loanId) return l;
          return { ...l, remainingAmount: Math.max(0, l.remainingAmount - amount) };
        }).filter(l => l.remainingAmount > 0.01);
        return { ...v, coins: v.coins - amount, loans: updatedLoans };
      })
    }));
  };

  const handleMarketAction = (listingId: string, action: 'BUY' | 'CANCEL') => {
    if (!activeVillage) return;
    const listing = gameState.market.find(m => m.id === listingId);
    if (!listing) return;
    if (action === 'CANCEL' && listing.villageId === activeVillage.id) {
      setGameState(prev => ({
        ...prev,
        market: prev.market.filter(m => m.id !== listingId),
        villages: prev.villages.map(v => 
          v.id === activeVillage.id 
          ? { ...v, inventory: { ...v.inventory, [listing.resource]: v.inventory[listing.resource] + listing.amount } }
          : v
        )
      }));
    } else if (action === 'BUY' && listing.villageId !== activeVillage.id) {
      const totalCost = listing.amount * listing.pricePerUnit;
      if (activeVillage.coins < totalCost) { alert('Dinheiro insuficiente!'); return; }
      setGameState(prev => ({
        ...prev,
        market: prev.market.filter(m => m.id !== listingId),
        villages: prev.villages.map(v => {
          if (v.id === activeVillage.id) return { 
            ...v, coins: v.coins - totalCost, inventory: { ...v.inventory, [listing.resource]: v.inventory[listing.resource] + listing.amount } 
          };
          if (v.id === listing.villageId) return { ...v, coins: v.coins + totalCost };
          return v;
        })
      }));
    }
  };

  const handleListMarket = (resource: ResourceType, amount: number, pricePerUnit: number) => {
    if (!activeVillage || activeVillage.inventory[resource] < amount) return;
    const newListing: MarketListing = {
      id: Math.random().toString(36).substr(2, 5),
      villageId: activeVillage.id, villageName: activeVillage.name,
      resource, amount, pricePerUnit, type: 'SELL'
    };
    setGameState(prev => ({
      ...prev,
      market: [...prev.market, newListing],
      villages: prev.villages.map(v => 
        v.id === activeVillage.id 
        ? { ...v, inventory: { ...v.inventory, [resource]: v.inventory[resource] - amount } }
        : v
      )
    }));
  };

  const handleSystemMarketBuy = (resource: ResourceType, amount: number) => {
    if (!activeVillage) return;
    const price = gameState.config.systemMarket.sellPrices[resource] || 0;
    const totalCost = price * amount;
    if (activeVillage.coins < totalCost) { alert('Dinheiro insuficiente!'); return; }
    if (gameState.systemMarketStock[resource] < amount) { alert('Estoque do mercado insuficiente!'); return; }

    setGameState(prev => ({
      ...prev,
      systemMarketStock: { ...prev.systemMarketStock, [resource]: prev.systemMarketStock[resource] - amount },
      villages: prev.villages.map(v => 
        v.id === activeVillage.id 
        ? { ...v, coins: v.coins - totalCost, inventory: { ...v.inventory, [resource]: v.inventory[resource] + amount } }
        : v
      )
    }));
  };

  const handleSystemMarketSell = (resource: ResourceType, amount: number) => {
    if (!activeVillage || activeVillage.inventory[resource] < amount) return;
    const price = gameState.config.systemMarket.buyPrices[resource] || 0;
    const totalGain = price * amount;

    setGameState(prev => ({
      ...prev,
      systemMarketStock: { ...prev.systemMarketStock, [resource]: prev.systemMarketStock[resource] + amount },
      villages: prev.villages.map(v => 
        v.id === activeVillage.id 
        ? { ...v, coins: v.coins + totalGain, inventory: { ...v.inventory, [resource]: v.inventory[resource] - amount } }
        : v
      )
    }));
  };

  if (!isLogged) return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />;
  if (view === 'INTRO' && activeVillage) return <TerrainIntro village={activeVillage} onStart={() => setView('VILLAGE')} />;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden text-slate-900">
      {activeVillage && (
        <Header 
          village={activeVillage} 
          turn={gameState.currentTurn} 
          timeLeft={gameState.turnTimeLeft}
          isPaused={gameState.isPaused}
          onLogout={() => { setIsLogged(false); setActiveVillageId(null); }}
        />
      )}

      <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row p-4 gap-6">
        <nav className="w-full md:w-28 bg-white border border-slate-200 rounded-[3rem] flex md:flex-col items-center justify-around md:justify-center md:py-10 gap-6 z-20 shadow-xl shadow-slate-300/40">
          <NavButton active={view === 'VILLAGE'} onClick={() => setView('VILLAGE')} icon={<MapIcon />} label="Vila" />
          <NavButton active={view === 'WORLD_MAP'} onClick={() => setView('WORLD_MAP')} icon={<Globe />} label="Mapa" />
          <NavButton active={view === 'INVENTORY'} onClick={() => setView('INVENTORY')} icon={<Package />} label="Estoque" />
          <NavButton active={view === 'MARKET'} onClick={() => setView('MARKET')} icon={<ShoppingCart />} label="Mercado" />
          <NavButton active={view === 'BANK'} onClick={() => setView('BANK')} icon={<Landmark />} label="Banco" />
          <NavButton active={view === 'ADMIN'} onClick={() => setView('ADMIN')} icon={<Settings2 />} label="Admin" />
        </nav>

        <section className="flex-1 bg-white border-2 border-white rounded-[4rem] relative overflow-auto p-4 md:p-10 shadow-2xl shadow-slate-300/60">
          {view === 'VILLAGE' && activeVillage && (
            <VillageView 
              village={activeVillage} 
              onBuild={build} 
              onChangeMode={changeBuildingMode}
              currentTurn={gameState.currentTurn} 
            />
          )}
          {view === 'WORLD_MAP' && activeVillage && (
            <WorldMapView villages={gameState.villages} activeVillageId={activeVillage.id} />
          )}
          {view === 'INVENTORY' && activeVillage && (
            <InventoryView inventory={activeVillage.inventory} bonuses={activeVillage.terrainBonuses} />
          )}
          {view === 'MARKET' && activeVillage && (
            <MarketView 
              market={gameState.market} 
              onBuy={(id) => handleMarketAction(id, 'BUY')} 
              onCancel={(id) => handleMarketAction(id, 'CANCEL')} 
              onList={handleListMarket}
              activeVillageId={activeVillage.id}
              inventory={activeVillage.inventory}
              systemMarketStock={gameState.systemMarketStock}
              systemMarketConfig={gameState.config.systemMarket}
              onSystemBuy={handleSystemMarketBuy}
              onSystemSell={handleSystemMarketSell}
            />
          )}
          {view === 'BANK' && activeVillage && (
            <BankView 
              loans={activeVillage.loans} 
              coins={activeVillage.coins} 
              onTakeLoan={handleTakeLoan} 
              onRepay={handleRepayLoan} 
            />
          )}
          {view === 'ADMIN' && (
            <AdminPanel 
              gameState={gameState} 
              onUpdateConfig={(config) => setGameState(prev => ({ ...prev, config }))}
              onReset={() => { localStorage.clear(); window.location.reload(); }}
              onTogglePause={togglePause}
              onForceNextTurn={forceNextTurn}
            />
          )}
        </section>
      </main>

      <div className="bg-slate-900 h-14 px-8 flex items-center gap-6 text-[12px] font-bold overflow-x-auto whitespace-nowrap scrollbar-hide">
        {activeVillage && Object.entries(activeVillage.inventory).map(([res, amount]) => (
          <div key={res} className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700 shadow-inner">
            <span className="capitalize text-slate-400">{RESOURCE_LABELS[res as ResourceType]}:</span>
            <span className="text-amber-400">{amount}</span>
          </div>
        ))}
      </div>

      <CakeCelebration 
        show={showCakeAnimation} 
        onComplete={() => setShowCakeAnimation(false)} 
      />
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-20 h-20 rounded-[2rem] transition-all duration-300 group ${active ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
  >
    <div className={`w-7 h-7 mb-1.5 transform group-hover:scale-110 transition-transform ${active ? 'scale-110' : ''}`}>{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
