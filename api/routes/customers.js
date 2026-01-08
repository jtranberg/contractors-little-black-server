// routes/customers.js
const router = require("express").Router();
const Customer = require("../models/Customer");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      ownerId: req.user.id, // ✅ always set on server
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message, errors: err.errors });
  }
});

module.exports = router;
