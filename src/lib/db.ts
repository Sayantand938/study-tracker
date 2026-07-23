import { openDB, type IDBPDatabase } from 'idb';
import type { Session } from '@/types';

const DB_NAME = 'StudyTrackerDB';
const STORE_NAME = 'sessions';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('startTime', 'startTime');
                    // Index to quickly find active sessions (endTime === null)
                    store.createIndex('endTime', 'endTime');
                }
            },
        });
    }
    return dbPromise;
}

export async function getAllSessions(): Promise<Session[]> {
    const db = await getDB();
    const all = await db.getAll(STORE_NAME);
    return all.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

export async function addSession(session: Session): Promise<void> {
    const db = await getDB();
    await db.add(STORE_NAME, session);
}

export async function addSessions(sessions: Session[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const session of sessions) {
        await tx.store.add(session);
    }
    await tx.done;
}

export async function clearAllSessions(): Promise<void> {
    const db = await getDB();
    await db.clear(STORE_NAME);
}

export async function deleteSessionById(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
}

// --- NEW FUNCTIONS ---

export async function getActiveSession(): Promise<Session | undefined> {
    const db = await getDB();
    const index = db.transaction(STORE_NAME).store.index('endTime');
    const active = await index.getAll(null);
    return active[0];
}

export async function createSession(session: Session): Promise<void> {
    const db = await getDB();
    await db.add(STORE_NAME, session);
}

export async function updateSession(
    id: string,
    updates: Partial<Omit<Session, 'id'>>
): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.store;
    const existing = await store.get(id);
    if (!existing) throw new Error(`Session ${id} not found`);
    const updated = { ...existing, ...updates };
    await store.put(updated);
    await tx.done;
}