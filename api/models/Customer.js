const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true, trim: true },
    contact: { type: String, default: "", trim: true },
    issue: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },

    // optional flags later:
    // severity: { type: String, enum: ["low","medium","high"], default: "low" },
  },
  { timestamps: true }
);

customerSchema.index({ name: "text", contact: "text", issue: "text", notes: "text" });

module.exports = mongoose.model("Customer", customerSchema);
