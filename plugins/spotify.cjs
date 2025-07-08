(async () => {
  const { cmd } = await import('../command.js');

  const axios = require('axios');
  
  cmd({
      pattern: "spotify",
      alias: ["spotdl", "music"],
      react: "🎵",
      desc: "Download any Spotify track via GiftedTech API 🎧",
      category: "download",
      filename: __filename
  },
  async (conn, mek, m, { from, quoted, q, reply, sender }) => {
      try {
          if (!q) return reply("🎶 *Heya! Drop a Spotify link, please.*\n\n_Example:_ `.spotify https://open.spotify.com/track/...`\n\n– LUNA MD 😇");
  
          await reply("🔄 **Grabbing the beats... One sec!**");
  
          const { data } = await axios.get(`https://api.giftedtech.web.id/api/download/spotifydl?apikey=gifted&url=${encodeURIComponent(q)}`);
  
          if (!data.success || !data.result?.download_url) {
              return conn.sendMessage(from, {
                  image: { url: "https://i.ibb.co/9m0ZcH1N/Chat-GPT-Image-28-juin-2025-01-24-41.png" },
                  caption: "❌ *Oopsie! I couldn’t fetch the song.*\nTry again with a valid link, bestie 💔\n\n– LUNA MD 😇",
                  contextInfo: {
                      mentionedJid: [sender],
                      forwardingScore: 999,
                      isForwarded: true,
                      forwardedNewsletterMessageInfo: {
                          newsletterJid: '120363292876277898@newsletter',
                          newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
                          serverMessageId: 143
                      }
                  }
              }, { quoted: mek });
          }
  
          const song = data.result;
          const newsletterContext = {
              mentionedJid: [sender],
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363292876277898@newsletter',
                  newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
                  serverMessageId: 143
              }
          };
  
          const caption = `
  ╭────────◇────────────╮
    🎵 *SPOTIFY DOWNLOAD*  
    🔸 *Title:* ${song.title}  
    🕒 *Duration:* ${song.duration}  
  ╰────────◇────────────╯
  
  ✨ *LUNA MD 😇*  
  `;
  
          // Step 1: Send cover with info
          await conn.sendMessage(from, {
              image: { url: "https://i.ibb.co/9m0ZcH1N/Chat-GPT-Image-28-juin-2025-01-24-41.png" },
              caption,
              contextInfo: newsletterContext
          }, { quoted: mek });
  
          // Step 2: Send the audio
          await conn.sendMessage(from, {
              audio: { url: song.download_url },
              mimetype: "audio/mpeg",
              fileName: `${song.title}.mp3`,
              caption: `✅ *Done! Enjoy your jam 😍*\n\n– Hans Tech | LUNA MD 😇`,
              contextInfo: newsletterContext
          }, { quoted: mek });
  
      } catch (err) {
          console.error("💥 Spotify Plugin Error:", err);
          await conn.sendMessage(from, {
              image: { url: "https://i.ibb.co/9m0ZcH1N/Chat-GPT-Image-28-juin-2025-01-24-41.png" },
              caption: `⚠️ *Yikes! Something went wrong...*\nPlease try again later.\n\n– Your cutie LUNA MD 😇`,
              contextInfo: {
                  mentionedJid: [sender],
                  forwardingScore: 999,
                  isForwarded: true,
                  forwardedNewsletterMessageInfo: {
                      newsletterJid: '120363292876277898@newsletter',
                      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
                      serverMessageId: 143
                  }
              }
          }, { quoted: mek });
      }
  });
})();
