import { Platform } from 'react-native';

type SQLiteNS = typeof import('expo-sqlite');
let SQLiteMod: SQLiteNS | null = null;

async function getSQLite(): Promise<SQLiteNS> {
  if (!SQLiteMod) {
    SQLiteMod = await import('expo-sqlite');
  }
  return SQLiteMod;
}

export type Event = {
  id?: number;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  source: 'user';
  createdAt?: string;
};

// ---- Web fallback (localStorage) ----
const WEB_EVENTS_KEY = 'tempora_events_v1';

type WebStore = {
  events: Event[];
  nextId: number;
};

function loadWebStore(): WebStore {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(WEB_EVENTS_KEY) : null;
    const events: Event[] = raw ? JSON.parse(raw) : [];
    const nextId = (events.reduce((m, e) => Math.max(m, e.id || 0), 0) || 0) + 1;
    return { events, nextId };
  } catch {
    return { events: [], nextId: 1 };
  }
}

function saveWebStore(store: WebStore) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(WEB_EVENTS_KEY, JSON.stringify(store.events));
    }
  } catch {}
}

let webStore: WebStore | null = Platform.OS === 'web' ? loadWebStore() : null;

// ---- Native SQLite ----
let dbPromise: Promise<import('expo-sqlite').SQLiteDatabase> | null = null;

async function getDb(): Promise<import('expo-sqlite').SQLiteDatabase> {
  if (!dbPromise) {
    const SQLite = await getSQLite();
    dbPromise = SQLite.openDatabaseAsync('tempora.db');
  }
  return dbPromise as Promise<import('expo-sqlite').SQLiteDatabase>;
}

// ---- Public API ----
export async function initDb() {
  if (Platform.OS === 'web') {
    webStore = webStore ?? loadWebStore();
    return;
  }
  
  const database = await getDb();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
  `);
}

export async function addEvent(e: Event) {
  const { title, description = '', date, source = 'user' } = e;
  
  if (Platform.OS === 'web') {
    webStore = webStore ?? loadWebStore();
    const id = webStore!.nextId++;
    const createdAt = new Date().toISOString();
    webStore!.events.unshift({ id, title, description, date, source, createdAt });
    saveWebStore(webStore!);
    return id;
  }
  
  const database = await getDb();
  const result = await database.runAsync(
    'INSERT INTO events (title, description, date, source) VALUES (?, ?, ?, ?);',
    [title, description, date, source]
  );
  return result.lastInsertRowId as number;
}

export async function deleteEvent(id: number) {
  if (Platform.OS === 'web') {
    webStore = webStore ?? loadWebStore();
    webStore!.events = webStore!.events.filter((e) => e.id !== id);
    saveWebStore(webStore!);
    return;
  }
  
  const database = await getDb();
  await database.runAsync('DELETE FROM events WHERE id = ?;', [id]);
}

export async function getEventsByDate(date: string) {
  if (Platform.OS === 'web') {
    webStore = webStore ?? loadWebStore();
    return webStore!.events
      .filter((e) => e.date === date)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }
  
  const database = await getDb();
  const rows = await database.getAllAsync<Event>(
    'SELECT * FROM events WHERE date = ? ORDER BY createdAt DESC, id DESC;',
    [date]
  );
  return rows;
}

export async function getAllEventDates() {
  if (Platform.OS === 'web') {
    webStore = webStore ?? loadWebStore();
    const map: Record<string, number> = {};
    for (const e of webStore!.events) {
      map[e.date] = (map[e.date] || 0) + 1;
    }
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }
  
  const database = await getDb();
  const rows = await database.getAllAsync<{ date: string; count: number }>(
    'SELECT date, COUNT(*) as count FROM events GROUP BY date;'
  );
  return rows;
}
