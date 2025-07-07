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

// Error codes
const ERROR_CODES = {
  NO_QUERY: "YT101",
  NO_RESULTS: "YT102",
  INVALID_URL: "YT201",
  API_FAILURE: "YT301",
  NETWORK_ERROR: "YT401",
  PROCESSING_FAILED: "YT501"
};

// YouTube Video Download Handler
const youtubeVideoCmd = async (m, Matrix) => {
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

  // 🎥 Video Command - Search or URL
  if (["video", "ytdl", "youtube"].includes(cmd)) {
    await doReact("🎥", m, Matrix);
    try {
      const query = body.slice(prefix.length).trim().split(" ").slice(1).join(" ");
      
      if (!query) {
        return await reply(
          `✨ *LUNA's Video Downloader* 📺\n\n` +
          `Download YouTube videos by title or URL!\n\n` +
          `Usage:\n` +
          `• *${prefix}video funny cats*\n` +
          `• *${prefix}youtube https://youtu.be/...*\n` +
          `• *${prefix}ytdl trending videos*\n\n` +
          `Error Codes: YT1xx (User), YT2xx (Input), YT3xx (API), YT4xx (Network), YT5xx (Processing)`
        );
      }

      let videoUrl = query;
      
      // If it's not a URL, search YouTube
      if (!query.includes('youtu.be') && !query.includes('youtube.com')) {
        await doReact("🔍", m, Matrix);
        const search = await yts(query);
        const video = search.videos[0];
        
        if (!video) {
          return await reply(
            `❌ *No Videos Found!* [${ERROR_CODES.NO_RESULTS}]\n\n` +
            `I couldn't find any videos for "${query}"\n` +
            `Try different keywords? 💖\n` +
            `~ Your video assistant LUNA 🌙`
          );
        }
        videoUrl = video.url;
      }

      await doReact("⏳", m, Matrix);
      const apiUrl = `https://api.giftedtech.web.id/api/download/ytdl?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
      const response = await fetch(apiUrl, { timeout: 30000 });
      
      if (!response.ok) {
        throw new Error(`API Error ${response.status} [${ERROR_CODES.API_FAILURE}]`);
      }

      const data = await response.json();
      
      if (!data.success || !data.result) {
        return await reply(
          `❌ *API Failed!* [${ERROR_CODES.API_FAILURE}]\n\n` +
          `YouTube didn't return video info\n` +
          `Try a different video? 💖\n` +
          `~ LUNA 🌙`
        );
      }

      const { title, thumbnail, video_url, audi_quality, video_quality } = data.result;
      
      const infoMsg = 
        `✨ *LUNA Found This Video* 📺\n\n` +
        `🎬 *Title:* ${title}\n` +
        `📺 *Quality:* ${video_quality || "HD"}\n` +
        `🎧 *Audio:* ${audi_quality || "128kbps"}\n\n` +
        `Downloading... ⏳`;

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: thumbnail },
          caption: infoMsg,
          contextInfo: {
            ...newsletterContext,
            mentionedJid: [m.sender]
          }
        },
        { quoted: m }
      );

      // Send video
      await Matrix.sendMessage(
        m.from,
        {
          video: { url: video_url },
          mimetype: 'video/mp4',
          caption: "✨ *Enjoy Your Video!* 🎬\n~ LUNA MD 🌙",
          contextInfo: newsletterContext
        },
        { quoted: m }
      );

      // Send as document
      await Matrix.sendMessage(
        m.from,
        {
          document: { url: video_url },
          mimetype: 'video/mp4',
          fileName: `${title.replace(/[^\w\s]/gi, '')}.mp4`,
          caption: "📁 *Video File* 💾\nHere's your video as a file! 💖\n~ LUNA MD 🌙",
          contextInfo: newsletterContext
        },
        { quoted: m }
      );

      await doReact("✅", m, Matrix);

    } catch (e) {
      console.error("Video error:", e);
      const errorCode = e.message.includes("API Error") ? ERROR_CODES.API_FAILURE : 
                        e.message.includes("timed out") ? ERROR_CODES.NETWORK_ERROR : 
                        ERROR_CODES.PROCESSING_FAILED;
      
      await reply(
        `❌ *Download Failed!* [${errorCode}]\n\n` +
        `Couldn't process your video request:\n` +
        `_${e.message || "Unknown error"}_\n\n` +
        `Try again later or contact support with the error code! 💖\n` +
        `~ LUNA 🌙`
      );
    }
    return;
  }

  // 🎬 YouTube URL to MP4
  if (["ytmp4", "ytvid", "youtubevid"].includes(cmd)) {
    await doReact("🎬", m, Matrix);
    try {
      const url = body.slice(prefix.length).trim().split(" ").slice(1).join(" ");
      
      if (!url || !(url.includes("youtube.com/watch") || url.includes("youtu.be/"))) {
        return await reply(
          `✨ *YouTube URL to Video* 🔗\n\n` +
          `Convert YouTube links to video files!\n\n` +
          `Usage:\n` +
          `• *${prefix}ytmp4 https://youtube.com/watch?v=...*\n` +
          `• *${prefix}ytvid https://youtu.be/...*\n\n` +
          `Error Codes: YT1xx (User), YT2xx (Input), YT3xx (API), YT4xx (Network), YT5xx (Processing)`
        );
      }

      await doReact("⏳", m, Matrix);
      const apiUrl = `https://api.giftedtech.web.id/api/download/ytdl?apikey=gifted&url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl, { timeout: 30000 });
      
      if (!response.ok) {
        throw new Error(`API Error ${response.status} [${ERROR_CODES.API_FAILURE}]`);
      }

      const data = await response.json();
      
      if (!data.success || !data.result) {
        return await reply(
          `❌ *API Failed!* [${ERROR_CODES.API_FAILURE}]\n\n` +
          `YouTube didn't return video info\n` +
          `Try a different URL? 💖\n` +
          `~ LUNA 🌙`
        );
      }

      const { title, thumbnail, video_url, audi_quality, video_quality } = data.result;
      
      const infoMsg = 
        `✨ *YouTube Video Download* 📥\n\n` +
        `🎬 *Title:* ${title}\n` +
        `📺 *Quality:* ${video_quality || "HD"}\n` +
        `🎧 *Audio:* ${audi_quality || "128kbps"}\n\n` +
        `Downloading... ⏳`;

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: thumbnail },
          caption: infoMsg,
          contextInfo: {
            ...newsletterContext,
            mentionedJid: [m.sender]
          }
        },
        { quoted: m }
      );

      // Send video
      await Matrix.sendMessage(
        m.from,
        {
          video: { url: video_url },
          mimetype: 'video/mp4',
          caption: "✨ *Enjoy Your Video!* 🎬\n~ LUNA MD 🌙",
          contextInfo: newsletterContext
        },
        { quoted: m }
      );

      // Send as document
      await Matrix.sendMessage(
        m.from,
        {
          document: { url: video_url },
          mimetype: 'video/mp4',
          fileName: `${title.replace(/[^\w\s]/gi, '')}.mp4`,
          caption: "📁 *Video File* 💾\nHere's your video as a file! 💖\n~ LUNA MD 🌙",
          contextInfo: newsletterContext
        },
        { quoted: m }
      );

      await doReact("✅", m, Matrix);

    } catch (e) {
      console.error("YTMP4 error:", e);
      const errorCode = e.message.includes("API Error") ? ERROR_CODES.API_FAILURE : 
                        e.message.includes("timed out") ? ERROR_CODES.NETWORK_ERROR : 
                        ERROR_CODES.PROCESSING_FAILED;
      
      await reply(
        `❌ *Download Failed!* [${errorCode}]\n\n` +
        `Couldn't process your URL:\n` +
        `_${e.message || "Invalid URL or API error"}_\n\n` +
        `Make sure it's a valid YouTube URL! 💖\n` +
        `~ LUNA 🌙`
      );
    }
    return;
  }
};

export default youtubeVideoCmd;