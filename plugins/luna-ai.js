import axios from "axios";
import config from "../config.cjs";

const GEMINI_API_KEY = config.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Reaction helper
async function doReact(emoji, m, Matrix) {
  try {
    await Matrix.sendMessage(m.key.remoteJid, {
      react: { text: emoji, key: m.key },
    });
  } catch (err) {
    console.error("Reaction Error:", err);
  }
}

// Newsletter context for LUNA MD
const createNewsletterContext = (sender) => ({
  mentionedJid: [sender],
  forwardingScore: 1000,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363292876277898@newsletter",
    newsletterName: "LUNA MD",
    serverMessageId: 143,
  },
});

// AI Command handler
const aiCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  const supportedCmds = ["lunaai", "ai", "gemini"];
  if (!supportedCmds.includes(cmd)) return;

  await doReact("🤖", m, Matrix);

  let q = body.slice(prefix.length + cmd.length).trim();
  if (!q) {
    q = "hi luna"; // default prompt
  }

  const isHansAI = cmd === "luna-ai" || cmd === "ai";
  const promptText = isHansAI
    ? `My name is ${m.pushName || "User"}. Your name is LUNA MD 🤖. You are a friendly AI assistant built to help on WhatsApp. Always respond warmly with helpful answers and emojis. My question is: ${q}`
    : q;

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      { contents: [{ parts: [{ text: promptText }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiText) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "❌ I couldn't generate a response. Try again later.",
          contextInfo: createNewsletterContext(m.sender),
        },
        { quoted: m }
      );
    }

    await Matrix.sendMessage(
      m.from,
      {
        text: aiText,
        contextInfo: createNewsletterContext(m.sender),
      },
      { quoted: m }
    );

    await doReact("✅", m, Matrix);
  } catch (err) {
    console.error("Gemini AI Error:", err.response?.data || err.message);
    await doReact("❌", m, Matrix);
    await Matrix.sendMessage(
      m.from,
      {
        text: "❌ Sorry, something went wrong while contacting AI.",
        contextInfo: createNewsletterContext(m.sender),
      },
      { quoted: m }
    );
  }
};

export default aiCmd;
