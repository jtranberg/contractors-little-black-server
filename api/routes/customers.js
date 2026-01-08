const express = require("express");
const Customer = require("../models/Customer");
const requireAuth = require("../middleware/requireAuth"); // adjust if your path differs

const router = express.Router();

/**
 * POST /api/customers
 * Create a customer for the logged-in user
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const { name, contact = "", issue = "", notes = "" } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const created = await Customer.create({
      ownerId,
      name: String(name).trim(),
      contact: String(contact).trim(),
      issue: String(issue).trim(),
      notes: String(notes).trim(),
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("POST /api/customers error:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

/**
 * GET /api/customers
 * List all customers for logged-in user
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const items = await Customer.find({ ownerId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("GET /api/customers error:", err);
    res.status(500).json({ error: "Failed to load customers" });
  }
});

/**
 * GET /api/customers/search?query=jay
 * Regex search (no Atlas text index required)
 */
router.get("/search", requireAuth, async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const q = String(req.query.query || "").trim();
    if (!q) return res.status(400).json({ error: "Query is required" });

    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(safe, "i");

    const results = await Customer.find({
      ownerId,
      $or: [{ name: re }, { contact: re }, { issue: re }, { notes: re }],
    }).sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    console.error("GET /api/customers/search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
