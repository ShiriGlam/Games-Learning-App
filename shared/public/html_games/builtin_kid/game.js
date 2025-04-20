let words = [];
let currentIndex = 0;
let isPaused = false;

window.onload = () => {
  GameAPI.getWords().then((data) => {
    console.log("📦 Words received:", data);
    if (!data || data.length < 2) {
      document.getElementById('word-display').textContent = "Need at least 2 words in the set!";
      return;
    }
    words = data;
    startWalking();
    showWord();
  });
};

function startWalking() {
  const char = document.getElementById('character');
  char.style.animationPlayState = 'running';
}

function stopWalking() {
  const char = document.getElementById('character');
  char.style.animationPlayState = 'paused';
}

function getShuffledOptions(correctMeaning, allWords, count = 3) {
  const distractors = allWords
    .map(w => w.meaning)
    .filter(m => m !== correctMeaning);

  const shuffled = distractors.sort(() => 0.5 - Math.random()).slice(0, count - 1);
  return [...shuffled, correctMeaning].sort(() => 0.5 - Math.random());
}

function showWord() {
  if (currentIndex >= words.length) {
    alert("Well done!");
    window.close();
    return;
  }

  isPaused = true;
  stopWalking(); // עצור אנימציה

  const current = words[currentIndex];
  document.getElementById('word-display').textContent = `What means: ${current.word}`;

  const container = document.getElementById('signs-container');
  container.innerHTML = "";

  const options = getShuffledOptions(current.meaning, words);

  options.forEach((opt) => {
    const sign = document.createElement("div");
    sign.className = "sign";
    sign.textContent = opt;
    sign.onclick = () => {
      const correct = opt === current.meaning;
      GameAPI.reportResult(current.word, correct);
      if (correct) {
        currentIndex++;
        startWalking(); // הפעל אנימציה
        setTimeout(() => {
          showWord();
        }, 1000);
      }
    };
    container.appendChild(sign);
  });
}
