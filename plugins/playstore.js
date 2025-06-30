import config from "../config.cjs";
import axios from "axios";

// Helper: newsletter context
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

// Play Store handler
const playstoreSearch = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["playstore", "ps", "app"].includes(cmd)) return;
  
  const ctx = getNewsletterContext([m.sender]);
  const appName = m.body.slice(prefix.length + cmd.length).trim();
  
  try {
    // React with app emoji
    await Matrix.sendMessage(m.from, {
      react: { text: "📲", key: m.key },
    });

    if (!appName) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "✨ *LUNA MD* here!\nPlease tell me an app name~ 📱\nExample: .ps WhatsApp",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    // Show searching message
    await Matrix.sendMessage(
      m.from,
      { 
        text: `🔍 *Searching Play Store for "${appName}"...*`,
        contextInfo: ctx
      },
      { quoted: m }
    );

    const apiUrl = `https://apis.davidcyriltech.my.id/search/playstore?q=${encodeURIComponent(appName)}`;
    const response = await axios.get(apiUrl);
    
    if (!response.data.success || !response.data.result) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: `❌ Couldn't find "${appName}" on Play Store~ Try another app?`,
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    const app = response.data.result;
    
    // Create beautiful app info
    const appInfo = `
📲 *${app.title}* ${app.price === 'Free' ? '🆓' : '💰'}

╭─・─・─・─・─・─・─・─╮
│ ⭐ *Rating:* ${app.score} (${app.installs})
│ 📦 *Size:* ${app.size || 'N/A'}
│ 🧩 *Version:* ${app.androidVersion}
│ 👨‍💻 *Developer:* ${app.developer}
│ 📅 *Updated:* ${app.updated}
╰─・─・─・─・─・─・─・─╯

🔹 *Summary:*
${app.summary}

🔗 *Play Store Link:*
${app.url}

💖 *Powered by LUNA MD* 😇
    `.trim();

    // Send app icon with info
    if (app.icon) {
      await Matrix.sendMessage(
        m.from,
        {
          image: { url: app.icon },
          caption: appInfo,
          contextInfo: ctx
        },
        { quoted: m }
      );
    } else {
      await Matrix.sendMessage(
        m.from,
        { 
          text: appInfo,
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

  } catch (error) {
    console.error("LUNA MD Play Store error:", error);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Oopsie~ Error: ${error.message}`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default playstoreSearch;