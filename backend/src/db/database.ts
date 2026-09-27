import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

let dbInstance: DatabaseSync | null = null;

export function getDbPath(): string {
  const dbDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  return path.join(dbDir, 'codetrack.sqlite');
}

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    const dbPath = process.env.DATABASE_PATH || getDbPath();
    dbInstance = new DatabaseSync(dbPath);
    // Enable WAL mode and foreign keys
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
