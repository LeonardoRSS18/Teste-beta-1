import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { BUILDING_TYPES, INITIAL_INVENTORY, DEFAULT_SYSTEM_MARKET_CONFIG } from './gameData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const processNextTurn = (state: any): any => {
  const nextTurnNum = state.currentTurn + 1;
  
  // Replenish System Market Stock
  const newSystemStock = { ...state.systemMarketStock };
  if (state.config.systemMarket?.generationRates) {
    Object.entries(state.config.systemMarket.generationRates).forEach(([res, rate]) => {
      const resource = res as any;
      const max = state.config.systemMarket.maxStock[resource] || 0;
      newSystemStock[resource] = Math.min(max, newSystemStock[resource] + (rate as number));
    });
  }

  const updatedVillages = state.villages.map((village: any) => {
    const newInventory = { ...village.inventory };
    const updatedBuildings = village.buildings.map((inst: any) => {
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
          if (newInventory[res as any] < (amount as number)) canProduce = false;
        });

        if (canProduce) {
          // Consume
          Object.entries(consumption).forEach(([res, amount]) => {
            newInventory[res as any] -= (amount as number);
          });
          // Produce
          Object.entries(production).forEach(([res, amount]) => {
            const bonusPercent = village.terrainBonuses[res as any] || 0;
            const actualProd = Math.floor((amount as number) * (1 + bonusPercent / 100));
            newInventory[res as any] += actualProd;
          });
          // Reset cycle
          return { ...inst, turnsActive: 0 };
        }
      }

      return { ...inst, turnsActive: newTurnsActive };
    });

    const updatedLoans = village.loans.map((loan: any) => {
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

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Initial Game State
let gameState: any = {
  currentTurn: 1,
  villages: [],
  market: [],
  systemMarketStock: { ...INITIAL_INVENTORY },
  isPaused: false,
  turnTimeLeft: 120,
  isLobby: false,
  lobbyCountdown: null,
  config: {
    initialCoins: 500,
    turnDurationSeconds: 120,
    baseInterestRate: 0.05,
    terrainBonusRange: [10, 25],
    terrainModifiers: {
      MOUNTAINS: { iron: 20, stone: 15, coal: 15, wheat: -15, sugar_cane: -15, milk: -10 },
      PLAINS: { wheat: 20, sugar_cane: 20, milk: 10, iron: -15, stone: -15, coal: -10 },
      FORESTS: { wood: 20, wheat: 10, eggs: 10, iron: -15, stone: -10, salt: -10 },
      PASTURES: { milk: 20, eggs: 20, wheat: 10, iron: -15, wood: -10, stone: -10 },
      WATER: {},
      DESERT: {},
    },
    systemMarket: DEFAULT_SYSTEM_MARKET_CONFIG
  }
};

// Authoritative Timer
setInterval(() => {
  if (!gameState) return;

  if (!gameState.isPaused) {
    gameState.turnTimeLeft -= 1;
    if (gameState.turnTimeLeft <= 0) {
      gameState = processNextTurn(gameState);
      gameState.turnTimeLeft = gameState.config.turnDurationSeconds;
      io.emit("state_update", gameState);
      io.emit("turn_ended");
    }
    io.emit("tick", gameState.turnTimeLeft);
  }
}, 1000);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("state_update", gameState);

  socket.on("update_state", (clientState) => {
    if (!gameState) return;
    
    // Merge client state with authoritative server state
    // Server owns: currentTurn, turnTimeLeft, isLobby, lobbyCountdown, systemMarketStock
    gameState = {
      ...clientState,
      currentTurn: gameState.currentTurn,
      turnTimeLeft: gameState.turnTimeLeft,
      isLobby: gameState.isLobby,
      lobbyCountdown: gameState.lobbyCountdown,
      // Allow client to update systemMarketStock (purchases) and config (admin)
    };
    
    // Broadcast to all OTHER clients
    socket.broadcast.emit("state_update", gameState);
  });

  socket.on("force_turn", () => {
    gameState = processNextTurn(gameState);
    gameState.turnTimeLeft = gameState.config.turnDurationSeconds;
    io.emit("state_update", gameState);
    io.emit("turn_ended");
  });

  socket.on("reset_game", () => {
    gameState = {
      ...gameState,
      currentTurn: 1,
      villages: [],
      market: [],
      systemMarketStock: { ...INITIAL_INVENTORY },
      isPaused: false,
      turnTimeLeft: 120,
      isLobby: false,
      lobbyCountdown: null
    };
    io.emit("state_update", gameState);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// API routes
app.get("/healthz", (req, res) => res.status(200).send("OK"));
app.get("/api/status", (req, res) => res.json({ status: "ok", turn: gameState.currentTurn }));

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // Em produção, servimos os arquivos estáticos da dist
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = Number(process.env.PORT) || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
