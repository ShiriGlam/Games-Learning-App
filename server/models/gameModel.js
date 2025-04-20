// ✅ models/Game.js (מעודכן)
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creator: { type: String, required: true },
  language: { type: String, enum: ['JavaScript', 'Python'], required: true }, 
  popularity: { type: Number, default: 0 },
  usersPlayed: { type: Number, default: 0 },
  category: { type: String, required: true },
  averageRating: { type: Number, default: 0 },
  imageUrl: { type: String },
  gameFolderPath: { type: String },
  entryFile: { type: String, default: 'index.html' },
   gameUrl: String
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;