import config from "../config.cjs";
import axios from "axios";

// React helper
async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (err) {
    console.error("💥 LUNA MD reaction error:", err);
  }
}

// Newsletter context
function getNewsletterContext(mentioned = []) {
  return {
    mentionedJid: mentioned,
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
      serverMessageId: 161,
    },
  };
}

// Main hentai handler
const hentai = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "hentai") return;

  await doReact("🤦‍♂️", m, Matrix);

  const ctx = getNewsletterContext([m.sender]);
  try {
    const response = await axios.get("https://apis.davidcyriltech.my.id/hentai");

    if (response.data.success) {
      const video = response.data.video;

      const uncomfortableMessage = `
😳 You really want to watch this? Think twice...

📌 Title: ${video.title}
📂 Category: ${video.category}
👁️ Views: ${video.views_count}

🔗 Link (if you must): ${video.link}

Please reconsider your life choices. 🙃
      `;

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: config.ALIVE_IMG },
          caption: uncomfortableMessage,
          contextInfo: ctx,
        },
        { quoted: m }
      );
    } else {
      await Matrix.sendMessage(m.from, { text: "❌ Could not fetch the video data." }, { quoted: m });
    }
  } catch (e) {
    console.error("LUNA MD hentai command error:", e);
    await Matrix.sendMessage(m.from, { text: `❌ Error: ${e.message}` }, { quoted: m });
  }
};

export default hentai;
