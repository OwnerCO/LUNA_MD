import config from "../config.cjs";
import axios from "axios";

// Helper: newsletter context for consistent metadata
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

// Main Meta AI handler
const metaAI = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["metaai", "meta", "ai4"].includes(cmd)) return;

  const query = m.body.trim().slice(prefix.length + cmd.length).trim() || "Hi";
  const ctx = getNewsletterContext([m.sender]);

  try {
    // React with robot emoji
    await Matrix.sendMessage(m.from, {
      react: { text: "🤖", key: m.key },
    });

    const apiUrl = `https://apis.davidcyriltech.my.id/ai/metaai?text=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.response) {
      return Matrix.sendMessage(
        m.from,
        { 
          text: "❌ Oopsie~ Meta AI didn't respond! Try again?",
          contextInfo: ctx
        },
        { quoted: m }
      );
    }

    // Special font formatting with emojis
    const formattedResponse = `
🤖 *𝐌𝐄𝐓𝐀 𝐀𝐈* ˢᵐᵃʳᵗ ᵃˢˢⁱˢᵗᵃⁿᵗ

╭─・─・─・─・─・─・─・─╮
│  ${data.response.replace(/\n/g, '\n│  ')}
╰─・─・─・─・─・─・─・─╯

💖 *Powered by LUNA MD* 😇
    `.trim();

    await Matrix.sendMessage(
      m.from,
      { 
        text: formattedResponse,
        contextInfo: ctx
      },
      { quoted: m }
    );

  } catch (e) {
    console.error("LUNA MD Meta AI error:", e);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❌ Oopsie~ Error: ${e.message}`,
        contextInfo: ctx,
      },
      { quoted: m }
    );
  }
};

export default metaAI;