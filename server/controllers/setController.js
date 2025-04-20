const User = require('../models/userModel');
const Set = require('../models/setModel');
const mongoose = require('mongoose');

exports.createSet = async (req, res) => {
  try {
    const { setName, words } = req.body; // Assuming words is an array of objects (word and meaning)
    const userId = req.user.userId; // User ID from the authentication middleware
    const existingSet = await Set.findOne({ name: setName });
    if (existingSet) {
      return res.status(400).json({ success: false, message: 'Set name already exists. Please choose a different name.' });
    }
    
    // Create a new set
    const newSet = new Set({
      name: setName,
      words,
      createdBy: userId,
    }); 

    console.log('name create set:', newSet.name);

    // Save the set to the database
    await newSet.save();

    // Add the set to the user's createdSets array
    const user = await User.findById(userId);
    user.createdSets.push(newSet);
    await user.save();

    res.status(201).json({ success: true, set: newSet });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
exports.updateSet = async (req, res) => {
  try {
    const { setId } = req.params; // מזהה הסט
    const { words } = req.body; 

    // חיפוש הסט ועדכונו
    const updatedSet = await Set.findByIdAndUpdate(
      setId,
      { words },
      { new: true, runValidators: true }
    );

    if (!updatedSet) {
      return res.status(404).json({ success: false, message: 'Set not found' });
    }

    res.status(200).json({ success: true, set: updatedSet });
  } catch (err) {
    console.error('Error updating set:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Fetch set by name or ID
exports.getSetById = async (req, res) => {
  try {
    const { setId} = req.params;
    
    // Try to find the set by ID first
    let set;
    if (mongoose.Types.ObjectId.isValid(setId)) {
      // חפש לפי מזהה
      set = await Set.findById(setId);
    } 
    
    // If not found by ID, try to find by name
    if (!set) {
      set = await Set.findOne({ name: setId });
    }

    if (!set) {
      return res.status(404).json({ success: false, message: 'Set not found' });
    }

    res.status(200).json({ success: true, set });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
exports.searchSets = async (req, res) => {
  try {
    const query = req.params.query;
    
    const sets = await Set.find({ name: { $regex: query, $options: 'i' } }); 
    if (sets.length === 0) {
      return res.status(404).json({ success: false, message: 'No sets found' });
    }

    res.status(200).json({ success: true, sets });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching sets', error: err.message });
  }
};
// Update knowledge count and answersHistory for a specific word in a set
exports.updateKnowledgeCount = async (req, res) => {
  try {
    const { setName } = req.params; // שם הסט
    const { wordId, change, wasCorrect } = req.body;

    // חיפוש הסט לפי setName
    const result = await Set.findOneAndUpdate(
      { name: setName, "words.word": wordId }, // חיפוש לפי שם הסט והמילה
      {
        $inc: { "words.$.knowledgeCount": change },
        $set: { "words.$.lastAnsweredTime": Date.now() }, // עדכון זמן התשובה האחרונה
        $push: { "words.$.answersHistory": { answeredCorrectly: wasCorrect, timestamp: Date.now() } } // הוספת היסטוריה
      },
      { new: true, runValidators: true } // החזרת הסט המעודכן
    );

    if (!result) {
      return res.status(404).json({ success: false, message: `Set with name "${setName}" or word "${wordId}" not found` });
    }

    res.status(200).json({ success: true, message: 'Knowledge count updated successfully', updatedSet: result });
  } catch (err) {
    console.error('Error updating knowledge count:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// Fetch set by name or ID
exports.getWeakSetById = async (req, res) => {
  try {
    const { setId } = req.params;
    
    // Try to find the set by ID first
    let set;
    if (mongoose.Types.ObjectId.isValid(setId)) {
      // חפש לפי מזהה
      set = await Set.findById(setId);
    } 
    
    // If not found by ID, try to find by name
    if (!set) {
      set = await Set.findOne({ name: setId });
    }

    if (!set) {
      return res.status(404).json({ success: false, message: 'Set not found' });
    }

    // סינון המילים שהknowledgeCount שלהם שלילי
    const weakWords = set.words.filter(word => word.knowledgeCount <= 0);

    // יצירת סט חדש עם המילים החלשות
    const weakSet = {
      _id: set._id,
      name: set.name,
      words: weakWords
    };

    res.status(200).json({ success: true, set: weakSet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};