import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp } from '../src/app.js';
import { initializeDatabase } from '../src/db/schema.js';
import { closeDb, getDb } from '../src/db/database.js';

describe('Integration Tests: API Endpoints & State Integrity', () => {
  let app: any;

  beforeEach(() => {
    process.env.DATABASE_PATH = ':memory:';
    initializeDatabase();
    app = createApp();
  });

  afterEach(() => {
    closeDb();
  });

  it('GET /api/health: returns ok status and timestamp', async () => {
    // Test with in-process fetch or request
    const server = app.listen(0);
    const port = server.address().port;

    const res = await fetch(`http://localhost:${port}/api/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();

    server.close();
  });

  it('GET /api/platforms: returns all 4 platforms in disconnected state when empty', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    const res = await fetch(`http://localhost:${port}/api/platforms`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(4);

    const leetcode = json.data.find((p: any) => p.platform === 'leetcode');
    expect(leetcode).toBeDefined();
    expect(leetcode.connected).toBe(false);
    expect(leetcode.username).toBeNull();
    expect(leetcode.stats).toBeNull();

    server.close();
  });

  it('POST /api/goals & GET /api/goals: creates and retrieves a goal with calculated fields', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    const createRes = await fetch(`http://localhost:${port}/api/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Master Trees & Graphs',
        goal_type: 'problems_solved',
        target: 20,
        platform: 'leetcode',
        start_date: '2026-09-01',
        end_date: '2026-10-31'
      })
    });
    expect(createRes.status).toBe(200);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.data.title).toBe('Master Trees & Graphs');
    expect(createData.data.current).toBe(0);
    expect(createData.data.progress_percentage).toBe(0);

    const getRes = await fetch(`http://localhost:${port}/api/goals`);
    const getData = await getRes.json();
    expect(getData.data.length).toBe(1);
    expect(getData.data[0].id).toBe(createData.data.id);

    server.close();
  });

  it('POST /api/platforms/connect: rejects invalid platform name with 400', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    const res = await fetch(`http://localhost:${port}/api/platforms/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'hackerrank_unsupported',
        username: 'someone'
      })
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);

    server.close();
  });
});
