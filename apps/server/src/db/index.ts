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

/**
 * Persist a finalized series match result to Neon DB
 */
export async function saveMatchResult(data: NewMatchDbRecord): Promise<MatchDbRecord | null> {
  if (!db) {
    console.warn('Skipping DB save: database connection not initialized.');
    return null;
  }

  try {
    const inserted = await db.insert(schema.matches).values(data).returning();
    const result = inserted[0] || null;
    if (result) {
      console.log(`💾 Match ${result.id} successfully saved to Neon DB.`);
    }
    return result;
  } catch (err) {
    console.error(`❌ Failed to save match ${data.id} to Neon DB:`, err);
    return null;
  }
}

/**
 * Retrieve a match record by its unique ID
 */
export async function getMatchById(matchId: string): Promise<MatchDbRecord | null> {
  if (!db) return null;

  try {
    const rows = await db
      .select()
      .from(schema.matches)
      .where(eq(schema.matches.id, matchId))
      .limit(1);

    return rows[0] || null;
  } catch (err) {
    console.error(`❌ Failed to fetch match ${matchId} from Neon DB:`, err);
    return null;
  }
}

/**
 * Retrieve recent matches for archive/history view
 */
export async function getRecentMatches(limit = 10): Promise<MatchDbRecord[]> {
  if (!db) return [];

  try {
    const rows = await db
      .select()
      .from(schema.matches)
      .orderBy(desc(schema.matches.completedAt))
      .limit(limit);

    return rows;
  } catch (err) {
    console.error('❌ Failed to fetch recent matches from Neon DB:', err);
    return [];
  }
}
