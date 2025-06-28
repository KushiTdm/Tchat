import { db } from './init.js';
import { v4 as uuidv4 } from 'uuid';

// Save a new message
export const saveMessage = (senderId, receiverId, content) => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO messages (id, sender_id, receiver_id, content, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run([id, senderId, receiverId, content, timestamp], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id,
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          timestamp
        });
      }
    });
    
    stmt.finalize();
  });
};

// Get messages between two users
export const getMessages = (userId1, userId2, limit = 50) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT m.*, u.name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.timestamp ASC
      LIMIT ?
    `;
    
    db.all(
      query,
      [userId1, userId2, userId2, userId1, limit],
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

// Get recent conversations for a user
export const getRecentConversations = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        CASE 
          WHEN m.sender_id = ? THEN m.receiver_id 
          ELSE m.sender_id 
        END as other_user_id,
        u.name as other_user_name,
        u.email as other_user_email,
        m.content as last_message,
        m.timestamp as last_message_time,
        m.sender_id as last_sender_id
      FROM messages m
      JOIN users u ON (
        CASE 
          WHEN m.sender_id = ? THEN m.receiver_id 
          ELSE m.sender_id 
        END = u.id
      )
      WHERE m.sender_id = ? OR m.receiver_id = ?
      GROUP BY other_user_id
      ORDER BY m.timestamp DESC
    `;
    
    db.all(
      query,
      [userId, userId, userId, userId],
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