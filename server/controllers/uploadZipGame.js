// ✅ חדש: uploadZipGame.js להעלאה ל-S3 במקום לתיקייה מקומית
const unzipper = require('unzipper');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Game = require('../models/gameModel');
const AWS = require('aws-sdk');
const mime = require('mime-types');
const SDK_SCRIPT = '<script src="/sdk/game-sdk.js"></script>';

const BUCKET_NAME = AWS_API_KEY;
const AWS_REGION = AWS_API_KEY
const AWS_ACCESS_KEY=AWS_API_KEY;
const AWS_SECRET_KEY =AWS_API_KEY;
// הגדרות S3
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_REGION
});


exports.uploadZipGame = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, creator, language, category } = req.body;
    const zipFile = req.file;

    if (!zipFile) return res.status(400).json({ message: 'ZIP file is missing' });

    const gameId = uuidv4();
    const tempDir = path.join(__dirname, `../../temp/game_${gameId}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // חילוץ קבצי ZIP לתיקייה זמנית
    await fs.createReadStream(zipFile.path)
      .pipe(unzipper.Extract({ path: tempDir }))
      .promise();

    fs.unlinkSync(zipFile.path); // מחק את הקובץ הזמני
 // העתקת קובץ game-sdk.js לספריית המשחק (הפשוט ביותר)
 const sdkPath = path.join(__dirname, '../../shared/public/sdk/game-sdk.js');
 const sdkDest = path.join(tempDir, 'game-sdk.js');
 fs.copyFileSync(sdkPath, sdkDest);

    // הזרקת SDK ל-index.html
    const indexPath = path.join(tempDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf8');
      const sdkScript = '<script src="./game-sdk.js"></script>';
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${sdkScript}\n</head>`);
      } else if (html.includes('<body>')) {
        html = html.replace('<body>', `<body>\n${sdkScript}`);
      } else {
        html = sdkScript + '\n' + html;
      }
      fs.writeFileSync(indexPath, html, 'utf8');
    }

    // העלאת כל הקבצים ל-S3
    const uploadDirToS3 = async (dir, basePath = '') => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const key = `games/game_${gameId}/${basePath}${file}`;

        if (fs.lstatSync(fullPath).isDirectory()) {
          await uploadDirToS3(fullPath, `${basePath}${file}/`);
        } else {
          const fileContent = fs.readFileSync(fullPath);
          await s3.upload({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileContent,
            ContentType: mime.lookup(fullPath) || 'application/octet-stream'
          }).promise();
        }
      }
    };

    await uploadDirToS3(tempDir);
    fs.rmSync(tempDir, { recursive: true, force: true });

    const gameUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/games/game_${gameId}/index.html`;

    const newGame = new Game({
      name,
      creator,
      createdBy: userId,
      language,
      category,
      gameFolderPath: `games/game_${gameId}/`,
      entryFile: 'index.html',
      gameUrl
    });

    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    console.error('Error uploading ZIP game to S3:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
