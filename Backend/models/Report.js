const db = require('../config/database');

class Report {
  // Get all reports
  static async findAll(filters = {}) {
    let query = `
      SELECT r.*, u.name as user_name, u.email as user_email 
      FROM reports r 
      LEFT JOIN users u ON r.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.status) {
      query += ' AND r.status = ?';
      params.push(filters.status);
    }
    
    if (filters.damage_type) {
      query += ' AND r.damage_type = ?';
      params.push(filters.damage_type);
    }
    
    if (filters.urgency) {
      query += ' AND r.urgency = ?';
      params.push(filters.urgency);
    }
    
    query += ' ORDER BY r.created_at DESC';
    
    const [rows] = await db.execute(query, params);
    return rows;
  }
  
  // Find reports by user ID
  static async findByUserId(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    return rows;
  }
  
  // Find reports near location
  static async findNearby(lat, lng, radius = 50, status = 'pending') {
    // Using Haversine formula to calculate distance
    const [rows] = await db.execute(
      `SELECT r.*, u.name as user_name, u.email as user_email,
        (6371 * acos(cos(radians(?)) * cos(radians(r.lat)) * 
        cos(radians(r.lng) - radians(?)) + sin(radians(?)) * 
        sin(radians(r.lat)))) AS distance 
       FROM reports r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.status = ?
       HAVING distance < ? 
       ORDER BY distance`,
      [lat, lng, lat, status, radius]
    );
    
    return rows;
  }
  
  // Find report by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT r.*, u.name as user_name, u.email as user_email FROM reports r LEFT JOIN users u ON r.user_id = u.id WHERE r.id = ?',
      [id]
    );
    
    return rows[0];
  }
  
  // Create a new report
  static async create(reportData) {
    const { user_id, lat, lng, address, damage_type, description, urgency, images } = reportData;
    
    const [result] = await db.execute(
      'INSERT INTO reports (user_id, lat, lng, address, damage_type, description, urgency, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, lat, lng, address, damage_type, description, urgency, images]
    );
    
    return result.insertId;
  }
  
  // Update report status
  static async updateStatus(id, status) {
    const [result] = await db.execute(
      'UPDATE reports SET status = ? WHERE id = ?',
      [status, id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Delete report
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM reports WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Report;