import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'chat.db');

// Create database connection
export const db = new sqlite3.Database(dbPath);

// Initialize database tables
export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create messages table
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          sender_id TEXT NOT NULL,
          receiver_id TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users (id),
          FOREIGN KEY (receiver_id) REFERENCES users (id)
        )
      `);

      // Create indexes for better performance
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver 
        ON messages (sender_id, receiver_id, timestamp)
      `);

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_users_email 
        ON users (email)
      `);
    });

    resolve();
  });
};