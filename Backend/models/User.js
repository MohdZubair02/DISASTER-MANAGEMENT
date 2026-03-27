const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(userData) {
    const { name, email, password, role, location, phone } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role, location, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, location, phone]
    );
    
    return result.insertId;
  }
  
  // Find user by email
  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    return rows[0];
  }
  
  // Find user by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, location, phone, created_at FROM users WHERE id = ?',
      [id]
    );
    
    return rows[0];
  }
  
  // Compare password
  static async comparePassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
  
  // Update user profile
  static async update(id, userData) {
    const { name, email, location, phone } = userData;
    
    const [result] = await db.execute(
      'UPDATE users SET name = ?, email = ?, location = ?, phone = ? WHERE id = ?',
      [name, email, location, phone, id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Update password
  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = User;