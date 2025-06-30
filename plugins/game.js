import axios from "axios";
import config from "../config.cjs";

async function doReact(emoji, m, Matrix) {
  try {
    await Matrix.sendMessage(m.key.remoteJid, {
      react: { text: emoji, key: m.key },
    });
  } catch (e) {
    console.error("Reaction error:", e);
  }
}

const newsletterContext = {
  forwardingScore: 1000,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363292876277898@newsletter",
    newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
    serverMessageId: 143,
  },
};

// Trivia Quiz Command
const quizCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "quiz") return;

  await doReact("❓", m, Matrix);

  try {
    const res = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple");
    const data = res.data.results[0];
    const question = data.question;
    const correct = data.correct_answer;
    const allAnswers = [...data.incorrect_answers, correct].sort(() => Math.random() - 0.5);
    const answerIndex = allAnswers.findIndex(ans => ans === correct) + 1;

    await Matrix.sendMessage(
      m.from,
      {
        text:
          `🧠 *Trivia Time!*\n\n` +
          `❓ ${question}\n\n` +
          allAnswers.map((a, i) => `*${i + 1}.* ${a}`).join("\n") +
          `\n\n_Reply with the correct option number (1-${allAnswers.length}) within *10 seconds*_`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );

    const filter = (msg) => !msg.key.fromMe && msg.message?.conversation;
    const collected = await Matrix.waitForMessage(m.key.remoteJid, filter, { timeout: 10000 });

    if (!collected) {
      return Matrix.sendMessage(
        m.from,
        { text: "⏱️ Time's up! You didn't answer in time.", contextInfo: newsletterContext },
        { quoted: m }
      );
    }

    const userAnswer = parseInt(collected.message.conversation.trim());

    if (isNaN(userAnswer) || userAnswer < 1 || userAnswer > allAnswers.length) {
      return Matrix.sendMessage(
        m.from,
        { text: "❌ Invalid answer format. Please reply with the number of your choice.", contextInfo: newsletterContext },
        { quoted: m }
      );
    }

    if (userAnswer === answerIndex) {
      return Matrix.sendMessage(
        m.from,
        { text: "✅ *Correct!* You're a quiz master! 🎉", contextInfo: newsletterContext },
        { quoted: m }
      );
    } else {
      return Matrix.sendMessage(
        m.from,
        { text: `❌ *Wrong!* The correct answer was: *${answerIndex}. ${correct}*`, contextInfo: newsletterContext },
        { quoted: m }
      );
    }
  } catch (err) {
    console.error("Quiz command error:", err);
    return Matrix.sendMessage(
      m.from,
      { text: "❌ Could not fetch a quiz question. Please try again later.", contextInfo: newsletterContext },
      { quoted: m }
    );
  }
};

// Riddle Command
const riddleCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "riddle") return;

  await doReact("🧠", m, Matrix);

  try {
    const { data } = await axios.get("https://riddles-api.vercel.app/random");
    await Matrix.sendMessage(
      m.from,
      {
        text: `*Riddle:* ${data.riddle}\n*Answer:* ||${data.answer}||`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  } catch (e) {
    console.error("Riddle command error:", e);
    await Matrix.sendMessage(
      m.from,
      {
        text: "❌ Could not fetch a riddle. Please try again later.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

// Typing Speed Game Command
const GEMINI_API_KEY = config.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const typegameCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "typegame") return;

  await doReact("⌨️", m, Matrix);

  try {
    const prompt = {
      contents: [{
        parts: [{
          text: "Generate a challenging sentence for a typing speed game. It should be at least 20 words long, use diverse vocabulary, and be grammatically correct. Output only the sentence, no explanation."
        }]
      }]
    };

    const res = await axios.post(GEMINI_API_URL, prompt, {
      headers: { "Content-Type": "application/json" },
    });

    const geminiText = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const sentence = geminiText?.replace(/\n/g, " ").trim();

    if (!sentence || sentence.split(" ").length < 10) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "❌ Failed to get a valid sentence from Gemini. Please try again.",
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    await Matrix.sendMessage(
      m.from,
      {
        text: `⌨️ *Typing Speed Challenge!*\n\nType this sentence exactly as shown below:\n\n"${sentence}"\n\n⏱️ _You have 20 seconds!_`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );

    const startTime = Date.now();

    const filter = (msg) => !msg.key.fromMe && msg.message?.conversation;
    const collected = await Matrix.waitForMessage(m.key.remoteJid, filter, { timeout: 20000 });

    if (!collected) {
      return Matrix.sendMessage(
        m.from,
        { text: "⏱️ Time's up! You didn't answer in time.", contextInfo: newsletterContext },
        { quoted: m }
      );
    }

    const userInput = collected.message.conversation.trim();
    const endTime = Date.now();

    if (userInput !== sentence) {
      return Matrix.sendMessage(
        m.from,
        { text: "❌ You typed it incorrectly. Better luck next time!", contextInfo: newsletterContext },
        { quoted: m }
      );
    }

    const timeTaken = (endTime - startTime) / 1000;
    const words = sentence.split(" ").length;
    const wpm = Math.round((words / timeTaken) * 60);

    await Matrix.sendMessage(
      m.from,
      {
        text: `✅ *Correct!*\n🕒 Time: ${timeTaken.toFixed(2)} seconds\n📈 Speed: ${wpm} WPM\n🔥 Sentence Length: ${words} words`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  } catch (e) {
    console.error("TypeGame Error:", e?.response?.data || e.message);
    await Matrix.sendMessage(
      m.from,
      {
        text: "⚠️ Failed to start the typing game. Please try again later.",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }
};

// Love Check Command
const lovecheckCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "lovecheck") return;

  await doReact("❤️", m, Matrix);

  const mentionedUser = m.mentionedJid?.[0];

  if (!mentionedUser) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "❌ Please mention a user to check love compatibility.\nExample: .lovecheck @user",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }

  const love = Math.floor(Math.random() * 101);

  await Matrix.sendMessage(
    m.from,
    {
      text: `💕 Love compatibility between *${m.sender.split("@")[0]}* and *${mentionedUser.split("@")[0]}*: *${love}%*`,
      contextInfo: { ...newsletterContext, mentionedJid: [m.sender, mentionedUser] },
    },
    { quoted: m }
  );
};

// Match Me Command
const matchmeCmd = async (m, Matrix, groupMetadata) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "matchme") return;

  await doReact("🤝", m, Matrix);

  if (!groupMetadata) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "❌ This command works only in groups.",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }

  const participants = groupMetadata.participants.map(p => p.id);
  if (participants.length < 2) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "Not enough members in the group to make a match.",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }

  const pick = () => participants.splice(Math.floor(Math.random() * participants.length), 1)[0];
  const a = pick();
  const b = pick();

  const aUser = a.split("@")[0];
  const bUser = b.split("@")[0];
  const zeroWidthSpace = "\u200b";

  const text = `Match: @${aUser}${zeroWidthSpace} ❤️ @${bUser}${zeroWidthSpace}`;

  await Matrix.sendMessage(
    m.from,
    {
      text,
      mentions: [{ id: a }, { id: b }],
      contextInfo: newsletterContext,
    },
    { quoted: m }
  );
};

// Reverse Text Command
const reverseCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "reverse") return;

  await doReact("🔄", m, Matrix);

  const input = body.slice(prefix.length + cmd.length).trim();
  if (!input) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "❗️ Please provide text to reverse. Example: .reverse hello",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }

  const reversed = input.split("").reverse().join("");

  await Matrix.sendMessage(
    m.from,
    {
      text: reversed,
      contextInfo: newsletterContext,
    },
    { quoted: m }
  );
};

export {
  quizCmd,
  riddleCmd,
  typegameCmd,
  lovecheckCmd,
  matchmeCmd,
  reverseCmd,
};
