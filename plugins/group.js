import fs from "fs";
import path from "path";
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

const updateDescCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  if (!body.startsWith(prefix)) return;

  const parts = body.slice(prefix.length).trim().split(/ +/);
  const cmd = parts.shift().toLowerCase();
  const newDesc = parts.join(" ").trim();

  // Only handle these aliases
  if (!["setdesc", "updesc", "groupdesc", "gd", "desc"].includes(cmd)) return;

  const jid = m.key.remoteJid;

  // Ensure it's a group
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

  // ✅ Check if sender is an admin
  const metadata = await Matrix.groupMetadata(jid);
  const admins = metadata.participants
    .filter((p) => p.admin !== null)
    .map((p) => p.id);

  const isSenderAdmin = admins.includes(m.sender);

  if (!isSenderAdmin) {
    await Matrix.sendMessage(
      jid,
      {
        text: "❌ Only *group admins* can update the group description.",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    return;
  }

  // React and prompt if no description is given
  await doReact("✏️", m, Matrix);
  if (!newDesc) {
    return Matrix.sendMessage(
      jid,
      {
        text: "❌ Please provide the new group description text.\n\n📌 *Example:* `.setdesc Welcome to our cool tech group!`",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }

  try {
    await Matrix.groupUpdateDescription(jid, newDesc);

    await Matrix.sendMessage(
      jid,
      {
        text: `✅ Group description updated successfully!`,
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
    await doReact("✅", m, Matrix);
  } catch (error) {
    console.error("UpdateDesc Error:", error);
    await doReact("❌", m, Matrix);
    await Matrix.sendMessage(
      jid,
      {
        text: "❌ Failed to update group description. Make sure I have admin rights!",
        contextInfo: { ...newsletterContext, mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  }
};

export default updateDescCmd;
