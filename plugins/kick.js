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

const kickCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  if (!body.startsWith(prefix)) return;

  const parts = body.slice(prefix.length).trim().split(/ +/);
  const cmd = parts.shift().toLowerCase();

  if (cmd !== "kick") return;

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

  // ✅ Check if sender is admin
  const metadata = await Matrix.groupMetadata(jid);
  const admins = metadata.participants
    .filter((p) => p.admin !== null)
    .map((p) => p.id);

  const isSenderAdmin = admins.includes(m.sender);

  if (!isSenderAdmin) {
    await Matrix.sendMessage(
      jid,
      {
        text: "❌ Only *group admins* can use this command.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  // Check if message is a reply to someone
  const userToKick = m.message?.extendedTextMessage?.contextInfo?.participant;
  if (!userToKick) {
    await Matrix.sendMessage(
      jid,
      {
        text: "❌ Please *reply* to the user's message whom you want to kick.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  await doReact("⏳", m, Matrix);

  try {
    await Matrix.groupParticipantsUpdate(jid, [userToKick], "remove");

    await Matrix.sendMessage(
      jid,
      {
        text: `✅ Successfully kicked @${userToKick.split("@")[0]} from the group.`,
        contextInfo: { ...newsletterContext, mentionedJid: [userToKick, m.sender] },
      },
      { quoted: m }
    );

    await doReact("✅", m, Matrix);
  } catch (error) {
    console.error("Kick Error:", error);
    await doReact("❌", m, Matrix);
    await Matrix.sendMessage(
      jid,
      {
        text: "❌ Failed to kick user. Make sure I have *admin rights*!",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

export default kickCmd;
