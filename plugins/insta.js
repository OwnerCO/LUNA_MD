import config from "../config.cjs";
import fetch from "node-fetch";

// Helper: newsletter context for consistent metadata
function getNewsletterContext(mentioned = []) {
  return {
    mentionedJid: mentioned,
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐋𝐔𝐍𝐀 𝐌𝐃",
      serverMessageId: 143,
    },
  };
}

// Main Instagram download handler
const igDownload = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["ig", "instagram", "igdl", "insta"].includes(cmd)) return;

  const query = m.body.trim().slice(prefix.length + cmd.length).trim();
  const ctx = getNewsletterContext([m.sender]);

  try {
    // React with cute emoji
    await Matrix.sendMessage(m.from, {
      react: { text: "📹", key: m.key },
    });

    if (!query) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "✨ *LUNA MD* here!\nPlease provide an Instagram reel URL~ 💖\nExample: .ig https://www.instagram.com/reel/...",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    // Basic URL validation
    if (!query.startsWith("https://www.instagram.com/reel/")) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "❌ Oopsie~ That doesn't look like a valid Instagram reel URL!",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    const apiUrl = `https://itzpire.com/download/instagram?url=${encodeURIComponent(query)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== "success") {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "😢 Couldn't fetch this reel~ Maybe try another one?",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    const media = data.data.media[0];
    const postInfo = data.data.postInfo;

    if (!media || !media.downloadUrl) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "💔 No media found in this post~",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    // Cute formatted caption
    const caption = `
🌸 *LUNA MD INSTA DOWNLOADER* 🌸

• 🎀 *Type:* ${media.type?.toUpperCase() || 'VIDEO'} 
• ✨ *Author:* ${postInfo.author || 'Anonymous'}
• 🔗 *Link:* ${query}

📝 *Caption:* ${postInfo.caption?.slice(0, 50) || 'No caption'}...
📅 *Date:* ${postInfo.timePosted || 'Unknown'}
❤️ *Likes:* ${postInfo.likesCount || '0'} 
💬 *Comments:* ${postInfo.commentsCount || '0'}

💖 *Powered by LUNA MD*`;

    // Send video with cute caption
    await Matrix.sendMessage(
      m.from,
      { 
        video: { url: media.downloadUrl },
        caption: caption,
        contextInfo: ctx
      },
      { quoted: m }
    );

  } catch (error) {
    console.error("LUNA MD Instagram error:", error);
    await Matrix.sendMessage(
      m.from,
      {
        text: `😵‍💫 Oops! Something went wrong: ${error.message}`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default igDownload;