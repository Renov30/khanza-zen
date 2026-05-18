import mysql from 'mysql2/promise';
import { getDatabaseConfig } from './db-config';

let pool: mysql.Pool | null = null;

export async function getDbConnection() {
  if (!pool) {
    const config = getDatabaseConfig();
    
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.pass,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    
    console.log(`[Database] Pool created for ${config.host}:${config.port}/${config.database}`);
  }
  
  return pool;
}

// Ekspor db agar sesuai dengan import yang diharapkan di actions
export const db = {
  execute: async (sql: string, params?: any[]) => {
    const pool = await getDbConnection();
    return pool.execute(sql, params);
  },
  query: async (sql: string, params?: any[]) => {
    const pool = await getDbConnection();
    return pool.query(sql, params);
  }
};

/**
 * Mengeksekusi query dengan manajemen koneksi otomatis
 */
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const connection = await getDbConnection();
  const [results] = await connection.execute(sql, params);
  return results as T;
}
