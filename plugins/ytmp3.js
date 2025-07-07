import yts from 'yt-search';
import fetch from 'node-fetch';
import config from '../config.cjs';

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

// YouTube Command Handler
const youtubeCmd = async (m, Matrix) => {
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

  // 🎵 Play Command - Search and download audio
  if (["play", "ytsong", "song", "music"].includes(cmd)) {
    await doReact("🎵", m, Matrix);
    try {
      const query = body.slice(prefix.length).trim().split(" ").slice(1).join(" ");
      
      if (!query) {
        return await reply(
          "✨ *LUNA's Music Player* 🎧\n\n" +
          "Let me find and download songs for you!\n\n" +
          "Usage:\n" +
          `• *${prefix}play Dandelions*\n` +
          `• *${prefix}song Shape of You*\n` +
          `• *${prefix}ytsong Calm Down*\n\n` +
          "I'll find the best audio quality! 💖"
        );
      }

      await doReact("🔍", m, Matrix);
      const search = await yts(query);
      const video = search.videos[0];
      
      if (!video) {
        return await reply(
          "❌ *No Songs Found* 😢\n\n" +
          `I couldn't find any songs for "${query}"\n` +
          "Try different keywords? 💖\n" +
          "~ Your music companion LUNA 🌙"
        );
      }

      // Get download URL from new API
      const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`;
      const apiRes = await fetch(apiUrl);
      const json = await apiRes.json();
      
      if (!json.success || !json.result?.download_url) {
        throw new Error("Failed to get download link");
      }

      const infoMsg = 
        `✨ *LUNA Found This Song* 🎧\n\n` +
        `🎵 *Title:* ${video.title}\n` +
        `👤 *Artist:* ${video.author.name}\n` +
        `⏱️ *Duration:* ${video.timestamp}\n` +
        `👁️ *Views:* ${video.views.toLocaleString()}\n\n` +
        `Downloading audio... ⏳`;

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: video.thumbnail },
          caption: infoMsg,
          contextInfo: {
            ...newsletterContext,
            mentionedJid: [m.sender]
          }
        },
        { quoted: m }
      );

      // Send as audio
      await Matrix.sendMessage(
        m.from,
        {
          audio: { url: json.result.download_url },
          mimetype: 'audio/mpeg',
          fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
          caption: "✨ *Enjoy Your Music!* 🎶\n~ LUNA MD 🌙",
          contextInfo: newsletterContext
        },
        { quoted: m }
      );

      // Send as document
      await Matrix.sendMessage(
        m.from,
        {
          document: { url: json.result.download_url },
          mimetype: 'audio/mpeg',
          fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
          caption: "📁 *Audio File* 💾\nHere's your song as a file! 💖\n~ LUNA MD 🌙",
          contextInfo: newsletterContext
        },
        { quoted: m }
      );

      await doReact("✅", m, Matrix);

    } catch (e) {
      console.error("Play error:", e);
      await reply(
        "❌ *Oh no!* 🥺\n\n" +
        "My music player malfunctioned! Here's what happened:\n" +
        `_${e.message || "Download failed"}_\n\n` +
        "Try a different song? 💖\n" +
        "~ Your musical friend LUNA 🌙"
      );
    }
    return;
  }

  // 🎧 YouTube URL to MP3
  if (["ytmp3", "yturlmp3", "url2mp3"].includes(cmd)) {
    await doReact("🎧", m, Matrix);
    try {
      const url = body.slice(prefix.length).trim().split(" ").slice(1).join(" ");
      
      if (!url || !url.includes("youtube.com/watch?v=")) {
        return await reply(
          "✨ *YouTube URL to MP3* 🔗\n\n" +
          "Convert YouTube links to audio files!\n\n" +
          "Usage:\n" +
          `• *${prefix}ytmp3 https://youtube.com/watch?v=...*\n` +
          `• *${prefix}url2mp3 <youtube-link>*\n\n` +
          "I'll transform videos into music! 🎶"
        );
      }

      await doReact("⏳", m, Matrix);
      const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(url)}`;
      const apiRes = await fetch(apiUrl);
      const json = await apiRes.json();
      
      if (!json.success || !json.result?.download_url) {
        throw new Error("Failed to get download link");
      }

      const infoMsg = 
        `✨ *YouTube to MP3* 🎧\n\n` +
        `🎵 *Title:* ${json.result.title || "Unknown"}\n` +
        `🎚️ *Quality:* ${json.result.quality || "128kbps"}\n` +
        `🖼️ *Thumbnail:* ${json.result.thumbnail ? "✅" : "❌"}\n\n` +
        `Downloading audio... ⏳`;

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: json.result.thumbnail || "https://i.ibb.co/8bL5s3T/youtube-default.jpg" },
          caption: infoMsg,
          contextInfo: {
            ...newsletterContext,
            mentionedJid: [m.sender]
          }
        },
        { quoted: m }
      );

      // Send as audio
      await Matrix.sendMessage(
        m.from,
        {
          audio: { url: json.result.download_url },
          mimetype: 'audio/mpeg',
          fileName: `${json.result.title?.replace(/[^\w\s]/gi, '') || "youtube_audio"}.mp3`,
          caption: "✨ *Enjoy Your Audio!* 🎶\n~ LUNA MD 🌙",
          contextInfo: newsletterContext
        },
        { quoted: m }
      );

      // Send as document
      await Matrix.sendMessage(
        m.from,
        {
          document: { url: json.result.download_url },
          mimetype: 'audio/mpeg',
          fileName: `${json.result.title?.replace(/[^\w\s]/gi, '') || "youtube_audio"}.mp3`,
          caption: "📁 *Audio File* 💾\nHere's your audio file! 💖\n~ LUNA MD 🌙",
          contextInfo: newsletterContext
        },
        { quoted: m }
      );

      await doReact("✅", m, Matrix);

    } catch (e) {
      console.error("YTMP3 error:", e);
      await reply(
        "❌ *Conversion Failed!* 💔\n\n" +
        "Couldn't convert YouTube URL to MP3:\n" +
        `_${e.message || "Invalid URL or API error"}_\n\n` +
        "Make sure it's a valid YouTube URL! 💖\n" +
        "~ LUNA 🌙"
      );
    }
    return;
  }

  // 🔍 YouTube Search
  if (["yts", "ytsearch", "youtubesearch"].includes(cmd)) {
    await doReact("🔍", m, Matrix);
    try {
      const query = body.slice(prefix.length).trim().split(" ").slice(1).join(" ");
      
      if (!query) {
        return await reply(
          "✨ *LUNA's YouTube Search* 🔎\n\n" +
          "Search for YouTube videos!\n\n" +
          "Usage:\n" +
          `• *${prefix}yts funny cats*\n` +
          `• *${prefix}ytsearch cooking recipes*\n` +
          `• *${prefix}youtubesearch latest songs*\n\n` +
          "I'll find the best matches for you! 💖"
        );
      }

      await doReact("⏳", m, Matrix);
      const search = await yts(query);
      const video = search.videos[0];
      
      if (!video) {
        return await reply(
          "❌ *No Videos Found* 😢\n\n" +
          `I couldn't find any videos for "${query}"\n` +
          "Try different keywords? 💖\n" +
          "~ Your search companion LUNA 🌙"
        );
      }

      const infoMsg = 
        `✨ *LUNA Found This Video* 📺\n\n` +
        `🎬 *Title:* ${video.title}\n` +
        `👤 *Channel:* ${video.author.name}\n` +
        `⏱️ *Duration:* ${video.timestamp}\n` +
        `👁️ *Views:* ${video.views.toLocaleString()}\n` +
        `📅 *Uploaded:* ${video.ago}\n\n` +
        `🔗 *Watch Here:* ${video.url}\n\n` +
        `Want to download audio? Use:\n` +
        `*${prefix}ytmp3 ${video.url}*`;

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: video.thumbnail },
          caption: infoMsg,
          contextInfo: {
            ...newsletterContext,
            mentionedJid: [m.sender]
          }
        },
        { quoted: m }
      );

      await doReact("✅", m, Matrix);

    } catch (e) {
      console.error("YTS error:", e);
      await reply(
        "❌ *Search Failed!* 😢\n\n" +
        "My YouTube search didn't work:\n" +
        `_${e.message || "Connection error"}_\n\n` +
        "Try again later? 💖\n" +
        "~ LUNA 🌙"
      );
    }
    return;
  }
};

export default youtubeCmd;