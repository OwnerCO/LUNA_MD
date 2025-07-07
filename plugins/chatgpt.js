import axios from "axios";
import config from "../config.cjs";

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (err) {
    console.error("💥 Reaction error:", err);
  }
}

const gpt = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["gpt", "chatgpt", "ai"].includes(cmd)) return;
  await doReact("🤖", m, Matrix);

  const query = m.body.trim().slice(prefix.length + cmd.length).trim();

  const newsletterContext = {
    mentionedJid: [m.sender],
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
      serverMessageId: 160,
    },
  };

  if (!query) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "💬 *LUNA MD* says: Please enter something for me to think about! 🧠\nExample: `.gpt what's the weather on Mars?`",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }

  try {
    await Matrix.sendPresenceUpdate("composing", m.from);

    const apiUrl = `https://apis.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(query)}`;
    const res = await axios.get(apiUrl);

    if (!res.data || !res.data.result) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "😓 *LUNA MD* couldn't get a proper response from the AI.\nMaybe try again in a bit?",
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    const aiText = `💡 \n\n*${res.data.result}*\n\n🌙 _Your buddy, LUNA MD 😇_\n🔌 _Powered by HANS TECH_`;

    await Matrix.sendMessage(
      m.from,
      {
        text: aiText,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  } catch (error) {
    console.error("GPT error:", error);
    await Matrix.sendMessage(
      m.from,
      {
        text: "❌ *Oops!* I ran into an issue while chatting with my AI friend.\nTry again soon, okie? 🤍",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  } finally {
    await Matrix.sendPresenceUpdate("paused", m.from);
  }
};

export default gpt;
