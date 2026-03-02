const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

// Allow frontend origin: localhost in dev, or set CORS_ORIGIN in production (comma-separated for multiple).
// Also allow any *.vercel.app origin so preview deployments work.
const corsOriginList = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean)
  : [];
const allowedOrigins = corsOriginList.length
  ? ["http://localhost:5173", "http://127.0.0.1:5173", ...corsOriginList]
  : ["http://localhost:5173", "http://127.0.0.1:5173"];
function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true);
  const allowed = allowedOrigins.some((o) => o.replace(/\/+$/, "") === origin.replace(/\/+$/, ""));
  let vercelPreview = false;
  try {
    vercelPreview = origin ? new URL(origin).hostname.endsWith(".vercel.app") : false;
  } catch (_) {}
  return callback(null, allowed || vercelPreview);
}
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

function generateLandId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NG-LAND-${ts}-${rand}`;
}

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/parcels", (req, res) => {
  const {
    ownerName,
    nin,
    phone,
    landDescription,
    surveyorName,
    surveyorLicense,
    // Minna / UTM-style polygon points (Easting / Northing)
    points,
    // Prototype-level real-world metadata (not full legal process)
    hasSurveyPlan,
    surveyPlanNumber,
    hasDeedOfAssignment,
    deedOfAssignmentDate,
    hasTaxClearance,
    taxClearanceYear,
  } = req.body;

  const hasValidPoints =
    Array.isArray(points) &&
    points.length >= 4 &&
    points.every(
      (p) =>
        p &&
        typeof p.easting === "number" &&
        typeof p.northing === "number" &&
        Number.isFinite(p.easting) &&
        Number.isFinite(p.northing)
    );

  if (!ownerName || !nin || !phone || !landDescription || !hasValidPoints) {
    return res.status(400).json({
      message:
        "Missing required fields (owner, NIN, phone, description, or at least 4 valid coordinate points).",
    });
  }

  const createdAt = new Date().toISOString();
  const landId = generateLandId();

  const signaturePayload = JSON.stringify({
    ownerName,
    nin,
    phone,
    landDescription,
    points,
    surveyorName,
    surveyorLicense,
    // Include prototype document metadata in the signature for integrity
    hasSurveyPlan: !!hasSurveyPlan,
    surveyPlanNumber: surveyPlanNumber || null,
    hasDeedOfAssignment: !!hasDeedOfAssignment,
    deedOfAssignmentDate: deedOfAssignmentDate || null,
    hasTaxClearance: !!hasTaxClearance,
    taxClearanceYear: taxClearanceYear || null,
    createdAt,
  });
  const signature = sha256(signaturePayload);

  try {
    const row = db.insertParcel({
      landId,
      ownerName,
      nin,
      phone,
      landDescription,
      points,
      surveyorName: surveyorName || null,
      surveyorLicense: surveyorLicense || null,
      hasSurveyPlan: !!hasSurveyPlan,
      surveyPlanNumber: surveyPlanNumber || null,
      hasDeedOfAssignment: !!hasDeedOfAssignment,
      deedOfAssignmentDate: deedOfAssignmentDate || null,
      hasTaxClearance: !!hasTaxClearance,
      taxClearanceYear: taxClearanceYear || null,
      status: "PENDING",
      signature,
      sha256Hash: null,
      createdAt,
      verifiedAt: null,
    });
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create parcel" });
  }
});

app.get("/api/parcels", (req, res) => {
  const { status, surveyorLicense } = req.query;
  try {
    const rows = db.getParcels({ status, surveyorLicense });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch parcels" });
  }
});

app.get("/api/parcels/:id", (req, res) => {
  const { id } = req.params;
  try {
    const row = db.getParcelById(id);
    if (!row) return res.status(404).json({ message: "Parcel not found" });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch parcel" });
  }
});

app.post("/api/parcels/:id/approve", (req, res) => {
  const { id } = req.params;
  const row = db.getParcelById(id);
  if (!row) return res.status(404).json({ message: "Parcel not found" });
  if (row.status === "VERIFIED") {
    return res.status(400).json({ message: "Parcel is already verified and immutable" });
  }

  const verifiedAt = new Date().toISOString();
  const hashPayload = JSON.stringify({
    landId: row.landId,
    ownerName: row.ownerName,
    nin: row.nin,
    points: row.points,
    createdAt: row.createdAt,
    verifiedAt,
  });
  const sha256Hash = sha256(hashPayload);

  try {
    const updated = db.updateParcel(id, { status: "VERIFIED", sha256Hash, verifiedAt });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify parcel" });
  }
});

app.put("/api/parcels/:id", (req, res) => {
  const { id } = req.params;
  const row = db.getParcelById(id);
  if (!row) return res.status(404).json({ message: "Parcel not found" });
  if (row.status === "VERIFIED") {
    return res.status(403).json({
      message: "This land record has been VERIFIED and can no longer be edited. (Immutable C of O record.)",
    });
  }

  const {
    ownerName,
    nin,
    phone,
    landDescription,
    points,
    hasSurveyPlan,
    surveyPlanNumber,
    hasDeedOfAssignment,
    deedOfAssignmentDate,
    hasTaxClearance,
    taxClearanceYear,
  } = req.body;
  try {
    const updated = db.updateParcel(id, {
      ownerName,
      nin,
      phone,
      landDescription,
      points,
      hasSurveyPlan: !!hasSurveyPlan,
      surveyPlanNumber: surveyPlanNumber || null,
      hasDeedOfAssignment: !!hasDeedOfAssignment,
      deedOfAssignmentDate: deedOfAssignmentDate || null,
      hasTaxClearance: !!hasTaxClearance,
      taxClearanceYear: taxClearanceYear || null,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update parcel" });
  }
});

app.delete("/api/parcels/:id", (req, res) => {
  const { id } = req.params;
  const row = db.getParcelById(id);
  if (!row) return res.status(404).json({ message: "Parcel not found" });
  if (row.status === "VERIFIED") {
    return res.status(403).json({
      message: "This land record has been VERIFIED and can no longer be deleted. (Immutable C of O record.)",
    });
  }
  try {
    const ok = db.deleteParcel(id);
    if (!ok) return res.status(500).json({ message: "Failed to delete parcel" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete parcel" });
  }
});

app.get("/api/verify", (req, res) => {
  const { landId, hash } = req.query;
  if (!landId && !hash) {
    return res.status(400).json({ message: "Provide a Land ID or SHA-256 hash" });
  }
  try {
    const row = landId ? db.getParcelByLandId(landId) : db.getParcelByHash(hash);
    if (!row) {
      return res.status(404).json({ message: "No land record found for supplied details" });
    }
    res.json({
      landId: row.landId,
      ownerName: row.ownerName,
      status: row.status,
      sha256Hash: row.sha256Hash,
      verifiedAt: row.verifiedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify land record" });
  }
});

app.listen(PORT, () => {
  console.log(`DLRS backend listening on http://localhost:${PORT}`);
});
