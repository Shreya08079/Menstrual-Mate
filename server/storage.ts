import { 
  users, cycles, dailyLogs, predictions, journalEntries, userSettings,
  type User, type InsertUser, type Cycle, type InsertCycle,
  type DailyLog, type InsertDailyLog, type Prediction, type InsertPrediction,
  type JournalEntry, type InsertJournalEntry, type UserSettings, type InsertUserSettings
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cycles: Map<number, Cycle>;
  private dailyLogs: Map<number, DailyLog>;
  private predictions: Map<number, Prediction>;
  private journalEntries: Map<number, JournalEntry>;
  private userSettings: Map<number, UserSettings>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.cycles = new Map();
    this.dailyLogs = new Map();
    this.predictions = new Map();
    this.journalEntries = new Map();
    this.userSettings = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      profilePicture: insertUser.profilePicture || null,
      createdAt: new Date().toISOString().split('T')[0] 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getCycles(userId: number): Promise<Cycle[]> {
    return Array.from(this.cycles.values()).filter(cycle => cycle.userId === userId);
  }

  async getCycle(id: number): Promise<Cycle | undefined> {
    return this.cycles.get(id);
  }

  async createCycle(insertCycle: InsertCycle): Promise<Cycle> {
    const id = this.currentId++;
    const cycle: Cycle = { 
      ...insertCycle, 
      id,
      length: insertCycle.length || null,
      endDate: insertCycle.endDate || null,
      isActive: insertCycle.isActive ?? null
    };
    this.cycles.set(id, cycle);
    return cycle;
  }

  async updateCycle(id: number, cycle: Partial<InsertCycle>): Promise<Cycle | undefined> {
    const existingCycle = this.cycles.get(id);
    if (!existingCycle) return undefined;
    
    const updatedCycle = { ...existingCycle, ...cycle };
    this.cycles.set(id, updatedCycle);
    return updatedCycle;
  }

  async getActiveCycle(userId: number): Promise<Cycle | undefined> {
    return Array.from(this.cycles.values()).find(
      cycle => cycle.userId === userId && cycle.isActive
    );
  }

  async getDailyLogs(userId: number, startDate?: string, endDate?: string): Promise<DailyLog[]> {
    let logs = Array.from(this.dailyLogs.values()).filter(log => log.userId === userId);
    
    if (startDate) {
      logs = logs.filter(log => log.date >= startDate);
    }
    if (endDate) {
      logs = logs.filter(log => log.date <= endDate);
    }
    
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getDailyLog(userId: number, date: string): Promise<DailyLog | undefined> {
    return Array.from(this.dailyLogs.values()).find(
      log => log.userId === userId && log.date === date
    );
  }

  async createDailyLog(insertLog: InsertDailyLog): Promise<DailyLog> {
    const id = this.currentId++;
    const log: DailyLog = { 
      ...insertLog, 
      id,
      waterIntake: insertLog.waterIntake ?? null,
      mood: insertLog.mood || null,
      symptoms: insertLog.symptoms || null,
      notes: insertLog.notes || null
    };
    this.dailyLogs.set(id, log);
    return log;
  }

  async updateDailyLog(id: number, log: Partial<InsertDailyLog>): Promise<DailyLog | undefined> {
    const existingLog = this.dailyLogs.get(id);
    if (!existingLog) return undefined;
    
    const updatedLog = { ...existingLog, ...log };
    this.dailyLogs.set(id, updatedLog);
    return updatedLog;
  }

  async getPrediction(userId: number): Promise<Prediction | undefined> {
    return Array.from(this.predictions.values()).find(p => p.userId === userId);
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = this.currentId++;
    const prediction: Prediction = { 
      ...insertPrediction, 
      id,
      ovulationDate: insertPrediction.ovulationDate || null,
      fertileWindowStart: insertPrediction.fertileWindowStart || null,
      fertileWindowEnd: insertPrediction.fertileWindowEnd || null,
      averageCycleLength: insertPrediction.averageCycleLength ?? null,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async updatePrediction(userId: number, prediction: Partial<InsertPrediction>): Promise<Prediction | undefined> {
    const existing = Array.from(this.predictions.values()).find(p => p.userId === userId);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...prediction,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    this.predictions.set(existing.id, updated);
    return updated;
  }

  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentId++;
    const entry: JournalEntry = { 
      ...insertEntry, 
      id,
      title: insertEntry.title || null,
      mood: insertEntry.mood || null,
      tags: insertEntry.tags || null
    };
    this.journalEntries.set(id, entry);
    return entry;
  }

  async updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const existing = this.journalEntries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...entry };
    this.journalEntries.set(id, updated);
    return updated;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(s => s.userId === userId);
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const id = this.currentId++;
    const settings: UserSettings = { 
      ...insertSettings, 
      id,
      notificationsEnabled: insertSettings.notificationsEnabled ?? null,
      reminderDays: insertSettings.reminderDays ?? null,
      waterGoal: insertSettings.waterGoal ?? null,
      theme: insertSettings.theme || null
    };
    this.userSettings.set(id, settings);
    return settings;
  }

  async updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings | undefined> {
    const existing = Array.from(this.userSettings.values()).find(s => s.userId === userId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...settings };
    this.userSettings.set(existing.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
