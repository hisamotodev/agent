const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'reports.json');

function load() {
  if (!fs.existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return {};
  }
}

let reports = load();

function save() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), 'utf8');
}

function createReport(threadId, data) {
  reports[threadId] = { threadId, ...data };
  save();
  return reports[threadId];
}

function getReport(threadId) {
  return reports[threadId];
}

function updateReport(threadId, patch) {
  if (!reports[threadId]) return undefined;
  reports[threadId] = { ...reports[threadId], ...patch };
  save();
  return reports[threadId];
}

module.exports = { createReport, getReport, updateReport };
