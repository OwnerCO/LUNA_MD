import config from "../config.cjs";
import { happymod } from "api-qasim";

// Optional local sleep function if you need it later
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// React helper
async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (err) {
    console.error("💥 LUNA MD reaction error:", err);
  }
}

// Newsletter context helper
function getNewsletterContext(mentioned = []) {
  return {
    mentionedJid: mentioned,
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐋𝐔𝐍𝐀 𝐌𝐃 😇",
      serverMessageId: 143,
    },
  };
}

// Main HappyMod handler
const happymodCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "happymod" && cmd !== "hmod") return;

  await doReact("📲", m, Matrix);

  const query = m.body.slice(prefix.length + cmd.length).trim();
  const ctx = getNewsletterContext([m.sender]);

  try {
    if (!query) {
      return await Matrix.sendMessage(
        m.from,
        {
          text: "🌸 *Please tell me what to search for!* Example: `.hmod WhatsApp`",
          contextInfo: ctx,
        },
        { quoted: m }
      );
    }

    const results = await happymod(query);
    if (!results?.data?.length) {
      return await Matrix.sendMessage(
        m.from,
        {
          text: "😢 Aww... no results found! Wanna try another app name?",
          contextInfo: ctx,
        },
        { quoted: m }
      );
    }

    let response = `*📲 LUNA's HappyMod Picks:*\n\n`;
    results.data.forEach((item, i) => {
      response += `*${i + 1}.* ${item.title} (⭐ ${item.rating || "N/A"})\n`;
    });
    response += `\n💬 *Reply with the number* to get the download link!\n🔐 *Served by LUNA MD 😇*`;

    const sentMsg = await Matrix.sendMessage(
      m.from,
      { text: response, contextInfo: ctx },
      { quoted: m }
    );

    // Save session for replies
    Matrix.happymod = Matrix.happymod || {};
    Matrix.happymod[m.sender] = {
      results: results.data,
      messageId: sentMsg.key.id,
      timestamp: Date.now(),
    };

    // Listen for replies to get download link
    Matrix.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message?.extendedTextMessage) return;

      const context = msg.message.extendedTextMessage.contextInfo;
      if (
        msg.key.remoteJid !== m.from ||
        context?.stanzaId !== sentMsg.key.id ||
        !Matrix.happymod?.[m.sender]
      )
        return;

      try {
        const selected = parseInt(msg.message.extendedTextMessage.text.trim());
        const mods = Matrix.happymod[m.sender].results;

        if (isNaN(selected) || selected < 1 || selected > mods.length) {
          return Matrix.sendMessage(
            m.from,
            { text: "😖 Oopsie~ That number doesn’t look valid! Try again~" },
            { quoted: msg }
          );
        }

        const chosen = mods[selected - 1];
        const text = `*🔰 HappyMod Result*\n\n` +
          `*📌 Title:* ${chosen.title}\n` +
          `*⭐ Rating:* ${chosen.rating || "N/A"}\n` +
          `*📦 Version:* ${chosen.version || "Unknown"}\n\n` +
          `🔗 *Download Link:* ${chosen.link}\n\n` +
          `🔰 *Brought to you by LUNA MD 😇*`;

        await Matrix.sendMessage(
          m.from,
          { text, contextInfo: ctx },
          { quoted: msg }
        );

        delete Matrix.happymod[m.sender]; // Clear session after sending
      } catch (err) {
        console.error("💥 LUNA MD error:", err);
        Matrix.sendMessage(
          m.from,
          { text: "😭 Something went wrong getting your mod. Try again maybe?" },
          { quoted: msg }
        );
      }
    });

    // Auto-clear session after 3 minutes
    setTimeout(() => {
      if (Matrix.happymod?.[m.sender]) delete Matrix.happymod[m.sender];
    }, 180000);

  } catch (err) {
    console.error("❌ LUNA MD search error:", err);
    await Matrix.sendMessage(
      m.from,
      {
        text: "💔 Oww... LUNA MD couldn’t search HappyMod due to an error: " + err.message,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default happymodCmd;
