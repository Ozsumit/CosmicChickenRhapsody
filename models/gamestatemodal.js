import mongoose from "mongoose";

const GameStateSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  gameState: { type: Object, required: true },
});

export default mongoose.models.GameState ||
  mongoose.model("GameState", GameStateSchema);
