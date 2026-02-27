const path = require("path");
const fs = require("fs");

const dataPath = path.join(__dirname, "..", "data", "parcels.json");

function ensureDir() {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readAll() {
  ensureDir();
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(parcels) {
  ensureDir();
  fs.writeFileSync(dataPath, JSON.stringify(parcels, null, 2), "utf8");
}

function getNextId(parcels) {
  if (parcels.length === 0) return 1;
  return Math.max(...parcels.map((p) => p.id)) + 1;
}

module.exports = {
  getParcels(filter = {}) {
    let list = readAll();
    if (filter.status) list = list.filter((p) => p.status === filter.status);
    if (filter.surveyorLicense) list = list.filter((p) => p.surveyorLicense === filter.surveyorLicense);
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getParcelById(id) {
    const list = readAll();
    return list.find((p) => String(p.id) === String(id)) || null;
  },

  getParcelByLandId(landId) {
    const list = readAll();
    return list.find((p) => p.landId === landId) || null;
  },

  getParcelByHash(sha256Hash) {
    const list = readAll();
    return list.find((p) => p.sha256Hash === sha256Hash) || null;
  },

  insertParcel(parcel) {
    const list = readAll();
    const id = getNextId(list);
    const row = { id, ...parcel };
    list.push(row);
    writeAll(list);
    return row;
  },

  updateParcel(id, updates) {
    const list = readAll();
    const idx = list.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    writeAll(list);
    return list[idx];
  },

  deleteParcel(id) {
    const list = readAll();
    const filtered = list.filter((p) => String(p.id) !== String(id));
    if (filtered.length === list.length) return false;
    writeAll(filtered);
    return true;
  },
};
