import config from "../config.cjs";
import fetch from "node-fetch";

// Helper: newsletter context
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

// Movie download handler
const movieDownload = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["film", "moviedl"].includes(cmd)) return;
  
  const ctx = getNewsletterContext([m.sender]);
  const movieName = m.body.slice(prefix.length + cmd.length).trim();
  
  try {
    // React with film emoji
    await Matrix.sendMessage(m.from, {
      react: { text: "🎬", key: m.key },
    });

    if (!movieName) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "✨ *LUNA MD* here!\nPlease tell me a movie name~ 🍿\nExample: .film Inception",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    const apiUrl = `https://suhas-bro-apii.vercel.app/movie?query=${encodeURIComponent(movieName)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    if (!data.status === 'success' || !data.data || !data.data.length) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: `❌ Couldn't find "${movieName}"~ Try another title?`,
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    const movie = data.data[0];
    
    // Create cute movie info
    const movieInfo = `
🎬 *${movie.movieName}* (${movie.year}) 🌟
⭐ *IMDb Rating:* ${movie.imdbRating || 'N/A'}

╭─・─・─・─・─・─・─・─╮
│ Downloading your movie...
│ Please wait a moment~ 🍿
╰─・─・─・─・─・─・─・─╯

💖 *Powered by LUNA MD* 😇
    `.trim();

    // Send thumbnail with movie info
    await Matrix.sendMessage(
      m.from,
      {
        image: { url: movie.thumbnail },
        caption: movieInfo,
        contextInfo: ctx
      },
      { quoted: m }
    );

    // Send download link
    await Matrix.sendMessage(
      m.from,
      {
        text: `🎥 *${movie.movieName} Download Link*\n\n🔗 ${movie.link}\n\n💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇*`,
        contextInfo: ctx
      },
      { quoted: m }
    );

  } catch (e) {
    console.error("LUNA MD movie download error:", e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Oopsie~ Error: ${e.message}`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default movieDownload;