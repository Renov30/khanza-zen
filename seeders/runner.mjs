import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ENCRYPTION_KEY = Buffer.from('Bar12345Bar12345', 'utf8');
const IV = Buffer.from('sayangsamakhanza', 'utf8');

function decryptAES(encryptedText) {
  try {
    const decipher = crypto.createDecipheriv('aes-128-cbc', ENCRYPTION_KEY, IV);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

function getDatabaseConfig() {
  const xmlPath = path.join(process.cwd(), 'setting', 'database.xml');
  if (!fs.existsSync(xmlPath)) {
    throw new Error(`Database configuration file not found at: ${xmlPath}`);
  }
  const xmlContent = fs.readFileSync(xmlPath, 'utf8');
  const getValue = (key) => {
    const regex = new RegExp(`<entry key="${key}">(.*?)</entry>`);
    const match = xmlContent.match(regex);
    if (match && match[1]) {
      return decryptAES(match[1]);
    }
    return '';
  };
  return {
    host: getValue('HOST'),
    port: parseInt(getValue('PORT')) || 3306,
    database: getValue('DATABASE'),
    user: getValue('USER'),
    pass: getValue('PAS'),
  };
}

async function runSeeders() {
  const config = getDatabaseConfig();
  console.log(`[Seeder] Connecting to ${config.host}:${config.port}/${config.database}...`);

  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.pass,
    multipleStatements: true,
  });

  console.log('[Seeder] Connected.');

  // Create seeder tracking table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS _seeders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get already executed seeders
  const [rows] = await connection.execute('SELECT name FROM _seeders ORDER BY id');
  const executed = new Set(rows.map(r => r.name));

  // Read seeder files
  const seedersDir = path.join(__dirname);
  const files = fs.readdirSync(seedersDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let count = 0;
  for (const file of files) {
    if (executed.has(file)) {
      console.log(`[Seeder] SKIP ${file} (already executed)`);
      continue;
    }

    console.log(`[Seeder] Running ${file}...`);
    const sql = fs.readFileSync(path.join(seedersDir, file), 'utf8');

    try {
      await connection.query(sql);
      await connection.execute('INSERT INTO _seeders (name) VALUES (?)', [file]);
      console.log(`[Seeder] DONE ${file}`);
      count++;
    } catch (err) {
      console.error(`[Seeder] ERROR in ${file}:`, err.message);
      await connection.end();
      process.exit(1);
    }
  }

  console.log(`[Seeder] Complete. ${count} seeder(s) executed.`);
  await connection.end();
}

runSeeders();
