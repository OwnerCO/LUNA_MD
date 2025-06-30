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

const epdownload = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  const aliases = ["epdownload", "epdl"];
  if (!aliases.includes(cmd)) return;

  await doReact("🥺", m, Matrix); // LUNA’s shy reaction

  const url = m.body.trim().slice(prefix.length + cmd.length).trim();
  if (!url) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "Umm... you forgot to give me a link 🥺\n*Usage:* `.epdownload <url>`",
      },
      { quoted: m }
    );
  }

  if (!url.includes("eporner.com")) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "Eurk! 😖 That doesn't look like an Eporner link...\nLUNA doesn’t like broken URLs.",
      },
      { quoted: m }
    );
  }

  try {
    const apiUrl = `https://nsfw-api-pinkvenom.vercel.app/api/eporner/download?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.download_link) {
      return Matrix.sendMessage(
        m.from,
        { text: "I-I couldn't find the download link... sorry! 😔" },
        { quoted: m }
      );
    }

    const message = `*🎥 Umm... here's your video...*\n\n🔗 *Link:* ${data.download_link}\n\nBe gentle with it... 😳`;

    await Matrix.sendMessage(
      m.from,
      {
        text: message,
      },
      { quoted: m }
    );
  } catch (err) {
    console.error("EPDownload Error:", err.message);
    await Matrix.sendMessage(
      m.from,
      {
        text: `Something went wrong... LUNA's blushing too hard to handle this 😣\n\`\`\`${err.message}\`\`\``,
      },
      { quoted: m }
    );
  }
};

export default epdownload;
