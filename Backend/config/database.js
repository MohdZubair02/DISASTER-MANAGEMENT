const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert pool to use promises
const promisePool = pool.promise();

module.exports = promisePool;


const mysql = require('mysql2');
require('dotenv').config();

// Create connection without specifying database first
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  
  console.log('Connected to MySQL server');
  
  // Create database
  connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
    if (err) {
      console.error('Error creating database:', err);
      connection.end();
      return;
    }
    
    console.log(`Database '${process.env.DB_NAME}' created or already exists`);
    
    // Switch to the database
    connection.changeUser({ database: process.env.DB_NAME }, (err) => {
      if (err) {
        console.error('Error switching to database:', err);
        connection.end();
        return;
      }
      
      // Create tables
      const createTables = `
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('user', 'admin', 'responder') DEFAULT 'user',
          location VARCHAR(255),
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        
        -- Hospitals table
        CREATE TABLE IF NOT EXISTS hospitals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          lat DECIMAL(10, 8) NOT NULL,
          lng DECIMAL(11, 8) NOT NULL,
          address VARCHAR(500) NOT NULL,
          contact_phone VARCHAR(20),
          contact_email VARCHAR(255),
          total_beds INT,
          available_beds INT,
          specialties TEXT,
          status ENUM('operational', 'limited', 'closed') DEFAULT 'operational',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          SPATIAL INDEX(lat, lng)
        );
        
        -- Shelters table
        CREATE TABLE IF NOT EXISTS shelters (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          lat DECIMAL(10, 8) NOT NULL,
          lng DECIMAL(11, 8) NOT NULL,
          address VARCHAR(500) NOT NULL,
          total_capacity INT,
          available_capacity INT,
          has_food BOOLEAN DEFAULT FALSE,
          has_water BOOLEAN DEFAULT FALSE,
          has_medical BOOLEAN DEFAULT FALSE,
          has_blankets BOOLEAN DEFAULT FALSE,
          contact_phone VARCHAR(20),
          contact_email VARCHAR(255),
          status ENUM('open', 'full', 'closed') DEFAULT 'open',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          SPATIAL INDEX(lat, lng)
        );
        
        -- Reports table
        CREATE TABLE IF NOT EXISTS reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          lat DECIMAL(10, 8) NOT NULL,
          lng DECIMAL(11, 8) NOT NULL,
          address VARCHAR(500) NOT NULL,
          damage_type ENUM('flood', 'fire', 'earthquake', 'structural', 'other') NOT NULL,
          description TEXT NOT NULL,
          urgency ENUM('low', 'medium', 'high') DEFAULT 'medium',
          status ENUM('pending', 'in-progress', 'resolved') DEFAULT 'pending',
          images TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          SPATIAL INDEX(lat, lng),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );
        
        -- Assistance requests table
        CREATE TABLE IF NOT EXISTS assistance_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          assistance_type ENUM('medical', 'shelter', 'food', 'rescue', 'other') NOT NULL,
          people_count INT NOT NULL,
          contact_info VARCHAR(255) NOT NULL,
          lat DECIMAL(10, 8) NOT NULL,
          lng DECIMAL(11, 8) NOT NULL,
          address VARCHAR(500) NOT NULL,
          additional_info TEXT,
          status ENUM('pending', 'assigned', 'in-progress', 'resolved') DEFAULT 'pending',
          assigned_to INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          SPATIAL INDEX(lat, lng),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        );
        
        -- Alerts table
        CREATE TABLE IF NOT EXISTS alerts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type ENUM('warning', 'danger', 'info') DEFAULT 'warning',
          severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
          lat DECIMAL(10, 8),
          lng DECIMAL(11, 8),
          expires_at DATETIME,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `;
      
      // Split queries by semicolon and execute each one
      const queries = createTables.split(';').filter(query => query.trim() !== '');
      
      let completed = 0;
      queries.forEach(query => {
        if (query.trim() === '') return;
        
        connection.query(query + ';', (err) => {
          if (err) {
            console.error('Error creating table:', err);
          }
          
          completed++;
          if (completed === queries.length) {
            console.log('All tables created successfully');
            connection.end();
          }
        });
      });
    });
  });
});