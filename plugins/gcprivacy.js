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

const lockUnlockCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  if (!body.startsWith(prefix)) return;

  const parts = body.slice(prefix.length).trim().split(/ +/);
  const cmd = parts.shift().toLowerCase();

  const lockAliases = ["lock", "mute", "mutegroup", "setannounce", "announce"];
  const unlockAliases = ["unlock", "unmute", "unmutegroup", "unannounce", "openchat"];

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
        text: "❌ Only *group admins* can lock or unlock the group.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  let mode, statusMsg;
  if (lockAliases.includes(cmd)) {
    mode = "announcement";
    statusMsg = "🔒 Group locked: only admins can send messages.";
  } else if (unlockAliases.includes(cmd)) {
    mode = "not_announcement";
    statusMsg = "🔓 Group unlocked: everyone can send messages.";
  } else return;

  await doReact("⏳", m, Matrix);

  try {
    await Matrix.groupSettingUpdate(jid, mode);
    await Matrix.sendMessage(
      jid,
      {
        text: `✅ ${statusMsg}`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    await doReact("✅", m, Matrix);
  } catch (error) {
    console.error("Lock/Unlock Error:", error);
    await doReact("❌", m, Matrix);
    await Matrix.sendMessage(
      jid,
      {
        text: `❌ Failed to update group settings. Make sure I have admin rights!`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

export default lockUnlockCmd;
