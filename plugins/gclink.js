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

const gclinkCmd = async (m, Matrix, isGroup, isBotAdmins, conn) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
    : "";

  if (!["gclink", "grouplink"].includes(cmd)) return;

  await doReact("🔗", m, Matrix);

  if (!isGroup) {
    return Matrix.sendMessage(
      m.from,
      { text: "❌ This command can only be used in groups.", contextInfo: newsletterContext },
      { quoted: m }
    );
  }

  if (!isBotAdmins) {
    return Matrix.sendMessage(
      m.from,
      { text: "❌ I need to be admin in this group to get the invite link.", contextInfo: newsletterContext },
      { quoted: m }
    );
  }

  try {
    const code = await conn.groupInviteCode(m.from);
    const link = `https://chat.whatsapp.com/${code}`;

    await Matrix.sendMessage(
      m.from,
      { text: `🔗 *Group Invite Link:*\n${link}`, contextInfo: newsletterContext },
      { quoted: m }
    );
  } catch (e) {
    console.error("Error getting group link:", e);
    await Matrix.sendMessage(
      m.from,
      { text: "❌ Sorry, I couldn't get the group invite link right now.", contextInfo: newsletterContext },
      { quoted: m }
    );
  }
};

export default gclinkCmd;
