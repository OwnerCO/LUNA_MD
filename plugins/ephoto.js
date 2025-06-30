import config from "../config.cjs";
import axios from "axios";

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
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

const ephoto = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["ephoto", "ephoto360", "photoeffect", "textstyle"].includes(cmd)) return;

  await doReact("🎨", m, Matrix);

  const inputText = m.body.trim().slice(prefix.length + cmd.length).trim();

  const ctx = {
    ...newsletterContext,
    mentionedJid: [m.sender],
  };

  if (!inputText) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "✏️ Heey~ please provide some text to create a stylish image!\n\n*Example:* `.ephoto hello`",
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }

  const effects = [
    { number: "1", name: "Logo Maker", endpoint: "logomaker" },
    { number: "2", name: "Advanced Glow", endpoint: "advancedglow" },
    { number: "3", name: "Write Text", endpoint: "writetext" },
    { number: "4", name: "Glitch Text", endpoint: "glitchtext" },
    { number: "5", name: "Pixel Glitch", endpoint: "pixelglitch" },
    { number: "6", name: "Neon Glitch", endpoint: "neonglitch" },
    { number: "7", name: "Flag Text", endpoint: "flagtext" },
    { number: "8", name: "3D Flag Text", endpoint: "flag3dtext" },
    { number: "9", name: "Deleting Text", endpoint: "deletingtext" },
    { number: "10", name: "Sand Summer", endpoint: "sandsummer" },
    { number: "11", name: "Making Neon", endpoint: "makingneon" },
    { number: "12", name: "Royal Text", endpoint: "royaltext" },
  ];

  // Send effects menu
  let menu = "╭━━━〔 *Ephoto360 MODELS* 〕━━━⊷\n";
  effects.forEach((e) => (menu += `┃▸ ${e.number}. ${e.name}\n`));
  menu += "╰━━━⪼\n\n📌 Reply with the number to select an effect.";

  await Matrix.sendMessage(
    m.from,
    { text: menu, contextInfo: ctx },
    { quoted: m }
  );

  let active = true;

  // Timeout to cancel waiting after 2 minutes
  const timeout = setTimeout(() => {
    active = false;
  }, 120000);

  // Listener for reply
  Matrix.ev.on("messages.upsert", async (msgData) => {
    if (!active) return;
    const recv = msgData.messages[0];
    if (!recv.message || recv.key.fromMe) return;
    if (recv.key.remoteJid !== m.from) return;

    const text =
      recv.message.conversation || recv.message.extendedTextMessage?.text;
    if (!text) return;

    const effect = effects.find((e) => e.number === text.trim());
    if (!effect) return;

    active = false;
    clearTimeout(timeout);

    try {
      await Matrix.sendMessage(
        m.from,
        { react: { text: "⬇️", key: recv.key }, contextInfo: ctx },
        { quoted: recv }
      );
      await Matrix.sendPresenceUpdate("recording", m.from);

      await Matrix.sendMessage(
        m.from,
        {
          text: `🖌️ Generating *${effect.name}*...`,
          contextInfo: ctx,
        },
        { quoted: recv }
      );

      const apiUrl = `https://vapis.my.id/api/${effect.endpoint}?q=${encodeURIComponent(
        inputText
      )}`;

      await Matrix.sendMessage(
        m.from,
        {
          image: { url: apiUrl },
          caption: `✅ *${effect.name}* generated successfully!`,
          contextInfo: ctx,
        },
        { quoted: recv }
      );

      await Matrix.sendPresenceUpdate("recording", m.from);
    } catch (err) {
      console.error("API Error:", err);
      await Matrix.sendMessage(
        m.from,
        {
          text: `❌ Failed to fetch image: ${err.message}`,
          contextInfo: ctx,
        },
        { quoted: recv }
      );
    }
  });
};

export default ephoto;
