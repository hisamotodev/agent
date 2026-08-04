const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'reports.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    threadId TEXT PRIMARY KEY,
    channelId TEXT NOT NULL,
    messageId TEXT NOT NULL,
    reportName TEXT NOT NULL,
    creatorId TEXT NOT NULL,
    creatorTag TEXT NOT NULL,
    status TEXT NOT NULL,
    resolverId TEXT,
    resolverTag TEXT
  )
`);

const insertStmt = db.prepare(`
  INSERT INTO reports (threadId, channelId, messageId, reportName, creatorId, creatorTag, status, resolverId, resolverTag)
  VALUES (@threadId, @channelId, @messageId, @reportName, @creatorId, @creatorTag, @status, @resolverId, @resolverTag)
`);

const selectStmt = db.prepare('SELECT * FROM reports WHERE threadId = ?');

const updateStmt = db.prepare(`
  UPDATE reports SET
    channelId = @channelId,
    messageId = @messageId,
    reportName = @reportName,
    creatorId = @creatorId,
    creatorTag = @creatorTag,
    status = @status,
    resolverId = @resolverId,
    resolverTag = @resolverTag
  WHERE threadId = @threadId
`);

function createReport(threadId, data) {
  insertStmt.run({ threadId, resolverId: null, resolverTag: null, ...data });
  return getReport(threadId);
}

function getReport(threadId) {
  return selectStmt.get(threadId);
}

function updateReport(threadId, patch) {
  const existing = getReport(threadId);
  if (!existing) return undefined;
  const merged = { ...existing, ...patch };
  updateStmt.run(merged);
  return merged;
}

module.exports = { createReport, getReport, updateReport };
