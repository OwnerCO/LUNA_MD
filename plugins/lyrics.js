import config from "../config.cjs";
import axios from "axios";

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

// Main lyrics handler
const lyricsSearch = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["lyrics"].includes(cmd)) return;

  const query = m.body.trim().slice(prefix.length + cmd.length).trim();
  const ctx = getNewsletterContext([m.sender]);

  try {
    // React with music note
    await Matrix.sendMessage(m.from, {
      react: { text: "🎵", key: m.key },
    });

    if (!query) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "✨ *LUNA MD* here!\nPlease tell me the song name~ 🎶\nExample: .lyrics Another Love",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    const apiUrl = `https://api.giftedtech.web.id/api/search/lyrics?apikey=gifted&query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.success || !data.result) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: `😢 Couldn't find lyrics for "${query}"~ Try another song?`,
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    const { title, artist, lyrics, image, link } = data.result;
    const messageText = `🎧 *${title}* - ${artist}\n\n${lyrics}\n\n🔗 ${link}`;

    await Matrix.sendMessage(
      m.from,
      {
        image: { url: image },
        caption: messageText,
        contextInfo: ctx
      },
      { quoted: m }
    );

  } catch (error) {
    console.error("LUNA MD lyrics error:", error);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Oopsie~ Error: ${error.message}`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default lyricsSearch;