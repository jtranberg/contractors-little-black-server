router.get("/search", requireAuth, async (req, res) => {
  try {
    const q = (req.query.query || "").trim();
    if (!q) return res.status(400).json({ error: "query is required" });

    // escape user input for regex safety
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");

    const results = await Customer.find({
      ownerId: req.user.userId, // keep per-user
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
