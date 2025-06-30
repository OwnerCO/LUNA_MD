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

const couplepp = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["couplepp", "couple-pic", "couplepic", "coupleppic", "cpp"].includes(cmd)) return;

  await doReact("💑", m, Matrix);

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
    const { data } = await axios.get("https://apis.davidcyriltech.my.id/couplepp");

    if (!data?.male || !data?.female) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "❎ Couldn't fetch couple profile pictures.",
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    const caption = "Powered by LUNA MD 😇";

    await Matrix.sendMessage(
      m.from,
      {
        image: { url: data.male },
        caption: `*Male Profile Pic* \n\n${caption}`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );

    await Matrix.sendMessage(
      m.from,
      {
        image: { url: data.female },
        caption: `*Female Profile Pic* \n\n${caption}`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  } catch (e) {
    console.error("Error in couplepp:", e.message);
    await Matrix.sendMessage(
      m.from,
      {
        text: `❎ Error occurred: ${e.message}`,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }
};

export default couplepp;
