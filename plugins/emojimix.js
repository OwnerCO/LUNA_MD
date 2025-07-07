import { Sticker, StickerTypes } from "wa-sticker-formatter";
import config from "../config.cjs";
import https from "https";
import http from "http";
import { URL } from "url";

// Replace `getBuffer` with custom function
async function getBuffer(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === "https:" ? https : http;

    lib.get(parsedUrl, (res) => {
      const data = [];

      res.on("data", chunk => data.push(chunk));
      res.on("end", () => resolve(Buffer.concat(data)));
    }).on("error", reject);
  });
}

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
    });
  } catch (err) {
    console.error("Reaction error:", err);
  }
}

function getCodePoint(emoji) {
  return emoji.codePointAt(0).toString(16);
}

const emix = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  const aliases = ["emix", "emomix", "emojimix"];
  if (!aliases.includes(cmd)) return;

  await doReact("😃", m, Matrix);

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

  if (!input.includes(",")) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "Hehe~ You need to give me *two emojis* separated by a comma 💕\n\n*Example:* `.emix 😂,🙂`",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }

  const [emoji1, emoji2] = input.split(",").map(e => e.trim());

  if (!emoji1 || !emoji2) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "Oops~ one of your emojis is missing 😅 Please try again like this:\n`.emix 🥺,😎`",
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }

  const emoji1CP = getCodePoint(emoji1);
  const emoji2CP = getCodePoint(emoji2);
  const apiUrl = `https://emojik.vercel.app/s/${emoji1CP}_${emoji2CP}?size=128`;

  try {
    const buffer = await getBuffer(apiUrl);
    if (!buffer) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "Aww~ I couldn't mix those two 😔 Try another combo, okay?",
          contextInfo: newsletterContext,
        },
        { quoted: m }
      );
    }

    const sticker = new Sticker(buffer, {
      pack: "LUNA EMOJI MIX",
      author: "LUNA MD",
      type: StickerTypes.FULL,
      categories: ["💖", "😄"],
      quality: 75,
      background: "transparent",
    });

    const stickerBuffer = await sticker.toBuffer();

    await Matrix.sendMessage(
      m.from,
      {
        sticker: stickerBuffer,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  } catch (e) {
    console.error("Error in emix command:", e.message);
    await Matrix.sendMessage(
      m.from,
      {
        text: `Uh-oh! Something broke 😖\n\n\`\`\`${e.message}\`\`\``,
        contextInfo: newsletterContext,
      },
      { quoted: m }
    );
  }
};

export default emix;
