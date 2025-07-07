import { 
  users, cycles, dailyLogs, predictions, journalEntries, userSettings,
  type User, type InsertUser, type Cycle, type InsertCycle,
  type DailyLog, type InsertDailyLog, type Prediction, type InsertPrediction,
  type JournalEntry, type InsertJournalEntry, type UserSettings, type InsertUserSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Cycle management
  getCycles(userId: number): Promise<Cycle[]>;
  getCycle(id: number): Promise<Cycle | undefined>;
  createCycle(cycle: InsertCycle): Promise<Cycle>;
  updateCycle(id: number, cycle: Partial<InsertCycle>): Promise<Cycle | undefined>;
  getActiveCycle(userId: number): Promise<Cycle | undefined>;

  // Daily logs
  getDailyLogs(userId: number, startDate?: string, endDate?: string): Promise<DailyLog[]>;
  getDailyLog(userId: number, date: string): Promise<DailyLog | undefined>;
  createDailyLog(log: InsertDailyLog): Promise<DailyLog>;
  updateDailyLog(id: number, log: Partial<InsertDailyLog>): Promise<DailyLog | undefined>;

  // Predictions
  getPrediction(userId: number): Promise<Prediction | undefined>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  updatePrediction(userId: number, prediction: Partial<InsertPrediction>): Promise<Prediction | undefined>;

  // Journal entries
  getJournalEntries(userId: number): Promise<JournalEntry[]>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;

  // User settings
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userUpdates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userUpdates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getCycles(userId: number): Promise<Cycle[]> {
    return await db.select().from(cycles).where(eq(cycles.userId, userId));
  }

  async getCycle(id: number): Promise<Cycle | undefined> {
    const [cycle] = await db.select().from(cycles).where(eq(cycles.id, id));
    return cycle || undefined;
  }

  async createCycle(insertCycle: InsertCycle): Promise<Cycle> {
    const [cycle] = await db
      .insert(cycles)
      .values(insertCycle)
      .returning();
    return cycle;
  }

  async updateCycle(id: number, cycleUpdates: Partial<InsertCycle>): Promise<Cycle | undefined> {
    const [cycle] = await db
      .update(cycles)
      .set(cycleUpdates)
      .where(eq(cycles.id, id))
      .returning();
    return cycle || undefined;
  }

  async getActiveCycle(userId: number): Promise<Cycle | undefined> {
    const [cycle] = await db.select().from(cycles).where(
      and(eq(cycles.userId, userId), eq(cycles.isActive, true))
    );
    return cycle || undefined;
  }

  async getDailyLogs(userId: number, startDate?: string, endDate?: string): Promise<DailyLog[]> {
    const conditions = [eq(dailyLogs.userId, userId)];
    if (startDate) conditions.push(gte(dailyLogs.date, startDate));
    if (endDate) conditions.push(lte(dailyLogs.date, endDate));
    
    return await db.select().from(dailyLogs).where(and(...conditions));
  }

  async getDailyLog(userId: number, date: string): Promise<DailyLog | undefined> {
    const [log] = await db.select().from(dailyLogs).where(
      and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date))
    );
    return log || undefined;
  }

  async createDailyLog(insertLog: InsertDailyLog): Promise<DailyLog> {
    const [log] = await db
      .insert(dailyLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async updateDailyLog(id: number, logUpdates: Partial<InsertDailyLog>): Promise<DailyLog | undefined> {
    const [log] = await db
      .update(dailyLogs)
      .set(logUpdates)
      .where(eq(dailyLogs.id, id))
      .returning();
    return log || undefined;
  }

  async getPrediction(userId: number): Promise<Prediction | undefined> {
    const [prediction] = await db.select().from(predictions).where(eq(predictions.userId, userId));
    return prediction || undefined;
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const [prediction] = await db
      .insert(predictions)
      .values(insertPrediction)
      .returning();
    return prediction;
  }

  async updatePrediction(userId: number, predictionUpdates: Partial<InsertPrediction>): Promise<Prediction | undefined> {
    const [prediction] = await db
      .update(predictions)
      .set(predictionUpdates)
      .where(eq(predictions.userId, userId))
      .returning();
    return prediction || undefined;
  }

  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId));
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry || undefined;
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db
      .insert(journalEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async updateJournalEntry(id: number, entryUpdates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .update(journalEntries)
      .set(entryUpdates)
      .where(eq(journalEntries.id, id))
      .returning();
    return entry || undefined;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    const result = await db.delete(journalEntries).where(eq(journalEntries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings || undefined;
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const [settings] = await db
      .insert(userSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  async updateUserSettings(userId: number, settingsUpdates: Partial<InsertUserSettings>): Promise<UserSettings | undefined> {
    const [settings] = await db
      .update(userSettings)
      .set(settingsUpdates)
      .where(eq(userSettings.userId, userId))
      .returning();
    return settings || undefined;
  }
}

export const storage = new DatabaseStorage();
