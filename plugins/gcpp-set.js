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

const setGcPpCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  if (!body.startsWith(prefix)) return;

  const parts = body.slice(prefix.length).trim().split(/ +/);
  const cmd = parts.shift().toLowerCase();

  if (!["setgcpp", "setgcprofile", "setgpp", "setgrouppp"].includes(cmd)) return;

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

  // Check if sender is admin
  const metadata = await Matrix.groupMetadata(jid);
  const admins = metadata.participants
    .filter((p) => p.admin !== null)
    .map((p) => p.id);

  const isSenderAdmin = admins.includes(m.sender);
  if (!isSenderAdmin) {
    await Matrix.sendMessage(
      jid,
      {
        text: "❌ Only *group admins* can change the group profile picture.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  // Try to get the image buffer from:
  // 1. A replied-to image message
  // 2. Or image sent with this command

  let buffer;

  // Case 1: reply to image
  if (
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
  ) {
    const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
    const media = quotedMsg.imageMessage;

    buffer = await Matrix.downloadMediaMessage({
      message: { imageMessage: media },
      key: m.message.extendedTextMessage.contextInfo.stanzaId
        ? { id: m.message.extendedTextMessage.contextInfo.stanzaId }
        : undefined,
    });
  }
  // Case 2: image sent with command
  else if (m.message?.imageMessage) {
    buffer = await Matrix.downloadMediaMessage(m);
  }

  if (!buffer) {
    await Matrix.sendMessage(
      jid,
      {
        text: "❌ Please reply to an image or send an image with the command.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  await doReact("⏳", m, Matrix);

  try {
    await Matrix.updateProfilePicture(jid, buffer);

    await Matrix.sendMessage(
      jid,
      {
        text: "✅ Group profile picture updated successfully!",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    await doReact("✅", m, Matrix);
  } catch (error) {
    console.error("SetGcPp Error:", error);
    await doReact("❌", m, Matrix);
    await Matrix.sendMessage(
      jid,
      {
        text: "❌ Failed to update group profile picture. Make sure I have admin rights!",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

export default setGcPpCmd;
