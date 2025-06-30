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

const calc = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "calc" && cmd !== "calculate") return;

  await doReact("🧮", m, Matrix);

  const args = m.body.trim().slice(prefix.length + cmd.length).trim();
  const expression = args;

  if (!expression || !expression.trim()) {
    return Matrix.sendMessage(
      m.from,
      { text: "Please provide a mathematical expression to calculate!" },
      { quoted: m }
    );
  }

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

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/tools/calculate?expr=${encodeURIComponent(expression)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.success || data.result === null) {
      return Matrix.sendMessage(
        m.from,
        { text: "Invalid mathematical expression or error in calculation!" },
        { quoted: m }
      );
    }

    await Matrix.sendMessage(
      m.from,
      { text: `Result: ${data.result}`, contextInfo: newsletterContext },
      { quoted: m }
    );
  } catch (error) {
    console.error(error);
    await Matrix.sendMessage(
      m.from,
      {
        text: "An error occurred while processing your request. Please try again later.",
      },
      { quoted: m }
    );
  }
};

export default calc;
