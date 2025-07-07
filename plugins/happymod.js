import api from 'caliph-api';
const { happymod } = api.search;
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

// HappyMod Downloader
const happyModCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  const reply = async (text, options = {}) => {
    await Matrix.sendMessage(
      m.from,
      {
        text,
        ...(options.contextInfo ? { contextInfo: options.contextInfo } : {}),
        ...(options.mentions ? { mentions: options.mentions } : {}),
      },
      { quoted: m }
    );
  };

  if (["happymod", "hmod", "modapk"].includes(cmd)) {
    await doReact("📲", m, Matrix);
    try {
      const query = body.slice(prefix.length + cmd.length).trim();
      if (!query) {
        return await reply(
          "✨ *LUNA's HappyMod Search* 🔍\n\n" +
          "Please tell me what mod you're looking for!\n" +
          `Example: ${prefix}happymod WhatsApp\n\n` +
          "I'll find the best mods for you! 💖"
        );
      }

      await doReact("⏳", m, Matrix);
      const results = await happymod(query);

      if (!Array.isArray(results) || !results.length) {
        return await reply(
          "❌ *No Mods Found* 😢\n\n" +
          `I couldn't find any mods for "${query}"\n` +
          "Try different keywords? 💡\n\n" +
          "Made with 💖 by Hans Tech!"
        );
      }

      let modList = "✨ *LUNA Found These Mods* 📲\n\n";
      results.slice(0, 10).forEach((item, i) => {
        modList += `*${i + 1}.* ${item.title}\n`;
        modList += `⭐ Rating: ${item.rating || 'N/A'} | 🔖 Version: ${item.version || 'Unknown'}\n\n`;
      });
      modList += "🔸 *Reply with the number* to download\n";
      modList += "🔸 *Powered by LUNA MD* 🌙💖";

      const sentMsg = await reply(modList, { contextInfo: newsletterContext });

      Matrix.happymod = Matrix.happymod || {};
      Matrix.happymod[m.sender] = {
        results,
        timestamp: Date.now(),
        messageId: sentMsg.key.id
      };

      setTimeout(() => {
        if (Matrix.happymod?.[m.sender]) {
          delete Matrix.happymod[m.sender];
        }
      }, 300000);

    } catch (e) {
      console.error("HappyMod error:", e);
      if (e.code === 'ENOTFOUND') {
        return await reply(
          "🚫 *Can't reach HappyMod!* 😢\n\n" +
          "It looks like I can't connect to their server right now.\n" +
          "Maybe the site is down or blocked where I’m running from.\n\n" +
          "Try again later or let Hans Tech know 💻"
        );
      }
      await reply(
        "❌ *Oh no!* 🥺\n\n" +
        "My mod search failed! Here's what happened:\n" +
        `_${e.message || 'Unknown error'}_\n\n` +
        "Try again later? 💖\n" +
        "~ Your friend LUNA 🌙"
      );
    }
    return;
  }

  // Handle number selection
  if (Matrix.happymod?.[m.sender] && m.message?.extendedTextMessage?.contextInfo) {
    const stored = Matrix.happymod[m.sender];
    const context = m.message.extendedTextMessage.contextInfo;

    if (context.stanzaId === stored.messageId) {
      try {
        const num = parseInt(m.body.trim());
        if (isNaN(num)) {
          return await reply("❌ That's not a number, sweetie! 🔢\nPlease reply with a number from the list! 💖");
        }

        const idx = num - 1;
        if (idx < 0 || idx >= stored.results.length) {
          return await reply(`❌ Please choose between 1-${stored.results.length}, cutie! 💖`);
        }

        const mod = stored.results[idx];
        await doReact("⬇️", m, Matrix);

        if (!mod.link) {
          return await reply("❌ Sorry, I couldn't get a download link for that mod 😢\nTry another one?");
        }

        const modInfo =
          `✨ *LUNA's Mod Download* 📲\n\n` +
          `*📱 ${mod.title}*\n\n` +
          `⭐ Rating: ${mod.rating || 'N/A'}\n` +
          `🔖 Version: ${mod.version || 'Unknown'}\n` +
          `📦 Size: ${mod.size || 'Unknown'}\n\n` +
          `🔗 *Download Link:*\n${mod.link}\n\n` +
          `⚠️ *Safety Tips:*\n` +
          `• Scan files before installing\n` +
          `• Use a good antivirus\n` +
          `• Download at your own risk\n\n` +
          `Made with 💖 by Hans Tech!`;

        await reply(modInfo, { contextInfo: newsletterContext });
        delete Matrix.happymod[m.sender];

      } catch (e) {
        console.error("Mod selection error:", e);
        await reply(
          "❌ *Download Failed* 💔\n\n" +
          "I couldn't get the mod details!\n" +
          "Error: " + (e.message || "Unknown") + "\n\n" +
          "Try searching again? 💖"
        );
      }
    }
  }
};

export default happyModCmd;
