import axios from "axios";
import config from "../config.cjs";

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (error) {
    console.error("Error sending reaction:", error);
  }
}

const bible = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "bible") return;

  await doReact("✝️", m, Matrix);

  const args = m.body.trim().slice(prefix.length + cmd.length).trim().split(/\s+/);
  const reference = args.join(" ");

  if (!reference || reference.trim() === "") {
    return Matrix.sendMessage(
      m.from,
      {
        text: "🙏 Dear child of God, please provide a Bible reference (e.g., *John 3:16*) so we may meditate upon His Word.",
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 1000,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363292876277898@newsletter",
            newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
            serverMessageId: 143,
          },
        },
      },
      { quoted: m }
    );
  }

  try {
    const url = `https://apis.davidcyriltech.my.id/bible?reference=${encodeURIComponent(reference)}`;
    const response = await axios.get(url);
    const res = response.data;

    if (res && res.success) {
      const message = `✝️ *Blessings from the Word of God: ${res.reference}* ✝️\n\n` +
        `📖 *Translation:* ${res.translation}\n` +
        `📜 *Verse Count:* ${res.verses_count}\n\n` +
        `🔹 *Scripture:*\n${res.text.trim()}\n\n` +
        `🕊️ *Reflect upon these words, and may the peace of Christ dwell within you.*\n` +
        `🙏 *Amen. Praise the Lord for His everlasting mercy!* 🙌`;

      await Matrix.sendMessage(
        m.from,
        {
          text: message,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363292876277898@newsletter",
              newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
              serverMessageId: 143,
            },
          },
        },
        { quoted: m }
      );
    } else {
      await Matrix.sendMessage(
        m.from,
        {
          text: "😔 O Lord, we seem to have encountered an error. The API did not return a valid response. Please try again later, and may His light guide you.",
        },
        { quoted: m }
      );
    }
  } catch (e) {
    console.error(e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `⚠️ *Error:* ${e.message || e}\n\n🙏 *May God grant you patience and understanding.*`,
      },
      { quoted: m }
    );
  }
};

export default bible;
