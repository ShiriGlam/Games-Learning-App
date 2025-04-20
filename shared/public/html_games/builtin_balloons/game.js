const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let words = [];
let currentWordIndex = 0;
let balloons = [];
let currentWord = "";
let explosions = [];

// הפונקציה שתחזיר מסיחים ייחודיים
function getUniqueDistractors(correctMeaning, allMeanings, count) {
  const distractors = new Set();
  while (distractors.size < count) {
    const candidate = allMeanings[Math.floor(Math.random() * allMeanings.length)];
    if (candidate !== correctMeaning) distractors.add(candidate);
    if (allMeanings.length < 2) break;
  }
  return Array.from(distractors);
}

window.onload = () => {
  window.GameAPI.getWords().then((data) => {
    console.log("📦 Received words:", data);
    words = data;
    nextQuestion();
  });
};

function nextQuestion() {
  if (currentWordIndex >= words.length) {
    alert("🎉 You've completed the set!");
    window.close();
    return;
  }

  const word = words[currentWordIndex];
  currentWord = word.word;
  document.getElementById("current-word").innerText = currentWord;

  const allMeanings = words.map(w => w.meaning);
  const distractors = getUniqueDistractors(word.meaning, allMeanings, 3);

  while (distractors.length < 3) {
    distractors.push("🤔");
  }

  const options = shuffleArray([word.meaning, ...distractors]);

  balloons = options.map((label, idx) => {
    const x = 150 + idx * 250;
    const y = canvas.height + Math.random() * 100;
    return new Balloon(x, y, label, label === word.meaning);
  });
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  balloons.forEach((b, index) => {
    if (b.isClicked(mx, my)) {
      GameAPI.reportResult(currentWord, b.isCorrect);

      if (b.isCorrect) {
        playPopSound();
        showExplosion(b.x, b.y);
        balloons.splice(index, 1); 
        showMessage("מעולה!");

        setTimeout(() => {
          currentWordIndex++;
          nextQuestion();
        }, 800);
      }
    }
  });
});

function showMessage(text) {
  const msg = document.createElement("div");
  msg.textContent = text;
  msg.style.position = "absolute";
  msg.style.top = "50%";
  msg.style.left = "50%";
  msg.style.transform = "translate(-50%, -50%)";
  msg.style.fontSize = "48px";
  msg.style.color = "#28a745";
  msg.style.fontWeight = "bold";
  msg.style.zIndex = "1000";
  document.body.appendChild(msg);

  setTimeout(() => msg.remove(), 1000);
}

function playPopSound() {
  const sound = document.getElementById("pop-sound");
  if (sound) sound.play();
}

function showExplosion(x, y) {
  explosions.push({ x, y, time: Date.now(), duration: 600 });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  balloons.forEach((b) => {
    b.update();
    b.draw(ctx);
  });

  
  const now = Date.now();
  explosions = explosions.filter(ex => now - ex.time < ex.duration);
  explosions.forEach(ex => {
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, 60, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.stroke();
  });

  requestAnimationFrame(animate);
}

animate();
