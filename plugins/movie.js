import config from "../config.cjs";
import axios from "axios";

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

// Movie info handler
const movieInfo = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["movie"].includes(cmd)) return;
  
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
          text: "✨ *LUNA MD* here!\nPlease tell me a movie name~ 🍿\nExample: .movie Inception",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    const apiUrl = `http://www.omdbapi.com/?t=${encodeURIComponent(movieName)}&apikey=${config.OMDB_API_KEY}`;
    const response = await axios.get(apiUrl);

    const data = response.data;
    if (data.Response === "False") {
      return Matrix.sendMessage(
        m.from,
        { 
          text: `🎥 *Movie Not Found!*\nI couldn't find "${movieName}"~ Try another title?`,
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    // Create beautiful movie info
    const movieInfo = `
🎬 *${data.Title}* (${data.Year}) 🌟

╭─・─・─・─・─・─・─・─╮
│ 🎭 *Genre:* ${data.Genre}
│ ⏳ *Runtime:* ${data.Runtime}
│ 🌟 *Rating:* ${data.imdbRating}/10 (${data.imdbVotes} votes)
│ 🎥 *Director:* ${data.Director}
│ ✍️ *Writer:* ${data.Writer}
│ 🌍 *Country:* ${data.Country}
│ 📆 *Released:* ${data.Released}
│ 🏆 *Awards:* ${data.Awards || 'None'}
╰─・─・─・─・─・─・─・─╯

🎭 *Cast:* 
${data.Actors.split(',').slice(0, 5).join(', ')}

📝 *Plot:*
${data.Plot}

💡 *Tip:* Use ${config.PREFIX}moviedl to download films!
`.trim();

    // Get poster or fallback image
    const imageUrl = data.Poster && data.Poster !== 'N/A' 
      ? data.Poster 
      : config.ALIVE_IMG || 'https://example.com/default-movie.jpg';

    await Matrix.sendMessage(
      m.from,
      {
        image: { url: imageUrl },
        caption: `${movieInfo}\n\n💖 *Powered by LUNA MD*`,
        contextInfo: ctx
      },
      { quoted: m }
    );

  } catch (e) {
    console.error("LUNA MD movie error:", e);
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

export default movieInfo;