const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Set = require('../models/setModel');
exports.getUserSets = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Fetch user by ID
    const user = await User.findById(userId).populate({
      path: 'createdSets',
      populate: { path: 'words' }  // Populate words inside each set
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user's sets as JSON
    res.status(200).json({ success: true, createdSets: user.createdSets,   });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sets', error: err.message });
  }
};

const fetchWordMeaning = async (word) => {
  
  const apiKey = API_KEY; 
  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: word,
        target: 'he',
        format: 'text'
      })
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Translate API Error: ${errorText}`);
      return 'No definition found';
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Error fetching word translation:', error.message);
    return 'No definition found';
  }
};
exports.importSetByCategory = async (req, res) => {
  const userId = req.params.userId;
  const category = req.body.category || 'default-category';

  try {
    // בדיקה אם הסט כבר קיים
    const existingSet = await Set.findOne({ name: category, createdBy: userId });
    if (existingSet) {
      return res.status(200).json({ success: true, set: existingSet });
    }

    const apiUrl = `https://api.datamuse.com/words?rel_trg=${encodeURIComponent(category)}&topics=${encodeURIComponent(category)}&max=20`;

    // קריאה ל-Datamuse
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errorText}`);
    }

    const wordsData = await response.json();
    const filteredWords = wordsData
      .map(wordObj => wordObj.word) // שליפת המילים מהאובייקט
      .filter(word => word.length <= 10 && word.length > 2); // סינון מילים קצרות מדי או ארוכות מדי

    if (filteredWords.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid words found for this category' });
    }

    // תרגום ושמירת מילים
    const wordSet = [];
    for (const word of filteredWords.slice(0, 10)) { // הגבלת המילים ל-10
      const meaning = await fetchWordMeaning(word); // תרגום המילה
      wordSet.push({
        word,
        meaning: meaning || 'No definition found',
        lastAnsweredTime: new Date(),
        knowledgeCount: 0,
        answersHistory: []
      });
    }

    // שמירת הסט במסד הנתונים
    const newSet = new Set({
      name: category,
      words: wordSet,
      createdBy: userId,
      createdAt: new Date()
    });

    await newSet.save();
   // Add the set to the user's createdSets array
   const user = await User.findById(userId);
   user.createdSets.push(newSet);
   await user.save();

    // החזרת הסט ללקוח
    res.status(200).json({ success: true, set: newSet });
  } catch (error) {
    console.error('Error importing set by category:', error.message);
    res.status(500).json({ message: 'Error importing set by category', error: error.message });
  }
    
};


// Register new user 
exports.signup = async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
  
      user = new User({ username, email, password });
      await user.save();
      res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // בדיקת קיום המשתמש
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }


    if (user.password !== password) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(200).json({ success: true, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

  // Fetch user progress
  exports.getUserProgress = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // מביא את הסטים של המשתמש בלבד, ללא צורך ב־populate נוסף
      const user = await User.findById(userId).populate('createdSets');
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.status(200).json({ success: true, sets: user.createdSets });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching user progress', error: err.message });
    }
  };
  

