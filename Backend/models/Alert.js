const db = require('../config/database');

class Alert {
  // Get all alerts
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM alerts WHERE 1=1';
    const params = [];
    
    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await db.execute(query, params);
    return rows;
  }
  
  // Find alerts near location
  static async findNearby(lat, lng, radius = 50, is_active = true) {
    if (!lat || !lng) {
      // If no location provided, return all active alerts
      return await this.findAll({ is_active });
    }
    
    // Using Haversine formula to calculate distance
    const [rows] = await db.execute(
      `SELECT *, 
        (6371 * acos(cos(radians(?)) * cos(radians(lat)) * 
        cos(radians(lng) - radians(?)) + sin(radians(?)) * 
        sin(radians(lat)))) AS distance 
       FROM alerts 
       WHERE is_active = ?
       HAVING distance < ? 
       ORDER BY distance`,
      [lat, lng, lat, is_active, radius]
    );
    
    return rows;
  }
  
  // Find alert by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM alerts WHERE id = ?',
      [id]
    );
    
    return rows[0];
  }
  
  // Create a new alert
  static async create(alertData) {
    const { title, message, type, severity, lat, lng, expires_at, is_active } = alertData;
    
    const [result] = await db.execute(
      'INSERT INTO alerts (title, message, type, severity, lat, lng, expires_at, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, message, type, severity, lat, lng, expires_at, is_active]
    );
    
    return result.insertId;
  }
  
  // Update alert
  static async update(id, alertData) {
    const { title, message, type, severity, lat, lng, expires_at, is_active } = alertData;
    
    const [result] = await db.execute(
      'UPDATE alerts SET title = ?, message = ?, type = ?, severity = ?, lat = ?, lng = ?, expires_at = ?, is_active = ? WHERE id = ?',
      [title, message, type, severity, lat, lng, expires_at, is_active, id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Delete alert
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM alerts WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Alert;