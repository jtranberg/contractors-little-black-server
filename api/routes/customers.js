// api/routes/customers.js
const router = require("express").Router();
const Customer = require("../models/Customer");
const auth = require("../middleware/auth");

// ✅ GET /api/customers?page=2&limit=20
router.get("/", auth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const filter = { ownerId: req.user.id };

    const [items, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Customer.countDocuments(filter),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST /api/customers
router.post("/", auth, async (req, res) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      ownerId: req.user.id,
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message, errors: err.errors });
  }
});

module.exports = router;
