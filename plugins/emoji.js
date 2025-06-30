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

const emoji = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "emoji") return;

  await doReact("🔠", m, Matrix);

  const input = m.body.trim().slice(prefix.length + cmd.length).trim();
  const newsletterContext = {
    mentionedJid: [m.sender],
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363292876277898@newsletter",
      newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
      serverMessageId: 143,
    },
  };

  if (!input) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "Heey~ drop some text so I can emoji-fy it for you! 😄\n\n*Example:* `.emoji hello123`",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }

  const emojiMap = {
    a: "🅰️", b: "🅱️", c: "🇨️", d: "🇩️", e: "🇪️", f: "🇫️", g: "🇬️",
    h: "🇭️", i: "🇮️", j: "🇯️", k: "🇰️", l: "🇱️", m: "🇲️", n: "🇳️",
    o: "🅾️", p: "🇵️", q: "🇶️", r: "🇷️", s: "🇸️", t: "🇹️", u: "🇺️",
    v: "🇻️", w: "🇼️", x: "🇽️", y: "🇾️", z: "🇿️",
    "0": "0️⃣", "1": "1️⃣", "2": "2️⃣", "3": "3️⃣", "4": "4️⃣",
    "5": "5️⃣", "6": "6️⃣", "7": "7️⃣", "8": "8️⃣", "9": "9️⃣",
    " ": "   "
  };

  const emojiText = input.toLowerCase().split("")
    .map(char => emojiMap[char] || char)
    .join("");

  await Matrix.sendMessage(
    m.from,
    {
      text: `✨ Here's your emoji style:\n\n🔠 *${emojiText}*`,
      contextInfo: newsletterContext,
    },
    { quoted: m }
  );
};

export default emoji;
