import fetch from "node-fetch";
import config from "../config.cjs";

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (err) {
    console.error("💥 Reaction failed:", err);
  }
}

async function gifToSticker(buffer) {
  return buffer; // Assume API already returns WebP
}

const attp = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "attp") return;

  await doReact("🪀", m, Matrix);
  const text = m.body.trim().slice(prefix.length + cmd.length).trim();

  if (!text) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "🌸 *LUNA MD* needs some text to make a cute sticker!\nExample: `.attp hello`",
      },
      { quoted: m }
    );
  }

  try {
    const attpUrl = `https://api.nexoracle.com/image-creating/attp?apikey=2f9b02060a600d6c88&text=${encodeURIComponent(
      text
    )}`;
    const res = await fetch(attpUrl);
    const buffer = await res.buffer();

    const stickerBuffer = await gifToSticker(buffer);
    await Matrix.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
  } catch (e) {
    console.error(e);
    await Matrix.sendMessage(
      m.from,
      { text: `😔 LUNA ran into a problem: ${e.message}` },
      { quoted: m }
    );
  }
};

export default attp;
