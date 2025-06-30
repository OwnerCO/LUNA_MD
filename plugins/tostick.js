import config from "../config.cjs";
import axios from "axios";
import { Sticker, StickerTypes } from "wa-sticker-formatter";

// Helper to fetch media buffer from quoted message URL or media content
async function fetchQuotedMediaBuffer(quoted) {
  try {
    // WhatsApp media usually comes as base64 or direct URL in message
    // We'll try to get the direct URL and download it
    let url;

    // Check if quoted has imageMessage or videoMessage with URL or direct data
    if (quoted.imageMessage && quoted.imageMessage.url) {
      url = quoted.imageMessage.url;
    } else if (quoted.videoMessage && quoted.videoMessage.url) {
      url = quoted.videoMessage.url;
    } else if (quoted.message && quoted.message.imageMessage && quoted.message.imageMessage.url) {
      url = quoted.message.imageMessage.url;
    } else if (quoted.message && quoted.message.videoMessage && quoted.message.videoMessage.url) {
      url = quoted.message.videoMessage.url;
    }

    if (!url && quoted.message) {
      // Sometimes media is a base64 or binary buffer encoded inside message (rare in Baileys)
      // If no url, try to get buffer directly from quoted message content (if base64)
      if (quoted.message.imageMessage && quoted.message.imageMessage.mimetype && quoted.message.imageMessage.jpegThumbnail) {
        // Use jpegThumbnail as a fallback (small preview)
        return Buffer.from(quoted.message.imageMessage.jpegThumbnail, "base64");
      }
    }

    if (!url) throw new Error("No media URL found in the quoted message.");

    // Download the media from the URL
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        // Some WhatsApp URLs require auth headers, e.g. cookies or tokens, but let's try basic
        // If your environment needs auth, you must add it here accordingly
      },
    });

    return Buffer.from(response.data);
  } catch (err) {
    throw new Error("Failed to fetch media from quoted message: " + err.message);
  }
}

// Main handler
const stickerCommand = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["sticker", "s", "stick", "tostick", "tosticker"].includes(cmd)) return;

  const ctx = {
    mentionedJid: [m.sender],
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
      serverMessageId: 170,
    },
  };

  try {
    // React to user command
    await Matrix.sendMessage(m.from, {
      react: { text: "🥱", key: m.key },
    });

    const quoted = m.quoted;

    if (!quoted || !(quoted.imageMessage || quoted.videoMessage)) {
      await Matrix.sendMessage(
        m.from,
        { text: "⚠️ Please reply to an image or video to convert it into a sticker.", contextInfo: ctx },
        { quoted: m }
      );
      return;
    }

    // Download media buffer from quoted message
    const mediaBuffer = await fetchQuotedMediaBuffer(quoted);

    // Create sticker
    const sticker = new Sticker(mediaBuffer, {
      pack: "LUNA MD 😇",
      author: "HANS TECH",
      type: StickerTypes.FULL,
      quality: 60,
      animated: false,
      keepScale: true,
    });

    const stickerBuffer = await sticker.toBuffer();

    // Send sticker
    await Matrix.sendMessage(
      m.from,
      { sticker: stickerBuffer, contextInfo: ctx },
      { quoted: m }
    );
  } catch (error) {
    console.error("💥 LUNA MD sticker error:", error);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ LUNA MD Sticker error: ${error.message || error}`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default stickerCommand;
