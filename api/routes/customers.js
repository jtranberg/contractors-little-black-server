const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const Customer = require("../models/Customer");

const router = express.Router();

// All routes below require auth
router.use(requireAuth);

// GET /api/customers?page=1&limit=20
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const filter = { ownerId: req.user.id };

    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Customer.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.json({
      customers,
      currentPage: page,
      totalPages,
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// GET /api/customers/search?query=abc
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.query || "").trim();
    if (!q) return res.json([]);

    const results = await Customer.find({
      ownerId: req.user.id,
      $text: { $search: q },
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(results);
  } catch (err) {
    console.error(err);
    // fallback if text index not ready
    res.status(500).json({ error: "Search failed" });
  }
});

// POST /api/customers
router.post("/", async (req, res) => {
  try {
    const { name, contact = "", issue = "", notes = "" } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ error: "Name is required" });

    const created = await Customer.create({
      ownerId: req.user.id,
      name: name.trim(),
      contact,
      issue,
      notes,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

module.exports = router;
