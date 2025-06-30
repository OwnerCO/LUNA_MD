import axios from "axios";
import fs from "fs";
import path from "path";
import config from "../config.cjs";

async function doReact(emoji, m, Matrix) {
  try {
    await Matrix.sendMessage(m.key.remoteJid, {
      react: { text: emoji, key: m.key },
    });
  } catch (e) {
    console.error("❌ Reaction error:", e);
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

const gdriveCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["gdrive", "gdl", "gdrivedl"].includes(cmd)) return;

  await doReact("🗂️", m, Matrix);

  const q = body.slice(prefix.length + cmd.length).trim();

  if (!q) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "❌ Please provide a Google Drive file link.\n\n📌 *Example:* `.gdrive https://drive.google.com/file/d/FILE_ID/view`",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }

  if (!q.startsWith("https://drive.google.com/file/d/")) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "❌ That doesn't look like a valid Google Drive file URL!",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/gdrive?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.success || !data.download_link) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "⚠️ Failed to fetch file info. Please try again later or check the link.",
          contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
        },
        { quoted: m }
      );
    }

    const fileName = data.name || "GoogleDriveFile";
    const downloadLink = data.download_link;
    const thumbnail = "https://i.ibb.co/PS5DZdJ/Chat-GPT-Image-Mar-30-2025-12-53-39-PM.png";

    const desc = `
╭──⭓  *LUNA MD*
│📂 *File Name:* ${fileName}
│🔗 *Original URL:* ${q}
│📥 *Download Link:* ${downloadLink}
╰───────────────⭓
    `.trim();

    await Matrix.sendMessage(
      m.from,
      {
        image: { url: thumbnail },
        caption: desc,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );

    const tempPath = path.join(__dirname, "temp_gdrive_file");

    const fileResponse = await axios.get(downloadLink, { responseType: "arraybuffer" });
    fs.writeFileSync(tempPath, Buffer.from(fileResponse.data));

    await Matrix.sendMessage(
      m.from,
      {
        document: { url: tempPath },
        mimetype: "application/octet-stream",
        fileName: fileName,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );

    fs.unlinkSync(tempPath);
    await doReact("✅", m, Matrix);
  } catch (error) {
    console.error("GDrive Error:", error);
    await doReact("❌", m, Matrix);
    await Matrix.sendMessage(
      m.from,
      {
        text: "❌ An error occurred while processing the Google Drive link.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

export default gdriveCmd;
