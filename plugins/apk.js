import fetch from "node-fetch";
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

const apk = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "apk" && cmd !== "app") return;

  // React with fixed emoji
  await doReact("📲", m, Matrix);

  // Get the app name query
  const q = m.body.trim().slice(prefix.length + cmd.length).trim();

  const newsletterContext = {
    mentionedJid: [m.sender],
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
      serverMessageId: 143,
    },
  };

  try {
    if (!q) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "❌ *𝙋𝙡𝙚𝙖𝙨𝙚 𝙥𝙧𝙤𝙫𝙞𝙙𝙚 𝙩𝙝𝙚 𝙖𝙥𝙥 𝙣𝙖𝙢𝙚!* ❌",
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    const res = await fetch(
      `https://apis.davidcyriltech.my.id/download/apk?text=${encodeURIComponent(q)}`
    );
    const data = await res.json();

    if (!data.success) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "❌ *𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙛𝙚𝙩𝙘𝙝 𝘼𝙋𝙆.* ❌",
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    const desc = `
╔══✦❘༻ *LUNA MD* ༺❘✦══╗
┃ 📂 *𝘼𝙥𝙥 𝙉𝙖𝙢𝙚:*   ${data.apk_name} 
╰─━──━──━──━──━──━───━─╯
┃ 📥 *𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙 𝙨𝙩𝙖𝙧𝙩𝙚𝙙...*
╰──━─════════════════⊷❍
*> POWERED BY HANS TECH* ⚡`;

    await Matrix.sendMessage(
      m.from,
      {
        image: { url: data.thumbnail },
        caption: desc,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );

    await Matrix.sendMessage(
      m.from,
      {
        document: { url: data.download_link },
        mimetype: "application/vnd.android.package-archive",
        fileName: `『 ${data.apk_name} 』.apk`,
        caption:
          "✅ *𝗔𝗣𝗞 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!* ✅\n🔰 *𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 LUNA MD* ⚡",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  } catch (e) {
    console.error(e);
    await Matrix.sendMessage(
      m.from,
      {
        text: "❌ *𝘼𝙣 𝙚𝙧𝙧𝙤𝙧 𝙤𝙘𝙘𝙪𝙧𝙧𝙚𝙙 𝙬𝙝𝙞𝙡𝙚 𝙛𝙚𝙩𝙘𝙝𝙞𝙣𝙜 𝙩𝙝𝙚 𝘼𝙋𝙆.* ❌",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }
};

export default apk;
