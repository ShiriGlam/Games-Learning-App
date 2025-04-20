const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // קבלת ה-Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // הוצאת ה-token מ-header (מתחיל עם "Bearer ")
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token missing' });
    }

    // אימות ה-token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // הוספת המשתמש ל-request לצורך המשך טיפול
    next(); // העברת השליטה ל-middleware הבא
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
