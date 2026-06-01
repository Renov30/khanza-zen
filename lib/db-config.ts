import fs from 'fs';
import path from 'path';
import { decryptAES } from './crypto';

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  pass: string;
}

/**
 * Membaca dan mem-parsing SIMRS-Bunda/setting/database.xml
 */
export function getDatabaseConfig(): DbConfig {
  const xmlPath = path.join(process.cwd(), 'setting', 'database.xml');
  
  if (!fs.existsSync(xmlPath)) {
    throw new Error(`Database configuration file not found at: ${xmlPath}`);
  }

  let xmlContent = fs.readFileSync(xmlPath, 'utf8');

  xmlContent = xmlContent.replace(/<!--[\s\S]*?-->/g, '');
  
  const getValue = (key: string): string => {
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
