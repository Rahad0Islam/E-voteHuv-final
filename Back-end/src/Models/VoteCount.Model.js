import mongoose from "mongoose";

// Store only counters per event; no voter or per-user history
const VoteCountSchema = new mongoose.Schema({
  EventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VoteEvent",
    required: true,
    index: true,
  },
  ElectionType: {
    type: String,
    enum: ["Single", "Rank", "MultiVote"],
    required: true,
  },
  // Tally per nominee
  Tally: [
    {
      NomineeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      // For Single/Multi counts
      TotalVote: { type: Number, default: 0 },
      // For Rank counts (lower is better). If not rank, keep 0.
      TotalRank: { type: Number, default: 0 },
    },
  ],
}, { timestamps: true })

// Ensure unique per event + type to avoid duplicates
VoteCountSchema.index({ EventID: 1, ElectionType: 1 }, { unique: true })

export const VoteCount = mongoose.model("VoteCount", VoteCountSchema)