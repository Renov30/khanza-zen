import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  action: string;
  user: string;
  noRawat: string;
  message: string;
  detail?: string;
}

function getLogPath(): string {
  const envPath = process.env.LOG_PATH;
  if (envPath) return envPath;
  return path.join(process.cwd(), 'logs');
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function logFilePath(): string {
  const base = getLogPath();
  const cpptDir = path.join(base, 'cppt');
  ensureDir(cpptDir);
  const today = new Date().toISOString().slice(0, 10);
  return path.join(cpptDir, `${today}.log`);
}

function formatEntry(entry: LogEntry): string {
  return [
    `[${entry.timestamp}]`,
    `[${entry.level}]`,
    `[${entry.action}]`,
    `[${entry.user}]`,
    `[${entry.noRawat}]`,
    entry.message,
    entry.detail ? ` | ${entry.detail}` : '',
  ].join(' ');
}

export async function writeLog(entry: LogEntry) {
  if (process.env.LOG_ENABLED === 'false') return;
  try {
    const line = formatEntry(entry) + '\n';
    const filePath = logFilePath();
    fs.appendFileSync(filePath, line, 'utf8');
  } catch (err) {
    console.error('File log gagal ditulis:', err);
  }
}

/**
 * Mencatat log untuk operasi simpan/edit/hapus CPPT.
 */
export async function logCppt(
  action: 'SIMPAN' | 'EDIT' | 'HAPUS',
  user: string,
  noRawat: string,
  status: 'BERHASIL' | 'GAGAL',
  message: string,
  detail?: string,
) {
  await writeLog({
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    level: status === 'BERHASIL' ? 'INFO' : 'ERROR',
    action,
    user,
    noRawat,
    message: `${status} - ${message}`,
    detail,
  });
}
