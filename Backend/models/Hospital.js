const db = require('../config/database');

class Hospital {
  // Get all hospitals
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM hospitals');
    return rows;
  }
  
  // Find hospitals near location
  static async findNearby(lat, lng, radius = 50) {
    // Using Haversine formula to calculate distance
    const [rows] = await db.execute(
      `SELECT *, 
        (6371 * acos(cos(radians(?)) * cos(radians(lat)) * 
        cos(radians(lng) - radians(?)) + sin(radians(?)) * 
        sin(radians(lat)))) AS distance 
       FROM hospitals 
       HAVING distance < ? 
       ORDER BY distance`,
      [lat, lng, lat, radius]
    );
    
    return rows;
  }
  
  // Find hospital by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM hospitals WHERE id = ?',
      [id]
    );
    
    return rows[0];
  }
  
  // Create a new hospital
  static async create(hospitalData) {
    const { name, lat, lng, address, contact_phone, contact_email, total_beds, available_beds, specialties, status } = hospitalData;
    
    const [result] = await db.execute(
      'INSERT INTO hospitals (name, lat, lng, address, contact_phone, contact_email, total_beds, available_beds, specialties, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, lat, lng, address, contact_phone, contact_email, total_beds, available_beds, specialties, status]
    );
    
    return result.insertId;
  }
  
  // Update hospital
  static async update(id, hospitalData) {
    const { name, lat, lng, address, contact_phone, contact_email, total_beds, available_beds, specialties, status } = hospitalData;
    
    const [result] = await db.execute(
      'UPDATE hospitals SET name = ?, lat = ?, lng = ?, address = ?, contact_phone = ?, contact_email = ?, total_beds = ?, available_beds = ?, specialties = ?, status = ? WHERE id = ?',
      [name, lat, lng, address, contact_phone, contact_email, total_beds, available_beds, specialties, status, id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Delete hospital
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hospitals WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Hospital;