const db = require('../config/database');

class Shelter {
  // Get all shelters
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM shelters');
    return rows;
  }
  
  // Find shelters near location
  static async findNearby(lat, lng, radius = 50) {
    // Using Haversine formula to calculate distance
    const [rows] = await db.execute(
      `SELECT *, 
        (6371 * acos(cos(radians(?)) * cos(radians(lat)) * 
        cos(radians(lng) - radians(?)) + sin(radians(?)) * 
        sin(radians(lat)))) AS distance 
       FROM shelters 
       HAVING distance < ? 
       ORDER BY distance`,
      [lat, lng, lat, radius]
    );
    
    return rows;
  }
  
  // Find shelter by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM shelters WHERE id = ?',
      [id]
    );
    
    return rows[0];
  }
  
  // Create a new shelter
  static async create(shelterData) {
    const { name, lat, lng, address, total_capacity, available_capacity, has_food, has_water, has_medical, has_blankets, contact_phone, contact_email, status } = shelterData;
    
    const [result] = await db.execute(
      'INSERT INTO shelters (name, lat, lng, address, total_capacity, available_capacity, has_food, has_water, has_medical, has_blankets, contact_phone, contact_email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, lat, lng, address, total_capacity, available_capacity, has_food, has_water, has_medical, has_blankets, contact_phone, contact_email, status]
    );
    
    return result.insertId;
  }
  
  // Update shelter
  static async update(id, shelterData) {
    const { name, lat, lng, address, total_capacity, available_capacity, has_food, has_water, has_medical, has_blankets, contact_phone, contact_email, status } = shelterData;
    
    const [result] = await db.execute(
      'UPDATE shelters SET name = ?, lat = ?, lng = ?, address = ?, total_capacity = ?, available_capacity = ?, has_food = ?, has_water = ?, has_medical = ?, has_blankets = ?, contact_phone = ?, contact_email = ?, status = ? WHERE id = ?',
      [name, lat, lng, address, total_capacity, available_capacity, has_food, has_water, has_medical, has_blankets, contact_phone, contact_email, status, id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Delete shelter
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM shelters WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Shelter;