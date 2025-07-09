import config from "../config.cjs";

async function doReact(emoji, m, Matrix) {
  try {
    await Matrix.sendMessage(m.key.remoteJid, {
      react: { text: emoji, key: m.key },
    });
  } catch (e) {
    console.error("❌ Reaction error:", e);
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

async function getGroupProfilePicture(jid, Matrix) {
  try {
    const ppUrl = await Matrix.profilePictureUrl(jid, "image");
    return ppUrl;
  } catch (error) {
    if (error.status === 404) {
      return null; // no profile picture set
    }
    console.error("Error fetching group profile picture:", error);
    return null;
  }
}

const getGcPpCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  if (!body.startsWith(prefix)) return;

  const parts = body.slice(prefix.length).trim().split(/ +/);
  const cmd = parts.shift().toLowerCase();

  if (!["getgcpp", "gcpp", "gcppic", "grouppp"].includes(cmd)) return;

  const jid = m.key.remoteJid;

  if (!jid.endsWith("@g.us")) {
    await Matrix.sendMessage(
      jid,
      {
        text: "❌ This command only works in group chats!",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  await doReact("🔍", m, Matrix);

  const ppUrl = await getGroupProfilePicture(jid, Matrix);

  if (!ppUrl) {
    await Matrix.sendMessage(
      jid,
      {
        text: "ℹ️ This group has no profile picture set.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  } else {
    await Matrix.sendMessage(
      jid,
      {
        image: { url: ppUrl },
        caption: "📸 Group profile picture",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

export default getGcPpCmd;
