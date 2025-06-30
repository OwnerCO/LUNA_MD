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

const fetchCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  // Check command aliases
  if (!["fetch", "get", "api", "fetchapi", "apifetch"].includes(cmd)) return;

  await doReact("🌐", m, Matrix);

  const query = body.slice(prefix.length + cmd.length).trim();

  if (!query) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "❌ Oops! You forgot to send me a URL or API to fetch. Please try again! 💖",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }

  if (!/^https?:\/\//.test(query)) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "❌ Hmm... That doesn't look like a valid URL. It should start with http:// or https:// 😊",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }

  try {
    const { data } = await axios.get(query);
    const content = JSON.stringify(data, null, 2).slice(0, 2048);

    await Matrix.sendMessage(
      m.from,
      {
        text: `🔍 *Fetched Data*:\n\`\`\`${content}\`\`\`\n\n📢 *BY LUNA MD*`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  } catch (e) {
    console.error("Error in fetch command:", e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Sorry! I ran into an error:\n${e.message}\n\n📢 *BY LUNA MD*`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

export default fetchCmd;
