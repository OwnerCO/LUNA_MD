import axios from "axios";
import config from "../config.cjs";

async function doReact(emoji, m, Matrix) {
  try {
    await Matrix.sendMessage(m.key.remoteJid, {
      react: { text: emoji, key: m.key },
    });
  } catch (err) {
    console.error("Reaction Error:", err);
  }
}

const createNewsletterContext = (sender) => ({
  mentionedJid: [sender],
  forwardingScore: 1000,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363292876277898@newsletter",
    newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
    serverMessageId: 143,
  },
});

// Image Generation Command (FluxAI)
const genCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["gen", "imagine"].includes(cmd)) return;

  await doReact("🎨", m, Matrix);

  let prompt = body.slice(prefix.length + cmd.length).trim();
  if (!prompt) prompt = "a beautiful abstract painting";

  const apiUrl = `https://apis.davidcyriltech.my.id/flux?prompt=${encodeURIComponent(prompt)}`;

  try {
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    await Matrix.sendMessage(
      m.key.remoteJid,
      {
        image: imageBuffer,
        caption: `🖼 *Generated Image for:* _${prompt}_\n\n📢 *BY 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇*`,
        contextInfo: createNewsletterContext(m.sender),
      },
      { quoted: m }
    );

    await doReact("✅", m, Matrix);
  } catch (error) {
    console.error("Image Gen Error:", error);
    await doReact("❌", m, Matrix);
    await Matrix.sendMessage(
      m.key.remoteJid,
      {
        text: "❌ Error generating image. Please try again later.",
        contextInfo: createNewsletterContext(m.sender),
      },
      { quoted: m }
    );
  }
};

export default genCmd;
