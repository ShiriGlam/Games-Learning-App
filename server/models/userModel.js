const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: function() { return !this.googleId; } // Only required if googleId is not present
  },
  googleId: {  // Field to store the Google ID for Google-authenticated users
    type: String,
    unique: true
  },
  createdSets: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Set' 
  }],
  progress: [{
    setId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Set', 
      required: true 
    },
    wordsKnown: { 
      type: Number, 
      default: 0 
    },
    totalWords: { 
      type: Number, 
      default: 0 
    }
  }]
}, { 
  timestamps: true 
});

const User = mongoose.model('User', userSchema);
module.exports = User;
