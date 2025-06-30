import axios from "axios";
import config from "../config.cjs";

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

const countryinfoCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["countryinfo", "cinfo", "country", "cinfo2"].includes(cmd)) return;

  await doReact("🌍", m, Matrix);

  const query = body.slice(prefix.length + cmd.length).trim();

  if (!query) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "❌ Please provide a country name.\nExample: `.countryinfo Pakistan`",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }

  try {
    const apiUrl = `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.data) {
      await doReact("❌", m, Matrix);
      return Matrix.sendMessage(
        m.from,
        {
          text: `❌ No information found for *${query}*. Please check the country name.`,
          contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
        },
        { quoted: m }
      );
    }

    const info = data.data;
    const neighborsText = info.neighbors.length > 0
      ? info.neighbors.map(n => `🌍 *${n.name}*`).join(", ")
      : "No neighboring countries found.";

    const text = `🌍 *Country Information: ${info.name}* 🌍\n\n` +
                 `🏛 *Capital:* ${info.capital}\n` +
                 `📍 *Continent:* ${info.continent.name} ${info.continent.emoji}\n` +
                 `📞 *Phone Code:* ${info.phoneCode}\n` +
                 `📏 *Area:* ${info.area.squareKilometers} km² (${info.area.squareMiles} mi²)\n` +
                 `🚗 *Driving Side:* ${info.drivingSide}\n` +
                 `💱 *Currency:* ${info.currency}\n` +
                 `🔤 *Languages:* ${info.languages.native.join(", ")}\n` +
                 `🌟 *Famous For:* ${info.famousFor}\n` +
                 `🌍 *ISO Codes:* ${info.isoCode.alpha2.toUpperCase()}, ${info.isoCode.alpha3.toUpperCase()}\n` +
                 `🌎 *Internet TLD:* ${info.internetTLD}\n\n` +
                 `🔗 *Neighbors:* ${neighborsText}`;

    await Matrix.sendMessage(
      m.from,
      {
        image: { url: info.flag },
        caption: text,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );

    await doReact("✅", m, Matrix);
  } catch (e) {
    console.error("Error in countryinfo command:", e);
    await doReact("❌", m, Matrix);
    await Matrix.sendMessage(
      m.from,
      {
        text: "❌ An error occurred while fetching country information. Please try again later.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

export default countryinfoCmd;
