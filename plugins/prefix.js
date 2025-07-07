import axios from "axios";
import config from "../config.cjs";

// Reaction helper
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

// Ringtone Command Handler
const ringtoneCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  // Helper function for replies
  const reply = async (text, options = {}) => {
    await Matrix.sendMessage(
      m.from,
      {
        text,
        ...(options.contextInfo ? { contextInfo: options.contextInfo } : {}),
      },
      { quoted: m }
    );
  };

  if (["ringtone", "ringtones", "ring", "rtone"].includes(cmd)) {
    await doReact("🎵", m, Matrix);
    try {
      const query = body.slice(prefix.length).trim().split(" ").slice(1).join(" ");
      
      if (!query) {
        return await reply(
          "✨ *LUNA's Ringtone Studio* 🎶\n\n" +
          "Tell me what ringtone you're looking for!\n\n" +
          "Usage:\n" +
          `• *${prefix}ringtone iphone*\n` +
          `• *${prefix}ringtone naruto*\n` +
          `• *${prefix}ringtone love*\n\n` +
          "I'll find the perfect sound for you! 💖"
        );
      }

      await doReact("🔍", m, Matrix);
      const { data } = await axios.get(
        `https://www.dark-yasiya-api.site/download/ringtone?text=${encodeURIComponent(query)}`,
        { timeout: 15000 }
      );

      if (!data?.status || !data.result?.length) {
        return await reply(
          "❌ *No Ringtones Found* 😢\n\n" +
          `I couldn't find any ringtones for "${query}"\n` +
          "Try different keywords like:\n" +
          "• alarm\n• notification\n• melody\n• cartoon\n\n" +
          "Made with 💖 by Hans Tech"
        );
      }

      // Select random ringtone
      const randomIndex = Math.floor(Math.random() * data.result.length);
      const ringtone = data.result[randomIndex];
      
      // Create thumbnail image
      const thumbnailUrl = "https://i.ibb.co/PS5DZdJ/Chat-GPT-Image-Mar-30-2025-12-53-39-PM.png";
      
      // Send ringtone with attractive caption
      await Matrix.sendMessage(
        m.from,
        {
          audio: { url: ringtone.dl_link },
          mimetype: "audio/mpeg",
          fileName: `${ringtone.title.replace(/[^\w\s]/gi, '')}.mp3`,
          contextInfo: newsletterContext,
          caption: `✨ *LUNA Found This Ringtone* 🎧\n\n` +
                   `🎵 *Title:* ${ringtone.title}\n` +
                   `🔍 *Search Query:* ${query}\n\n` +
                   `Enjoy your new ringtone! 💖\n` +
                   `~ Hans Tech's Musical Assistant`
        },
        { quoted: m }
      );

      await doReact("✅", m, Matrix);

    } catch (e) {
      console.error("Ringtone error:", e);
      await reply(
        "❌ *Oh no!* 🥺\n\n" +
        "My music box malfunctioned! Here's what happened:\n" +
        `_${e.message || "Connection timed out"}_\n\n` +
        "Try again with a different search? 💖\n" +
        "~ Your musical friend LUNA 🌙"
      );
    }
  }
};

export default ringtoneCmd;