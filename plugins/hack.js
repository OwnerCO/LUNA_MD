import config from "../config.cjs";

// Sleep helper (replaces sleep from functions2.js)
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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

// Newsletter context
function getNewsletterContext(mentioned = []) {
  return {
    mentionedJid: mentioned,
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
      serverMessageId: 161,
    },
  };
}

// Main funny hack handler
const hack = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "hack") return;

  await doReact("💻", m, Matrix);

  const pushname = m.pushName || "Agent X";
  const ctx = getNewsletterContext([m.sender]);

  try {
    // Step 1: Fake injection
    await Matrix.sendMessage(
      m.from,
      {
        image: { url: config.ALIVE_IMG },
        caption: `🔍 *Injecting Hans Virus into your system...*\n\n👤 *Target:* ${pushname}\n💉 *Status:* In progress...`,
        contextInfo: ctx,
      },
      { quoted: m }
    );

    // Step 2: Progress bar
    for (let i = 1; i <= 10; i++) {
      await sleep(500);
      await Matrix.sendMessage(
        m.from,
        {
          text: `⚙️ Hacking: [${"█".repeat(i)}${"░".repeat(10 - i)}] ${i * 10}%`,
          contextInfo: ctx,
        },
        { quoted: m }
      );
    }

    // Step 3: Funny messages
    const funnyLines = [
      "📶 Connecting to grandma's WiFi...",
      "📂 Accessing memes folder...",
      "📸 Finding embarrassing selfies...",
      "🧠 Downloading your brain (slow process)...",
      "🛡 Disabling your antivirus with love ❤️",
      "🔗 Linking device to fridge for better cooling...",
      "💣 Deploying glitter bomb to your wallpaper...",
      "🎥 Sending logs to FBI for movie night...",
      "✅ Virus installed... Just kidding 😅",
      "💀 All data compromised! LOL not really.",
    ];

    for (const line of funnyLines) {
      await sleep(1000);
      await Matrix.sendMessage(m.from, { text: line, contextInfo: ctx }, { quoted: m });
    }

    // Final message
    await sleep(1000);
    await Matrix.sendMessage(
      m.from,
      {
        text: `🎉 *Hacking simulation complete!*\n\n😎 ${pushname}, your system is now... slightly confused.`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  } catch (e) {
    console.error("Error in hack command:", e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `⚠️ Whoops! ${pushname}, something broke while hacking your toaster.`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default hack;
