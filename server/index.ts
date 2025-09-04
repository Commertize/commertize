import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import MarketUpdateScheduler from "./services/scheduler";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
    
    // Initialize market update scheduler
    const scheduler = new MarketUpdateScheduler({
      enableDaily: true,
      enableWeekly: true,
      apiBaseUrl: `http://localhost:${PORT}`
    });
    
    scheduler.start();
    
    // Start the news scheduler
    import('./schedulers/newsScheduler.js').then(({ startNewsScheduler }) => {
      startNewsScheduler();
    });
    
    // Start the X automation scheduler
    import('./schedulers/xScheduler.js').then(({ xScheduler }) => {
      xScheduler.start();
    });
    
    // Start the direct X scheduler (bypasses routing issues)
    import('./schedulers/directXScheduler.js').then((module) => {
      const DirectXScheduler = module.default;
      const directScheduler = new DirectXScheduler();
      directScheduler.start();
    });
    
    // Start the multi-platform scheduler
    import('./schedulers/multiPlatformScheduler.js').then(({ multiPlatformScheduler }) => {
      multiPlatformScheduler.start();
    });
    
    // Start the blockchain analysis scheduler
    import('./schedulers/blockchainScheduler.js').then(({ startBlockchainScheduler }) => {
      startBlockchainScheduler();
    });
    
    // Start the tokenized AUM analysis scheduler
    import('./schedulers/tokenizedAumScheduler.js').then(({ startTokenizedAumScheduler }) => {
      startTokenizedAumScheduler();
    });
    
    // Start the cap rate analysis scheduler
    import('./schedulers/capRateScheduler.js').then(({ startCapRateScheduler }) => {
      startCapRateScheduler();
    });
    
    // Start the transaction volume analysis scheduler
    import('./schedulers/transactionVolumeScheduler.js').then(({ startTransactionVolumeScheduler }) => {
      startTransactionVolumeScheduler();
    });
    
    // Start the vacancy heatmap analysis scheduler
    import('./schedulers/vacancyHeatmapScheduler.js').then(({ startVacancyHeatmapScheduler }) => {
      startVacancyHeatmapScheduler();
    });
    
    // Start the forward signals analysis scheduler
    console.log('Starting forward signals scheduler...');
    import('./schedulers/forwardSignalsScheduler.js').then(() => {
      console.log('Forward signals scheduler started successfully');
    }).catch(error => {
      console.error('Error starting forward signals scheduler:', error);
    });
    
    // Start RUNE.CTZ autonomous agent for LinkedIn automation
    import('./services/runeCTZAgent.js').then(({ runeCTZAgent }) => {
      runeCTZAgent.start();
      console.log('🤖 RUNE.CTZ AI Agent activated - Autonomous LinkedIn operations');
    }).catch(error => {
      console.error('Error starting RUNE.CTZ agent:', error);
    });
  });
})();