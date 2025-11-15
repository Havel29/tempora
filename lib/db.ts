import { Platform } from 'react-native';
import dayjs from 'dayjs';

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

export async function getAllEvents() {
  if (Platform.OS === 'web') {
    webStore = webStore ?? loadWebStore();
    return webStore!.events.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }
  
  const database = await getDb();
  const rows = await database.getAllAsync<Event>(
    'SELECT * FROM events ORDER BY createdAt DESC, id DESC;'
  );
  return rows;
}

export async function getEventStats() {
  const allEvents = await getAllEvents();
  const eventDates = await getAllEventDates();
  
  if (allEvents.length === 0) {
    return {
      total: 0,
      daysWithEvents: 0,
      oldestDate: null,
      newestDate: null,
      currentStreak: 0,
      longestStreak: 0,
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0,
    };
  }
  
  const today = new Date();
  const dates = allEvents.map(e => e.date).sort();
  const uniqueDates = Array.from(new Set(dates));
  
  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  const sortedUniqueDates = uniqueDates.sort().reverse();
  const todayStr = dayjs().format('YYYY-MM-DD');
  const yesterdayStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  
  // Check if there's an event today or yesterday for current streak
  if (sortedUniqueDates[0] === todayStr || sortedUniqueDates[0] === yesterdayStr) {
    currentStreak = 1;
    for (let i = 1; i < sortedUniqueDates.length; i++) {
      const prevDate = dayjs(sortedUniqueDates[i - 1]);
      const currDate = dayjs(sortedUniqueDates[i]);
      if (prevDate.diff(currDate, 'day') === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  for (let i = 1; i < sortedUniqueDates.length; i++) {
    const prevDate = dayjs(sortedUniqueDates[i - 1]);
    const currDate = dayjs(sortedUniqueDates[i]);
    if (prevDate.diff(currDate, 'day') === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
  
  // Calculate time-based stats
  const thisWeekStart = dayjs().startOf('week');
  const thisMonthStart = dayjs().startOf('month');
  const thisYearStart = dayjs().startOf('year');
  
  const thisWeek = allEvents.filter(e => dayjs(e.date).isAfter(thisWeekStart) || dayjs(e.date).isSame(thisWeekStart)).length;
  const thisMonth = allEvents.filter(e => dayjs(e.date).isAfter(thisMonthStart) || dayjs(e.date).isSame(thisMonthStart)).length;
  const thisYear = allEvents.filter(e => dayjs(e.date).isAfter(thisYearStart) || dayjs(e.date).isSame(thisYearStart)).length;
  
  return {
    total: allEvents.length,
    daysWithEvents: uniqueDates.length,
    oldestDate: dates[0],
    newestDate: dates[dates.length - 1],
    currentStreak,
    longestStreak,
    thisWeek,
    thisMonth,
    thisYear,
  };
}
