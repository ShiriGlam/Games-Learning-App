const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

exports.askChat = async (req, res) => {
  const { question } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Return a JSON array of English words and their Hebrew meanings . Example format: [{\"word\": \"apple\", \"meaning\": \"תפוח\"}, ...]" },
        { role: "user", content: question }
      ],
    });

    const answer = completion.choices[0].message.content;

    let words;
    try {
      words = JSON.parse(answer);
    } catch (err) {
      return res.status(400).json({ error: "Failed to parse JSON from GPT response", raw: answer });
    }

    res.json({ words });
  } catch (error) {
    console.error("GPT error:", error);
    res.status(500).json({ error: "Failed to get response from ChatGPT" });
  }
};
exports.askChatAdvice = async (req, res) => {
  const { failedWords } = req.body;

  if (!failedWords || failedWords.length === 0) {
    return res.status(400).json({ success: false, message: 'No failed words provided' });
  }

  try {
    const prompt = `
הלומד נכשל במילים האלה :
${failedWords.join(', ')}
בהתבסס על המילים האלה, איזה נושאים אתה ממליץ לו לחזק? יש לך עצות כלליות ללמידה? תהיה ממוקד בהודעה- לא יותר מ2 משפטים אחד. תחזיר תשובה לפי המבנה הנל: "לומד יקר, ניכר כי.... ממליץ לך ל.... בהצלחה!"
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    });

    const advice = completion.choices[0].message.content;
    res.json({ success: true, advice });
  } catch (err) {
    console.error('GPT advice error:', err);
    res.status(500).json({ success: false, message: 'GPT failed', error: err.message });
  }
}


