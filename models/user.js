import mongoose from "mongoose";

const CCRSchema = new mongoose.Schema({
  name: { type: String, required: true },
  wave: { type: Number, required: true }, // Correct type for floats
  // Add other fields as necessary
});

// Use a consistent model name
const CCR = mongoose.models.CCR || mongoose.model("CCR", CCRSchema);

export default CCR;
