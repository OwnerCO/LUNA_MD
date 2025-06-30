import config from "../config.cjs";
import axios from "axios";

// MIME type mapping for common file types
const mimeMap = {
    'zip': 'application/zip',
    'pdf': 'application/pdf',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'txt': 'text/plain',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

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

// Main MediaFire handler
const mediafireDownload = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["mf", "mfire", "mediafire"].includes(cmd)) return;

  const query = m.body.trim().slice(prefix.length + cmd.length).trim();
  const ctx = getNewsletterContext([m.sender]);

  try {
    // React with upload emoji
    await Matrix.sendMessage(m.from, {
      react: { text: "📤", key: m.key },
    });

    if (!query) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "✨ *LUNA MD* here!\nPlease provide a MediaFire link~ 🔗\nExample: .mf https://www.mediafire.com/...",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    const apiUrl = `https://apis.davidcyriltech.my.id/mediafire?url=${encodeURIComponent(query)}`;
    
    // Send fetching message
    await Matrix.sendMessage(
      m.from,
      { 
        text: "🔍 *LUNA MD is fetching your file...*",
        contextInfo: ctx
      },
      { quoted: m }
    );

    const { data } = await axios.get(apiUrl);
    
    if (!data?.downloadLink) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: `❌ Couldn't retrieve file information~ Is the link valid?\nError: ${JSON.stringify(data)}`,
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    const fileUrl = data.downloadLink;
    const fileName = data.fileName || "file";
    const sizeString = data.size || "0MB";
    
    // Parse file size
    const fileSize = parseFloat(sizeString.replace(/[^0-9.]/g, '')) || 0;

    // Check WhatsApp's 50MB limit
    if (fileSize > 50) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: `⚠️ *File too big!* (${data.size})\nWhatsApp only supports files up to 50MB~`,
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    // Get MIME type
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const mimeType = mimeMap[fileExtension] || 'application/octet-stream';

    // Uploading message
    await Matrix.sendMessage(
      m.from,
      { 
        text: "⬆️ *Uploading your file to WhatsApp...*",
        contextInfo: ctx
      },
      { quoted: m }
    );

    // Send the file
    await Matrix.sendMessage(
      m.from,
      {
        document: { url: fileUrl },
        mimetype: mimeType,
        fileName: fileName,
        caption: `📁 *${fileName}*\n📦 Size: ${data.size || 'Unknown'}\n\n💖 *Powered by LUNA MD*`,
        contextInfo: ctx
      },
      { quoted: m }
    );

  } catch (e) {
    console.error("LUNA MD MediaFire error:", e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Oopsie~ Error: ${e.message}\nPlease check the link and try again!`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default mediafireDownload;