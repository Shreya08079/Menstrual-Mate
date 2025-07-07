import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCycleSchema, insertDailyLogSchema, insertJournalEntrySchema, insertUserSettingsSchema } from "@shared/schema";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create default settings
      await storage.createUserSettings({
        userId: user.id,
        notificationsEnabled: true,
        reminderDays: 7,
        waterGoal: 8,
        theme: "pink",
      });

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Cycle routes
  app.get("/api/cycles/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const cycles = await storage.getCycles(userId);
      res.json(cycles);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/cycles", async (req, res) => {
    try {
      const cycleData = insertCycleSchema.parse(req.body);
      
      // End any active cycles for this user
      const activeCycle = await storage.getActiveCycle(cycleData.userId);
      if (activeCycle) {
        await storage.updateCycle(activeCycle.id, { isActive: false });
      }

      const cycle = await storage.createCycle(cycleData);
      res.json(cycle);
    } catch (error) {
      res.status(400).json({ message: "Invalid cycle data" });
    }
  });

  app.put("/api/cycles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cycleData = req.body;
      
      const cycle = await storage.updateCycle(id, cycleData);
      if (!cycle) {
        return res.status(404).json({ message: "Cycle not found" });
      }
      
      res.json(cycle);
    } catch (error) {
      res.status(400).json({ message: "Invalid cycle data" });
    }
  });

  // Predictions routes
  app.get("/api/predictions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const prediction = await storage.getPrediction(userId);
      res.json(prediction);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/predictions", async (req, res) => {
    try {
      const prediction = await storage.createPrediction(req.body);
      res.json(prediction);
    } catch (error) {
      res.status(400).json({ message: "Invalid prediction data" });
    }
  });

  app.put("/api/predictions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const prediction = await storage.updatePrediction(userId, req.body);
      res.json(prediction);
    } catch (error) {
      res.status(400).json({ message: "Invalid prediction data" });
    }
  });

  // Daily logs routes
  app.get("/api/daily-logs/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { startDate, endDate } = req.query;
      const logs = await storage.getDailyLogs(
        userId, 
        startDate as string, 
        endDate as string
      );
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/daily-logs/:userId/:date", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = req.params.date;
      const log = await storage.getDailyLog(userId, date);
      res.json(log);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/daily-logs", async (req, res) => {
    try {
      const logData = insertDailyLogSchema.parse(req.body);
      
      // Check if log already exists for this date
      const existingLog = await storage.getDailyLog(logData.userId, logData.date);
      if (existingLog) {
        const updatedLog = await storage.updateDailyLog(existingLog.id, logData);
        return res.json(updatedLog);
      }

      const log = await storage.createDailyLog(logData);
      res.json(log);
    } catch (error) {
      res.status(400).json({ message: "Invalid log data" });
    }
  });

  // Journal routes
  app.get("/api/journal/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const entryData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(entryData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid journal entry data" });
    }
  });

  app.put("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.updateJournalEntry(id, req.body);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid journal entry data" });
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteJournalEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Settings routes
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.getUserSettings(userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.updateUserSettings(userId, req.body);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
