import axios from "axios";
import config from "../config.cjs";

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (err) {
    console.error("Reaction error:", err);
  }
}

const deepseek = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["deepseek", "dpseek", "ai2"].includes(cmd)) return;

  await doReact("🤖", m, Matrix);

  const q = m.body.trim().slice(prefix.length + cmd.length).trim() || "Hi";

  const newsletterContext = {
    mentionedJid: [m.sender],
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
      serverMessageId: 143,
    },
  };

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/ai/deepseek-r1?text=${encodeURIComponent(q)}`;

    const { data } = await axios.get(apiUrl);

    if (!data?.response) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "❌ AI response error! Please try again.",
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    await Matrix.sendMessage(
      m.from,
      {
        text: `🤖 *DeepSeek AI:*\n\n${data.response}`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  } catch (e) {
    console.error("Error in deepseek:", e.message);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Error: ${e.message}`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }
};

export default deepseek;
