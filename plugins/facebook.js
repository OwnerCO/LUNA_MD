import axios from "axios";
import config from "../config.cjs";

async function doReact(emoji, mek, Matrix) {
  try {
    await Matrix.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key },
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

const fbdl = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["fbdl", "fb", "facebook"].includes(cmd)) return;

  await doReact("📥", m, Matrix);

  const q = m.body.trim().slice(prefix.length + cmd.length).trim();

  if (!q) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "Hey hey! Please send me a Facebook video URL so I can fetch it for you. 😊",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }

  // Validate Facebook URL regex
  const fbRegex = /^(https?:\/\/)?(www\.|m\.)?(facebook\.com|fb\.watch)\/.+/i;
  if (!fbRegex.test(q)) {
    return Matrix.sendMessage(
      m.from,
      {
        text: "Oops! That doesn't look like a valid Facebook URL. Please check and send again! 😅",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }

  try {
    await Matrix.sendMessage(
      m.from,
      {
        text: "⏳ Hang tight! Fetching your Facebook video now... 🧙‍♀️✨",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );

    const apiUrl = `https://suhas-bro-api.vercel.app/download/fbdown?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result) {
      return Matrix.sendMessage(
        m.from,
        {
          text: "Hmm... I couldn't find that video. Please check the link or try again later. 🙈",
          contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
        },
        { quoted: m }
      );
    }

    const { thumb, title, desc, sd, hd } = data.result;
    const videoUrl = hd || sd;

    const infoMessage = `
╭─❀ FACEBOOK  ❀─╮

🌸 Title: ${title || "Oops, no title found!"}
✨ Description: ${desc || "Nothing much here, sorry~"}

🔗 Link: ${q}

╰─✨ LUNA MD ✨─╯
`.trim();

    await Matrix.sendMessage(
      m.from,
      {
        image: { url: thumb },
        caption: infoMessage,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );

    await Matrix.sendMessage(
      m.from,
      {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        caption: `📥 Here’s your Facebook video, enjoy! 💖\n\n— LUNA MD`,
        fileName: `facebook_video_${Date.now()}.mp4`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  } catch (error) {
    console.error("Facebook DL Error:", error);
    await Matrix.sendMessage(
      m.from,
      {
        text: "❌ Oops! Something went wrong while fetching your video. Please try again later, okay? 🌸",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

export default fbdl;
