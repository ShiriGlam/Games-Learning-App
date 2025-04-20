
const Game = require('../models/gameModel');
// ✅ חדש: createGame.js – יצירת משחק מהקוד והעלאה ל-S3
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const mime = require('mime-types');

const s3 = new AWS.S3({
  accessKeyId:AWS_API_KEY,
  secretAccessKey: AWS_API_KEY,
  region: "eu-north-1"
});

const BUCKET_NAME = "htmlegamesbucket";
const AWS_REGION = "eu-north-1"
exports.createGame = async (req, res) => {
  try {
    const { name, creator, language, category, code, css, image } = req.body; 
    const userId = req.user.userId;
    const gameId = uuidv4();

    // בנה את תוכן ה-HTML
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${name}</title>
      <style>${css || ''}</style>
      <script src="/sdk/game-sdk.js"></script>
    </head>
    <body>
      <div id="game-container"></div>
      <script>
        const words = [];
        function reportResultToParent(success, details = {}) {
          const appOrigin = "http://localhost:3000";
          window.opener?.postMessage({
            type: 'gameEvent',
            event: success ? 'success' : 'failure',
            details,
          }, appOrigin);
        }
        ${code}
      </script>
    </body>
    </html>
    `;

    // העלה את הקובץ ל-S3
    const s3Key = `games/game_${gameId}/index.html`;
    await s3.upload({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: htmlContent,
      ContentType: 'text/html'
    }).promise();

    const gameUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;

    const newGame = new Game({
      name,
      creator,
      createdBy: userId,
      language,
      category,
      imageUrl: image,
      gameFolderPath: `games/game_${gameId}/`,
      entryFile: 'index.html',
      gameUrl
    });

    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    console.error('Error creating manual game (S3):', error);
    res.status(400).json({ message: 'Error creating new game', error });
  }
};


exports.deleteGame = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.userId;

  try {
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    if (game.createdBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this game' });
    }

    await game.deleteOne();

    res.status(200).json({ success: true, message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getGames = async (req, res) => {
  try {
    const games = await Game.find({});
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching games', error: error });
  }
};
exports.getTop3Games = async (req, res) => {
  try {
    const games = await Game.find({})
      .sort({ popularity: -1 })
      .limit(3);

    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching games', error: error });
  }
};

exports.searchGames = async (req, res) => {
  try {
    const query = req.params.query;
    const games = await Game.find({ name: { $regex: query, $options: 'i' } }); // חיפוש לא תלוי אותיות קטנות/גדולות
    res.status(200).json({ success: true, games });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching games', error });
  }
};

exports.updatePopularity = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    game.popularity += 1;
    await game.save();

    res.status(200).json({ success: true, game });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating popularity', error });
  }
};

exports.rateGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { rating } = req.body;

    if (!gameId || !rating || isNaN(rating)) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    game.averageRating = (game.averageRating * game.usersPlayed + rating) / (game.usersPlayed + 1);
    game.usersPlayed += 1;

    await game.save();
    res.status(200).json({ success: true, message: 'Game rated successfully', game });
  } catch (error) {
    console.error('Error rating game:', error);
    res.status(500).json({ success: false, message: 'Error rating game', error });
  }
};

exports.builtin = async (req, res) => {
  try {
      const builtInGames = await Game.find({ creator: 'BuildIn' });
      res.status(200).json(builtInGames);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching games', error: error });
  }
};