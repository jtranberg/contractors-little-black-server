const express = require("express");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

/** ✅ MUST be before "/:id" routes */
router.get("/search", requireAuth, async (req, res) => {
  try {
    const q = (req.query.query || "").trim();
    if (!q) return res.status(400).json({ error: "query is required" });

    // escape regex input
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");

    const results = await Customer.find({
      ownerId: req.user.userId, // keep searches per-user (recommended)
      $or: [
        { name: regex },
        { contact: regex },
        { issue: regex },
        { notes: regex },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(results);
  } catch (err) {
    console.error("SEARCH_FAILED:", err);
    return res.status(500).json({ error: "Search failed" });
  }
});

/** Example: other routes AFTER search */
router.get("/", requireAuth, async (req, res) => {
  const customers = await Customer.find({ ownerId: req.user.userId }).sort({ createdAt: -1 });
  res.json({ customers });
});

/** ✅ Put "/:id" LAST and guard it */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const c = await Customer.findOne({ _id: id, ownerId: req.user.userId });
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json(c);
  } catch (err) {
    console.error("GET_BY_ID_FAILED:", err);
    res.status(500).json({ error: "Failed" });
  }
});

module.exports = router;
