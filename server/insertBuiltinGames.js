require('dotenv').config({ path: '../server/config/.env.app' });
const mongoose = require('mongoose');
const Game = require('./models/gameModel');
const User = require('./models/userModel');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const mime = require('mime-types');
const { v4: uuidv4 } = require('uuid');

const AWS_REGION = 'eu-north-1';
const BUCKET_NAME = 'htmlegamesbucket';
const S3 = new AWS.S3({
  accessKeyId:accessKeyId,
  secretAccessKey: accessKeyId,
  region: AWS_REGION,
});

const GAMES_DIR = path.join(__dirname, '../shared/public/html_games');

const builtInGames = [
  {
    name: 'Flappy Vocabulary',
    creator: 'BuildIn',
    language: 'JavaScript',
    category: 'Reflex',
    imageUrl: null,
    gameFolderPath: 'builtin_balloons/',
    entryFile: 'index.html',
    localFolder: 'builtin_balloons'
  },
  {
    name: 'Walking Sign Game',
    creator: 'BuildIn',
    language: 'JavaScript',
    category: 'Word Meaning',
    imageUrl: null,
    gameFolderPath: 'builtin_kid/',
    entryFile: 'index.html',
    localFolder: 'builtin_kid'
  },
  {
    name: 'Bird fly Game',
    creator: 'BuildIn',
    language: 'JavaScript',
    category: 'Word Meaning',
    imageUrl: null,
    gameFolderPath: 'builtin_bird/',
    entryFile: 'index.html',
    localFolder: 'builtin_bird'
  }
];

const injectSDK = (folderPath) => {
  const sdkPath = path.join(__dirname, '../shared/public/sdk/game-sdk.js');
  const targetSdkPath = path.join(folderPath, 'game-sdk.js');
  fs.copyFileSync(sdkPath, targetSdkPath);

  const indexPath = path.join(folderPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    const sdkScript = '<script src="game-sdk.js"></script>';

    if (!html.includes(sdkScript)) {
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${sdkScript}\n</head>`);
      } else if (html.includes('<body>')) {
        html = html.replace('<body>', `<body>\n${sdkScript}`);
      } else {
        html = sdkScript + '\n' + html;
      }
      fs.writeFileSync(indexPath, html, 'utf8');
    }
  }
};

const uploadDirToS3 = async (localPath, s3BasePath) => {
  const files = fs.readdirSync(localPath);
  for (const file of files) {
    const fullPath = path.join(localPath, file);
    const key = `${s3BasePath}${file}`;

    if (fs.lstatSync(fullPath).isDirectory()) {
      await uploadDirToS3(fullPath, `${key}/`);
    } else {
      const fileContent = fs.readFileSync(fullPath);
      await S3.upload({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: mime.lookup(fullPath) || 'application/octet-stream'
      }).promise();
    }
  }
};

async function insertGames() {
  try {
    await mongoose.connect("mongodb://localhost:27017/app", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    let buildInUser = await User.findOne({ username: 'BuildIn' });
    if (!buildInUser) {
      buildInUser = new User({
        username: 'BuildIn',
        email: 'buildin@example.com',
        password: 'BuildIn'
      });
      await buildInUser.save();
      console.log('👤 Created BuildIn user');
    }
    for (const game of builtInGames) {
      const exists = await Game.findOne({ name: game.name, creator: 'BuildIn' });
      if (exists) {
        console.log(`⚠️ Game already exists: ${game.name}`);
        continue;
      }

      const gameId = uuidv4();
      const folderPath = path.join(__dirname, `../shared/public/html_games/${game.gameFolderPath}`);
      const s3Path = `games/game_${gameId}/`;

      injectSDK(folderPath);
      await uploadDirToS3(folderPath, s3Path);

      // ניקוי מקומי לאחר ההעלאה (לא חובה)
      const sdkInGame = path.join(folderPath, 'game-sdk.js');
      if (fs.existsSync(sdkInGame)) fs.unlinkSync(sdkInGame);

      const newGame = new Game({
        name: game.name,
        creator: game.creator,
        language: game.language,
        category: game.category,
        imageUrl: null,
        gameFolderPath: s3Path,
        entryFile: 'index.html',
        createdBy: buildInUser._id,
        gameUrl: `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${s3Path}index.html`
      });

      await newGame.save();
      console.log(`✅ Inserted and uploaded game: ${game.name}`);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error inserting built-in games:', err);
  }
}

insertGames();