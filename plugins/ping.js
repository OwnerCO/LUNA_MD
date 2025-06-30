import config from "../config.cjs";

// Self-contained runtime formatter
function runtime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

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

// Ping handler
const pingTest = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["ping", "pong", "🚀"].includes(cmd)) return;

  const ctx = getNewsletterContext([m.sender]);
  const start = Date.now();

  try {
    const speedEmojis = ["⚡", "🚀", "💨", "✨", "🌟", "🔰"];
    const reactEmoji = speedEmojis[Math.floor(Math.random() * speedEmojis.length)];

    await Matrix.sendMessage(m.from, {
      react: { text: reactEmoji, key: m.key },
    });

    const end = Date.now();
    const responseTime = end - start;
    const uptimeFormatted = runtime(process.uptime());

    let rating;
    if (responseTime < 200) rating = "⚡ ULTRA FAST ⚡";
    else if (responseTime < 500) rating = "🚀 HIGH SPEED 🚀";
    else if (responseTime < 1000) rating = "🏎️ FAST";
    else rating = "🐢 SLOW";

    const pingMsg = `
💖 *𝐋𝐔𝐍𝐀 𝐌𝐃 𝐏𝐈𝐍𝐆* 💖

╭─・─・─・─・─・─・─・─╮
│ ✨ *Response Time:* ${responseTime}ms
│ ⭐ *Performance:* ${rating}
│ ⏱️ *Uptime:* ${uptimeFormatted}
╰─・─・─・─・─・─・─・─╯

💻 *Server:* ${config.HEROKU_APP_NAME || "Local"}
🌐 *Version:* ${config.VERSION || "1.0.0"}

💖 *Powered by 𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇* 😇
    `.trim();

    await Matrix.sendMessage(
      m.from,
      {
        text: pingMsg,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  } catch (e) {
    console.error("LUNA MD ping error:", e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Oopsie~ Ping failed: ${e.message}`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default pingTest;
