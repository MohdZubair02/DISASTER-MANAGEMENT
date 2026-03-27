const db = require('../config/database');

class Assistance {
  // Get all assistance requests
  static async findAll(filters = {}) {
    let query = `
      SELECT a.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
        au.name as assigned_name, au.email as assigned_email, au.phone as assigned_phone
      FROM assistance_requests a 
      LEFT JOIN users u ON a.user_id = u.id 
      LEFT JOIN users au ON a.assigned_to = au.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.status) {
      query += ' AND a.status = ?';
      params.push(filters.status);
    }
    
    if (filters.assistance_type) {
      query += ' AND a.assistance_type = ?';
      params.push(filters.assistance_type);
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const [rows] = await db.execute(query, params);
    return rows;
  }
  
  // Find assistance requests by user ID
  static async findByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT a.*, au.name as assigned_name, au.email as assigned_email, au.phone as assigned_phone
       FROM assistance_requests a 
       LEFT JOIN users au ON a.assigned_to = au.id 
       WHERE a.user_id = ? 
       ORDER BY a.created_at DESC`,
      [userId]
    );
    
    return rows;
  }
  
  // Find assistance requests near location
  static async findNearby(lat, lng, radius = 50, status = 'pending') {
    // Using Haversine formula to calculate distance
    const [rows] = await db.execute(
      `SELECT a.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
        (6371 * acos(cos(radians(?)) * cos(radians(a.lat)) * 
        cos(radians(a.lng) - radians(?)) + sin(radians(?)) * 
        sin(radians(a.lat)))) AS distance 
       FROM assistance_requests a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.status = ?
       HAVING distance < ? 
       ORDER BY distance`,
      [lat, lng, lat, status, radius]
    );
    
    return rows;
  }
  
  // Find assistance request by ID
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT a.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
        au.name as assigned_name, au.email as assigned_email, au.phone as assigned_phone
       FROM assistance_requests a 
       LEFT JOIN users u ON a.user_id = u.id 
       LEFT JOIN users au ON a.assigned_to = au.id 
       WHERE a.id = ?`,
      [id]
    );
    
    return rows[0];
  }
  
  // Create a new assistance request
  static async create(assistanceData) {
    const { user_id, assistance_type, people_count, contact_info, lat, lng, address, additional_info } = assistanceData;
    
    const [result] = await db.execute(
      'INSERT INTO assistance_requests (user_id, assistance_type, people_count, contact_info, lat, lng, address, additional_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, assistance_type, people_count, contact_info, lat, lng, address, additional_info]
    );
    
    return result.insertId;
  }
  
  // Update assistance request status
  static async updateStatus(id, status, assigned_to = null) {
    let query, params;
    
    if (assigned_to) {
      query = 'UPDATE assistance_requests SET status = ?, assigned_to = ? WHERE id = ?';
      params = [status, assigned_to, id];
    } else {
      query = 'UPDATE assistance_requests SET status = ? WHERE id = ?';
      params = [status, id];
    }
    
    const [result] = await db.execute(query, params);
    
    return result.affectedRows > 0;
  }
  
  // Delete assistance request
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM assistance_requests WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Assistance;