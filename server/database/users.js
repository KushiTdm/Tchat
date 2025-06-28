import { db } from './init.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new user
export const createUser = (name, email, password) => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run([id, name, email, password], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id,
          name,
          email,
          created_at: new Date().toISOString()
        });
      }
    });
    
    stmt.finalize();
  });
};

// Get user by email
export const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
};

// Get user by ID
export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
};

// Get all users (for chat user selection)
export const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT id, name, email, created_at FROM users ORDER BY name',
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
};