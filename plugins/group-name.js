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

const updateNameCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  if (!body.startsWith(prefix)) return;

  const parts = body.slice(prefix.length).trim().split(/ +/);
  const cmd = parts.shift().toLowerCase();
  const newName = parts.join(" ").trim();

  // Only handle these aliases
  if (!["setname", "upname", "groupname", "gn", "name"].includes(cmd)) return;

  const jid = m.key.remoteJid;

  // Check if group chat
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
        text: "❌ Only *group admins* can update the group name.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  await doReact("✏️", m, Matrix);

  if (!newName) {
    return Matrix.sendMessage(
      jid,
      {
        text: "❌ Please provide the new group name.\n\n📌 *Example:* `.setname Awesome Tech Group`",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }

  try {
    // Update group subject (name)
    await Matrix.groupUpdateSubject(jid, newName);

    await Matrix.sendMessage(
      jid,
      {
        text: `✅ Group name updated successfully!`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    await doReact("✅", m, Matrix);
  } catch (error) {
    console.error("UpdateName Error:", error);
    await doReact("❌", m, Matrix);
    await Matrix.sendMessage(
      jid,
      {
        text: "❌ Failed to update group name. Make sure I have admin rights!",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

export default updateNameCmd;
