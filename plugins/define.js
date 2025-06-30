import axios from "axios";
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

const define = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "define") return;

  await doReact("📖", m, Matrix);

  const query = m.body.trim().slice(prefix.length + cmd.length).trim();
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

  if (!query) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "Please provide a word to search for.",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }

  try {
    const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url);

    if (!data?.list?.length) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "❌ Word not found in the dictionary.",
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    const firstEntry = data.list[0];
    const definition = firstEntry.definition.replace(/\[/g, "").replace(/\]/g, "");
    const example = firstEntry.example
      ? `\n\n*Example:* ${firstEntry.example.replace(/\[/g, "").replace(/\]/g, "")}`
      : "";

    const message = `📖 *Word:* ${query}\n\n*Definition:* ${definition}${example}`;

    await Matrix.sendMessage(
      m.from,
      {
        text: message,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  } catch (error) {
    console.error("[ERROR] define command:", error.message);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❎ Error: ${error.message}`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }
};

export default define;
