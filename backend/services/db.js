const { Pool } = require('pg');
require('dotenv').config();

/**
 * Database Singleton Class
 * 
 * Ensures that only one instance of the database connection pool exists
 * throughout the entire application. This prevents multiple database
 * connections and ensures all data operations use the same connection.
 */
class DatabaseSingleton {
  constructor() {
    // Guard: If an instance already exists, return it instead of creating a new one
    if (DatabaseSingleton.instance) {
      return DatabaseSingleton.instance;
    }

    // Create the database connection pool
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Store this instance as the singleton
    DatabaseSingleton.instance = this;
  }

  /**
   * Get the database pool instance
   * @returns {Pool} The PostgreSQL connection pool
   */
  getPool() {
    return this.pool;
  }

  /**
   * Static method to get the singleton instance
   * @returns {DatabaseSingleton} The singleton database instance
   */
  static getInstance() {
    if (!DatabaseSingleton.instance) {
      new DatabaseSingleton();
    }
    return DatabaseSingleton.instance;
  }
}

// Get the singleton instance and export its pool for backward compatibility
const dbSingleton = DatabaseSingleton.getInstance();
module.exports = dbSingleton.getPool();

