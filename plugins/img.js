import config from "../config.cjs";
import g_i_s from "g-i-s";

// Helper: newsletter context for consistent metadata
function getNewsletterContext(mentioned = []) {
  return {
    mentionedJid: mentioned,
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
      serverMessageId: 175,
    },
  };
}

// Main image search handler
const imgSearch = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["img", "googleimg"].includes(cmd)) return;

  const query = m.body.trim().slice(prefix.length + cmd.length).trim();

  if (!query) {
    await Matrix.sendMessage(
      m.from,
      { text: "❗ Please enter a search term to find images." },
      { quoted: m }
    );
    return;
  }

  const ctx = getNewsletterContext([m.sender]);

  try {
    // React to user command
    await Matrix.sendMessage(m.from, {
      react: { text: "🔍", key: m.key },
    });

    // Use g-i-s to get images (wrapped as a Promise for async/await)
    const results = await new Promise((resolve, reject) => {
      g_i_s(query, (error, res) => {
        if (error) return reject(error);
        resolve(res);
      });
    });

    if (!results || results.length === 0) {
      await Matrix.sendMessage(
        m.from,
        { text: "😕 No images found for your query.", contextInfo: ctx },
        { quoted: m }
      );
      return;
    }

    // Send up to 5 images with newsletter context
    const imagesToSend = results.slice(0, 5);
    for (const img of imagesToSend) {
      await Matrix.sendMessage(
        m.from,
        { image: { url: img.url }, contextInfo: ctx },
        { quoted: m }
      );
    }
  } catch (error) {
    console.error("LUNA MD img command error:", error);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Something went wrong while searching images: ${error.message || error}`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default imgSearch;
