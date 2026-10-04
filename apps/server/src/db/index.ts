import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { desc, eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as schema from './schema.js';
import type { MatchDbRecord, NewMatchDbRecord } from './schema.js';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (connectionString) {
  try {
    const sql = neon(connectionString);
    dbInstance = drizzle(sql, { schema });
    console.log('✅ Connected to Neon PostgreSQL database.');
  } catch (err) {
    console.error('⚠️ Failed to initialize Neon PostgreSQL connection:', err);
  }
} else {
  console.warn('⚠️ No DATABASE_URL provided. Running with in-memory persistence only.');
}

export const db = dbInstance;

const inMemoryMatches = new Map<string, MatchDbRecord>();

function createInMemoryRecord(data: NewMatchDbRecord): MatchDbRecord {
  return {
    id: data.id,
    roomCode: data.roomCode,
    targetWins: data.targetWins ?? 3,
    playerAId: data.playerAId,
    playerAName: data.playerAName,
    playerBId: data.playerBId,
    playerBName: data.playerBName,
    winnerId: data.winnerId ?? null,
    winnerName: data.winnerName ?? null,
    scoreA: data.scoreA ?? 0,
    scoreB: data.scoreB ?? 0,
    totalRounds: data.totalRounds ?? 0,
    rounds: (data.rounds as MatchDbRecord['rounds']) ?? [],
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
  };
}

function getInMemoryRecentMatches(limit = 10): MatchDbRecord[] {
  const all = Array.from(inMemoryMatches.values());
  all.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  return all.slice(0, limit);
}

/**
 * Persist a finalized series match result to Neon DB (or in-memory store if DB is unavailable)
 */
export async function saveMatchResult(data: NewMatchDbRecord): Promise<MatchDbRecord | null> {
  if (!db) {
    const record = createInMemoryRecord(data);
    inMemoryMatches.set(record.id, record);
    return record;
  }

  try {
    const inserted = await db.insert(schema.matches).values(data).returning();
    const result = inserted[0] || null;
    if (result) {
      console.log(`💾 Match ${result.id} successfully saved to Neon DB.`);
      inMemoryMatches.set(result.id, result);
    }
    return result;
  } catch (err) {
    console.error(`❌ Failed to save match ${data.id} to Neon DB, falling back to in-memory:`, err);
    const record = createInMemoryRecord(data);
    inMemoryMatches.set(record.id, record);
    return record;
  }
}

/**
 * Retrieve a match record by its unique ID
 */
export async function getMatchById(matchId: string): Promise<MatchDbRecord | null> {
  if (!db) {
    return inMemoryMatches.get(matchId) || null;
  }

  try {
    const rows = await db
      .select()
      .from(schema.matches)
      .where(eq(schema.matches.id, matchId))
      .limit(1);

    return rows[0] || inMemoryMatches.get(matchId) || null;
  } catch (err) {
    console.error(`❌ Failed to fetch match ${matchId} from Neon DB:`, err);
    return inMemoryMatches.get(matchId) || null;
  }
}

/**
 * Retrieve recent matches for archive/history view
 */
export async function getRecentMatches(limit = 10): Promise<MatchDbRecord[]> {
  if (!db) {
    return getInMemoryRecentMatches(limit);
  }

  try {
    const rows = await db
      .select()
      .from(schema.matches)
      .orderBy(desc(schema.matches.completedAt))
      .limit(limit);

    if (rows.length > 0) return rows;
    return getInMemoryRecentMatches(limit);
  } catch (err) {
    console.error('❌ Failed to fetch recent matches from Neon DB:', err);
    return getInMemoryRecentMatches(limit);
  }
}
