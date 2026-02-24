import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Initial Game State
  const INITIAL_INVENTORY = {
    wood: 500, iron: 0, stone: 500, salt: 0, coal: 0,
    wheat: 0, sugar_cane: 0, eggs: 0, milk: 0,
    flour: 0, sugar: 0, butter: 0, cheese: 0,
    iron_beams: 250, cake: 0, nails: 200
  };

  const DEFAULT_SYSTEM_MARKET_CONFIG = {
    buyPrices: { wood: 2, iron: 4, stone: 2, salt: 10, coal: 5, wheat: 1, sugar_cane: 1, eggs: 5, milk: 8, flour: 15, sugar: 20, butter: 40, cheese: 50, iron_beams: 100, nails: 15 },
    sellPrices: { wood: 10, iron: 20, stone: 10, salt: 50, coal: 25, wheat: 5, sugar_cane: 5, eggs: 25, milk: 40, flour: 75, sugar: 100, butter: 200, cheese: 250, iron_beams: 500, nails: 75 },
    generationRates: { wood: 5, iron: 2, stone: 5, salt: 1, coal: 2, wheat: 10, sugar_cane: 10, eggs: 5, milk: 2, flour: 1, sugar: 1, butter: 1, cheese: 1, iron_beams: 1, nails: 5 },
    maxStock: { wood: 100, iron: 50, stone: 100, salt: 20, coal: 50, wheat: 200, sugar_cane: 200, eggs: 50, milk: 20, flour: 10, sugar: 10, butter: 5, cheese: 5, iron_beams: 5, nails: 50 }
  };

  let gameState: any = {
    currentTurn: 1,
    villages: [],
    market: [],
    systemMarketStock: { ...INITIAL_INVENTORY },
    isPaused: false,
    turnTimeLeft: 120,
    isLobby: true,
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

    if (gameState.isLobby) {
      const playerCount = gameState.villages.length;
      if (playerCount >= 10) {
        if (gameState.lobbyCountdown === null) {
          gameState.lobbyCountdown = 20;
        } else if (gameState.lobbyCountdown > 0) {
          gameState.lobbyCountdown -= 1;
        } else {
          gameState.isLobby = false;
          gameState.lobbyCountdown = null;
          io.emit("game_started");
        }
      } else {
        gameState.lobbyCountdown = null;
      }
      io.emit("lobby_tick", { 
        count: playerCount, 
        countdown: gameState.lobbyCountdown,
        villages: gameState.villages
      });
    } else if (!gameState.isPaused) {
      gameState.turnTimeLeft -= 1;
      if (gameState.turnTimeLeft <= 0) {
        gameState.turnTimeLeft = gameState.config.turnDurationSeconds;
        io.emit("turn_ended");
      }
      io.emit("tick", gameState.turnTimeLeft);
    }
  }, 1000);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.emit("state_update", gameState);

    socket.on("update_state", (newState) => {
      gameState = newState;
      // Broadcast to all OTHER clients
      socket.broadcast.emit("state_update", gameState);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
