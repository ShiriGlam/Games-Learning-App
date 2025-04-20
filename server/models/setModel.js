const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const setSchema = new Schema({
  name: { type: String, required: true, unique: true },
  words: [
    {
      word: { type: String, required: true },
      meaning: { type: String, required: true },
      lastAnsweredTime: { type: Date, default: Date.now },
      knowledgeCount: { type: Number, default: 0 },
      answersHistory: [
        {
          answeredCorrectly: { type: Boolean, required: true },
          timestamp: { type: Date, default: Date.now }
        }
      ]
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Ensure this field is required
});

module.exports = mongoose.model('Set', setSchema);
