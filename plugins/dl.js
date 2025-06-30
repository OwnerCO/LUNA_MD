import axios from "axios";
import path from "path";
import config from "../config.cjs";

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (err) {
    console.error("Reaction error:", err);
  }
}

const dl = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  const aliases = ["dl", "download", "getfile", "fetchfile", "grabfile"];
  if (!aliases.includes(cmd)) return;

  await doReact("📤", m, Matrix);

  const link = m.body.trim().slice(prefix.length + cmd.length).trim();
  if (!link) {
    return Matrix.sendMessage(
      m.from,
      { text: "🔗 Send a valid download link, buddy." },
      { quoted: m }
    );
  }

  try {
    const filename = path.basename(link);
    const extension = path.extname(filename).substring(1).toLowerCase();

    let mimeType = "application/octet-stream";
    const types = {
      mp4: "video/mp4",
      apk: "application/vnd.android.package-archive",
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      png: "image/png",
      pdf: "application/pdf",
      zip: "application/zip",
      txt: "text/plain",
      json: "application/json",
      webp: "image/webp",
    };
    if (types[extension]) mimeType = types[extension];

    // Fetch to validate
    await axios.get(link, { responseType: "arraybuffer" });

    await Matrix.sendMessage(
      m.from,
      {
        document: { url: link },
        mimetype: mimeType,
        fileName: filename,
        caption: `✅ File ready: *${filename}* (${extension.toUpperCase()})`,
      },
      { quoted: m }
    );

    await Matrix.sendMessage(
      m.from,
      { text: `📁 Boom! Your ${extension.toUpperCase()} file is on its way.` },
      { quoted: m }
    );
  } catch (e) {
    console.error("Download Error:", e.message);
    await Matrix.sendMessage(
      m.from,
      { text: `❌ Couldn't fetch the file.\nReason: ${e.message}` },
      { quoted: m }
    );
  }
};

export default dl;
